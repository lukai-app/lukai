import crypto from 'crypto';

import { env } from '../../../env';

export function verifyWebhook(message: string, signature: string): boolean {
  const prefix = 'sha256=';
  if (!signature.startsWith(prefix)) {
    return false;
  }
  const sigWithoutPrefix = signature.slice(prefix.length);

  const hmac = crypto.createHmac('sha256', env.WHATSAPP_WEBHOOK_TOKEN);
  const messageHash = hmac.update(message).digest('hex');

  const digest = Buffer.from(messageHash, 'utf8');
  const sig = Buffer.from(sigWithoutPrefix, 'utf8');

  if (!crypto.timingSafeEqual(digest as any, sig as any)) {
    return false;
  } else {
    return true;
  }
}
