import fs from 'fs';
import { env } from '../../../env';
import { Request, Response } from 'express';
import clm from 'country-locale-map';
import parsePhoneNumber from 'libphonenumber-js';

import { upsertUser } from '../../../utils/upsertUser';
import { handleError } from '../../../utils/handleError';

import { downloadMedia, sendMessage } from '../../../lib/tools/whatsapp';
import { WhatsappWebhookRequestBody } from '../../../lib/tools/whatsapp/types';

import { verifyWebhook } from './verifyWebhook';
import { submitUserMessage } from './submitUserMessage';

import {
  countryCodeToCurrencyCode,
  countryCodeToLanguageCode,
  countryCodeToTimezone
} from '../../../lib/helpers/currency';
import { normalizePhone } from '../../../lib/helpers/normalizePhone';
import { mixpanelServer } from '../../../lib/tools/mixpanel';
import { arrayBufferToBase64 } from '../../../lib/helpers/files';
import {
  CHAT_GPT4_MINI_TRANSCRIBE_MODEL,
  openai
} from '../../../lib/tools/openai';

// one liner of AI financial manager: Add expenses and incomes, get weekly reports, and track spending insights.
export async function whatsappPostWebhook(
  request: Request,
  response: Response
) {
  let guess_phone_number = 'unknown';
  try {
    const xHubSigrature256 = request.headers['x-hub-signature-256'] as string;

    // Express already parses the body, so we can use it directly
    if (
      !xHubSigrature256 ||
      !verifyWebhook(JSON.stringify(request.body), xHubSigrature256)
    ) {
      console.log(`Invalid signature : ${xHubSigrature256}`);
      //return new NextResponse(null, { status: 200 });
    }

    const body = request.body as WhatsappWebhookRequestBody;

    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const parsedPhoneNumber = parsePhoneNumber(
        normalizePhone(`+${body.entry[0].changes[0].value.messages[0].from}`)
          .real
      );

      if (!parsedPhoneNumber) {
        throw new Error(
          `Invalid phone number: ${body.entry[0].changes[0].value.messages[0].from}`
        );
      }

      // en base al número, intentaremos adivinar su idioma y moneda favorita
      const phoneNumber = parsedPhoneNumber.number;
      guess_phone_number = phoneNumber;

      const countryCode = parsedPhoneNumber.country;
      const language = countryCode
        ? countryCodeToLanguageCode(countryCode)
        : 'es';
      const currencyCode = countryCode
        ? countryCodeToCurrencyCode(countryCode) ?? 'USD'
        : 'USD';
      const locale = countryCode
        ? clm.getLocaleByAlpha2(countryCode)
          ? clm.getLocaleByAlpha2(countryCode).replace('_', '-')
          : 'es-PE'
        : 'es-PE';
      const timezone = countryCode
        ? countryCodeToTimezone(countryCode) ?? 'America/Lima'
        : 'America/Lima';
      const contactName = body.entry[0].changes[0].value.contacts
        ? body.entry[0].changes[0].value.contacts[0].profile.name
        : null;

      console.log('inference result:', {
        favorite_language: language,
        favorite_currency_code: currencyCode,
        favorite_locale: locale,
        favorite_timezone: timezone,
        country_code: countryCode
      });

      const messageType = body.entry[0].changes[0].value.messages[0].type; // extract the message type from the webhook payload

      const user = await upsertUser({
        phoneNumber: phoneNumber, // add the + sign to the phone number because whatsapp doesn't send it
        name: contactName ?? undefined,
        favorite_language: language,
        favorite_currency_code: currencyCode,
        favorite_locale: locale,
        favorite_timezone: timezone,
        country_code: countryCode,
        source: 'whatsapp'
      });

      if (messageType === 'text') {
        let msg_body = body.entry[0].changes[0].value.messages[0].text?.body; // extract the message text from the webhook payload

        if (!msg_body) {
          throw new Error('No message body on message of user ' + phoneNumber);
        }

        mixpanelServer.track('user_sent_message', {
          distinct_id: phoneNumber,
          fecha_hora: new Date(),
          canal: 'whatsapp',
          mp_country_code: user.country_code,
          country_code: user.country_code
        });

        const responseMessage = await submitUserMessage({
          content: msg_body,
          user,
          chatId: user.chatId
        });

        //console.log('responseMessage', responseMessage);

        await sendMessage(phoneNumber, responseMessage);
      } else if (messageType === 'image') {
        const mediaId = body.entry[0].changes[0].value.messages[0].image?.id;
        const mediaCaption =
          body.entry[0].changes[0].value.messages[0].image?.caption;
        //const msg_body = body.entry[0].changes[0].value.messages[0].text?.body;
        console.log('mediabody', body.entry[0].changes[0].value.messages[0]);

        if (!mediaId) {
          throw new Error(
            'No media id on image message of user ' + phoneNumber
          );
        }

        console.log('downloading media', mediaId);
        const mediaArrayBuffer = await downloadMedia(mediaId);

        const mediaBase64 = arrayBufferToBase64(mediaArrayBuffer);

        console.log('media downloaded, sending to openai');

        const responseMessage = await submitUserMessage({
          content:
            `${mediaCaption ? `user caption: ${mediaCaption}\n` : ''}` +
            'instructions: analize the image, if it is about a expense and run the respective tool to register it',
          user,
          chatId: user.chatId,
          image_url: `data:image/jpeg;base64,${mediaBase64}`
        });

        await sendMessage(phoneNumber, responseMessage);
      } else if (messageType === 'audio') {
        console.log(
          'audio message body',
          body.entry[0].changes[0].value.messages[0]
        );
        const audioId = body.entry[0].changes[0].value.messages[0].audio?.id;

        if (!audioId) {
          throw new Error(
            'No media id on image message of user ' + phoneNumber
          );
        }

        const audioArrayBuffer = await downloadMedia(audioId);

        const tempFilePath = `/tmp/audio-${audioId}.ogg`;
        await fs.promises.writeFile(
          tempFilePath,
          new Uint8Array(audioArrayBuffer)
        );

        const audioFileStream = fs.createReadStream(tempFilePath);

        const transcription = await openai.audio.transcriptions.create({
          file: audioFileStream,
          model: CHAT_GPT4_MINI_TRANSCRIBE_MODEL
        });

        await fs.promises.unlink(tempFilePath);

        const transcriptionText = transcription.text;

        const responseMessage = await submitUserMessage({
          content: transcriptionText,
          user,
          chatId: user.chatId
        });

        await sendMessage(phoneNumber, responseMessage);
      }

      return response.send({
        success: true
      });
    } else {
      console.log('No messages');
      console.log(body.entry[0].changes[0]);
      return response.json({
        success: true
      });
    }
  } catch (error) {
    await handleError({
      error,
      userId: guess_phone_number,
      endpoint: 'whatsapp.post',
      message: 'Error in whatsapp webhook'
    });
    return response.json({ success: false });
  }
}

export async function whatsappGetWebhook(request: Request, response: Response) {
  const verify_token = env.WHATSAPP_WEBHOOK_TOKEN;

  const searchParams = request.query;
  const mode = searchParams['hub.mode'] as string;
  const token = searchParams['hub.verify_token'] as string;
  const challenge = searchParams['hub.challenge'] as string;

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return response.send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      console.log('WEBHOOK_NOT_VERIFIED');
      return response.status(403).send({
        success: false
      });
    }
  } else {
    return response.status(400).send({
      success: false
    });
  }
}
