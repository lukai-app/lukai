import crypto from 'crypto';
import { Request, Response } from 'express';

import { env } from '../../../env';
import prisma from '../../../lib/prisma';
import { handleError } from '../../../utils/handleError';
import {
  SubscriptionObject,
  SubscriptionInvoiceObject,
  WebhookEvent,
  dictionary
} from '../../../lib/tools/lemon';
import { upsertUser } from '../../../utils/upsertUser';
import { sendTemplate } from '../../../lib/tools/whatsapp';
import { mixpanelServer } from '../../../lib/tools/mixpanel';
import { submitAgentMessage } from '../whatsapp/submitAgentMessage';

interface WebhookObject {
  meta: {
    event_name: string;
    custom_data: {
      phone_number?: string;
    };
  };
  data: SubscriptionObject | SubscriptionInvoiceObject;
}

export async function postLemonWebhook(request: Request, response: Response) {
  try {
    const rawBody = JSON.stringify(request.body);
    const secret = env.LEMON_WEBHOOK_SIGNING_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(request.get('X-Signature') || '', 'utf8');

    if (digest && signature) {
      // Convert both buffers to Uint8Array for comparison
      const digestArray = new Uint8Array(digest);
      const signatureArray = new Uint8Array(signature);

      if (!crypto.timingSafeEqual(digestArray, signatureArray)) {
        //throw new Error('Invalid signature.');
        console.log('Invalid signature.');
      }
    } else {
      console.log('No signature or digest', request.headers);
    }

    const body = JSON.parse(rawBody) as WebhookObject;

    // validate that event is some of the WebhookEvent
    if (!Object.keys(WebhookEvent).includes(body.meta.event_name)) {
      throw new Error('Event not supported');
    }

    // based on data.type, validate that data is a SubscriptionObject(subscriptions) or SubscriptionInvoiceObject(subscription-invoices)
    if (
      body.data.type !== 'subscriptions' &&
      body.data.type !== 'subscription-invoices'
    ) {
      throw new Error('Data type not supported');
    }

    // switch based on event
    if (body.meta.event_name === WebhookEvent.subscription_created) {
      const createdData = body.data as SubscriptionObject;
      const subscriptionId = createdData.id;
      const {
        product_id,
        variant_id,
        customer_id,
        user_email,
        status,
        trial_ends_at,
        renews_at,
        ends_at,
        card_brand,
        card_last_four
      } = createdData.attributes;

      // validate that meta.custom_data.phone_number exists
      if (!body.meta.custom_data.phone_number) {
        throw new Error('Phone number not found');
      }

      const phoneNumber = body.meta.custom_data.phone_number.startsWith('+')
        ? body.meta.custom_data.phone_number
        : `+${body.meta.custom_data.phone_number}`;

      let contact = await prisma.contact.findUnique({
        where: { phone_number: phoneNumber }
      });

      if (!contact) {
        contact = await upsertUser({
          phoneNumber,
          source: 'lemon'
        });
      }

      await prisma.subscription.create({
        data: {
          contact: { connect: { id: contact.id } },
          subscription_id: subscriptionId,
          product_id: product_id ? product_id.toString() : null,
          variant_id: variant_id ? variant_id.toString() : null,
          customer_id: customer_id ? customer_id.toString() : null,
          user_email: user_email,
          status: status as any,
          trial_ends_at: trial_ends_at ? new Date(trial_ends_at) : null,
          renews_at: new Date(renews_at),
          ends_at: ends_at ? new Date(ends_at) : null,
          card_brand: card_brand,
          card_last_four: card_last_four
        }
      });

      await sendTemplate({
        to: phoneNumber,
        templateName: 'subscription_update_notification',
        params: [contact.name ?? '🙌', dictionary['ES'].subscription_created]
      });

      await submitAgentMessage({
        chatId: contact.chatId,
        content: dictionary['ES'].subscription_created,
        user: contact
      });

      sendTemplate({
        to: env.WHATSAPP_ADMIN_NUMBER,
        templateName: 'admin_suscripcion_evento',
        params: [body.meta.event_name, contact.phone_number]
      });

      mixpanelServer.track('subscription_created', {
        distinct_id: phoneNumber,
        email: user_email,
        mp_country_code: contact.country_code,
        country_code: contact.country_code
      });
    } else if (
      body.meta.event_name === WebhookEvent.subscription_updated ||
      body.meta.event_name === WebhookEvent.subscription_resumed ||
      body.meta.event_name === WebhookEvent.subscription_unpaused ||
      body.meta.event_name === WebhookEvent.subscription_cancelled ||
      body.meta.event_name === WebhookEvent.subscription_expired ||
      body.meta.event_name === WebhookEvent.subscription_paused
    ) {
      const updatedData = body.data as SubscriptionObject;
      const subscriptionId = updatedData.id;
      const {
        product_id,
        variant_id,
        customer_id,
        user_email,
        status,
        renews_at,
        ends_at,
        card_brand,
        card_last_four
      } = updatedData.attributes;

      // check if subscription exists
      let subscription = await prisma.subscription.findUnique({
        where: { subscription_id: subscriptionId },
        include: {
          contact: true
        }
      });

      if (!subscription) {
        throw new Error('Subscription not found for ' + subscriptionId);
      }

      subscription = await prisma.subscription.update({
        where: { subscription_id: subscriptionId },
        data: {
          subscription_id: subscriptionId,
          product_id: product_id ? product_id.toString() : null,
          variant_id: variant_id ? variant_id.toString() : null,
          customer_id: customer_id ? customer_id.toString() : null,
          user_email: user_email,
          status: status as any,
          renews_at: renews_at ? new Date(renews_at) : null,
          ends_at: ends_at ? new Date(ends_at) : null,
          card_brand: card_brand,
          card_last_four: card_last_four
        },
        include: {
          contact: true
        }
      });

      if (body.meta.event_name === WebhookEvent.subscription_updated) {
        await sendTemplate({
          to: subscription.contact.phone_number,
          templateName: 'subscription_update_notification',
          params: [
            subscription.contact.name ?? '🙌',
            dictionary['ES'][body.meta.event_name]
          ]
        });

        await submitAgentMessage({
          chatId: subscription.contact.chatId,
          content: dictionary['ES'][body.meta.event_name],
          user: subscription.contact
        });
      }

      sendTemplate({
        to: env.WHATSAPP_ADMIN_NUMBER,
        templateName: 'admin_suscripcion_evento',
        params: [body.meta.event_name, subscription.contact.phone_number]
      });

      mixpanelServer.track(`${body.meta.event_name}`, {
        distinct_id: subscription.contact.phone_number,
        email: user_email,
        mp_country_code: subscription.contact.country_code,
        country_code: subscription.contact.country_code
      });
    } else if (
      body.meta.event_name === WebhookEvent.subscription_payment_failed
    ) {
      // payment failed
      sendTemplate({
        to: env.WHATSAPP_ADMIN_NUMBER,
        templateName: 'admin_suscripcion_evento',
        params: [body.meta.event_name, body.meta.custom_data.phone_number]
      });
    } else if (
      body.meta.event_name === WebhookEvent.subscription_payment_success
    ) {
      mixpanelServer.track('subscription_payment_success', {
        distinct_id: body.meta.custom_data.phone_number.startsWith('+')
          ? body.meta.custom_data.phone_number
          : `+${body.meta.custom_data.phone_number}`,
        email: body.data.attributes.user_email,
        fecha_hora: new Date()
      });

      const celebrationMessages = [
        "🥹 Someone out there just said \"yes\" to everything we're building. It's not just a payment. It's another proof that it's worth it.",
        '🚀 Every time someone makes a payment, it feels like the universe gives us a little signal: "You\'re doing great, keep going."',
        "🔥 This isn't just a payment. It's validation. It's momentum. It's someone betting on what we are.",
        "💫 There's a story behind every user who pays. Today, another story crosses paths with ours.",
        "💡 When you see this, remember: someone chose to invest in what you've built with your own hands. What a gift.",
        "🧠 The idea that was born in your head just became a real transaction. It's magic, but it's also hard work.",
        "❤️ Today, someone decided that what you've created matters to them. There's no better metric than that."
      ];

      // payment success
      await sendTemplate({
        to: env.WHATSAPP_ADMIN_NUMBER,
        templateName: 'admin_payment_success_celebration',
        language: 'en',
        params: [
          body.meta.custom_data.phone_number +
          (body.data.attributes as any).total_usd
            ? ` ($${(body.data.attributes as any).total_usd / 100} USD)` // because it's cents
            : '',
          celebrationMessages[
            Math.floor(Math.random() * celebrationMessages.length)
          ]
        ]
      });
    } else if (
      body.meta.event_name === WebhookEvent.subscription_payment_recovered
    ) {
      // payment recovered
      sendTemplate({
        to: env.WHATSAPP_ADMIN_NUMBER,
        templateName: 'admin_suscripcion_evento',
        params: [body.meta.event_name, body.meta.custom_data.phone_number]
      });
    } else if (
      body.meta.event_name === WebhookEvent.subscription_payment_refunded
    ) {
      // payment refunded
      sendTemplate({
        to: env.WHATSAPP_ADMIN_NUMBER,
        templateName: 'admin_suscripcion_evento',
        params: [body.meta.event_name, body.meta.custom_data.phone_number]
      });
    } else {
      throw new Error(
        'Event not supported, but it should be: ' + body.meta.event_name
      ); // this should never happen
    }

    return response.json({
      success: true
    });
  } catch (error) {
    handleError({
      error,
      userId: undefined,
      endpoint: 'webhooks.lemon',
      message:
        'Error at webhooks.lemon with body: ' + JSON.stringify(request.body)
    });

    return response.json({
      success: false
    });
  }
}
