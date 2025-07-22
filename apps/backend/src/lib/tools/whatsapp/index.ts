import axios from 'axios';
import { env } from '../../../env';

export const sendMessage = async (to: string, message: string) => {
  return await axios.post(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_SENDER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`
      }
    }
  );
};

export const sendTemplate = async (params: {
  to: string;
  templateName: string;
  params: Array<string>;
  language?: string;
}) => {
  return await axios.post(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_SENDER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'template',
      template: {
        name: params.templateName,
        language: {
          code: params.language ?? 'es'
        },
        components: [
          {
            type: 'body',
            parameters: params.params.map((param) => ({
              type: 'text',
              text: param
            }))
          }
        ]
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`
      }
    }
  );
};

export const sendImage = async (to: string, imageUri: string) => {
  await axios.post(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_SENDER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'image',
      image: {
        link: imageUri
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`
      }
    }
  );
};

export const sendButtonMessage = async (
  to: string,
  text: string,
  buttonText: string,
  buttonUrl: string
) => {
  return await axios.post(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_SENDER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: text
        },
        action: {
          buttons: [
            {
              type: 'url',
              url: buttonUrl,
              title: buttonText
            }
          ]
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`
      }
    }
  );
};

interface Media {
  messaging_product: string;
  url: string;
  mime_type: string;
  sha256: string;
  file_size: string;
  id: string;
}

export const retrieveMediaURL = async (mediaId: string) => {
  const response = await axios.get<Media>(
    `https://graph.facebook.com/v19.0/${mediaId}/`,
    {
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`
      }
    }
  );

  return response.data;
};

export const downloadMedia = async (mediaId: string): Promise<ArrayBuffer> => {
  const media = await retrieveMediaURL(mediaId);

  const response = await axios.get(media.url, {
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`
    },
    responseType: 'arraybuffer'
  });

  return response.data;
};
