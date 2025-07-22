import { env } from 'process';

export const lemonProductLink =
  env.CUSTOM_NODE_ENV === 'development'
    ? //? 'https://apolochat.lemonsqueezy.com/buy/82a53494-4566-489d-91a1-ef804a53d21d'
      'https://apolochat.lemonsqueezy.com/buy/d0ff36fe-666b-4479-88cd-c33344106544'
    : 'https://apolochat.lemonsqueezy.com/buy/d0ff36fe-666b-4479-88cd-c33344106544';
