enum WhatsappMessageType {
  button = 'button',
  document = 'document',
  text = 'text',
  image = 'image',
  interactive = 'interactive',
  order = 'order',
  sticker = 'sticker',
  unknown = 'unknown',
  video = 'video',
  audio = 'audio'
}

export type WhatsappWebhookRequestBody = {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts:
          | {
              profile: {
                name: string;
              };
              wa_id: string;
            }[]
          | null;
        messages:
          | {
              from: string;
              id: string;
              timestamp: string;
              text: {
                body: string;
              } | null;
              image: {
                caption: string | null;
                sha256: string;
                id: string;
                mime_type: string;
              } | null;
              audio: {
                id: string;
                mime_type: string;
                sha256: string;
              } | null;
              type: keyof typeof WhatsappMessageType;
            }[]
          | null;
        statuses:
          | [
              {
                id: string;
                status: string;
                timestamp: string;
                recipient_id: string;
                errors: [[Object]];
              }
            ]
          | null;
      };
      field: string;
    }[];
  }[];
};
