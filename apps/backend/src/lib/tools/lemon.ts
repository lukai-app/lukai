import Axios from 'axios';
import { env } from '../../env';

const API_BASE_URL = 'https://api.lemonsqueezy.com';

export const lemon = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`
  }
});

export const lemonProductLink =
  env.CUSTOM_NODE_ENV === 'development'
    ? //? 'https://apolochat.lemonsqueezy.com/buy/82a53494-4566-489d-91a1-ef804a53d21d'
      'https://apolochat.lemonsqueezy.com/buy/d0ff36fe-666b-4479-88cd-c33344106544'
    : 'https://apolochat.lemonsqueezy.com/buy/d0ff36fe-666b-4479-88cd-c33344106544';

export const customCheckoutLink = `${env.CLIENT_BASE_URL}/checkout`;

export enum WebhookEvent {
  subscription_created = 'subscription_created',
  subscription_updated = 'subscription_updated',
  subscription_cancelled = 'subscription_cancelled',
  subscription_resumed = 'subscription_resumed',
  subscription_expired = 'subscription_expired',
  subscription_paused = 'subscription_paused',
  subscription_unpaused = 'subscription_unpaused',
  subscription_payment_failed = 'subscription_payment_failed',
  subscription_payment_success = 'subscription_payment_success',
  subscription_payment_recovered = 'subscription_payment_recovered',
  subscription_payment_refunded = 'subscription_payment_refunded'
}

export interface SubscriptionObject {
  type: 'subscriptions';
  id: string;
  attributes: {
    store_id: number;
    customer_id: number;
    order_id: number | null;
    order_item_id: number | null;
    product_id: number | null;
    variant_id: number | null;
    product_name: string | null;
    variant_name: string | null;
    user_name: string | null;
    user_email: string | null;
    status: string;
    status_formatted: string;
    card_brand: string | null;
    card_last_four: string | null;
    pause: null;
    cancelled: boolean;
    trial_ends_at: string | null;
    billing_anchor: number;
    first_subscription_item: {
      id: number;
      subscription_id: number;
      price_id: number;
      quantity: number;
      created_at: string;
      updated_at: string;
    };
    urls: {
      update_payment_method: string;
      customer_portal: string;
    };
    renews_at: string;
    ends_at: null;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
}

export interface SubscriptionInvoiceObject {
  type: 'subscription-invoices';
  id: string;
  attributes: {
    store_id: number;
    subscription_id: number;
    customer_id: number;
    user_name: string;
    user_email: string;
    billing_reason: string;
    card_brand: string;
    card_last_four: string;
    currency: string;
    currency_rate: string;
    status: string;
    status_formatted: string;
    refunded: boolean;
    refunded_at: null;
    subtotal: number;
    discount_total: number;
    tax: number;
    total: number;
    subtotal_usd: number;
    discount_total_usd: number;
    tax_usd: number;
    total_usd: number;
    subtotal_formatted: string;
    discount_total_formatted: string;
    tax_formatted: string;
    total_formatted: string;
    urls: {
      invoice_url: string;
    };
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
  relationships: {
    store: {
      links: {
        related: string;
        self: string;
      };
    };
    subscription: {
      links: {
        related: string;
        self: string;
      };
    };
    customer: {
      links: {
        related: string;
        self: string;
      };
    };
  };
}

export const dictionary = {
  EN: {
    subscription_created: `🎉 Great news! Your subscription to our expense tracking service has been successfully created. Start enjoying the benefits today! 💸`,
    subscription_updated: `🚀 Exciting Update! Your subscription details have been updated. Stay tuned for even better expense tracking features! 💼`,
    subscription_resumed: `🔄 Welcome back! Your subscription is now active again. Continue managing your expenses effortlessly with our WhatsApp bot! 📊`,
    subscription_unpaused: `🚀 Unpause Success! Your subscription is no longer on hold. Dive back into seamless expense tracking now! 💳`,
    subscription_cancelled: `😢 We're sad to see you go! Your subscription has been canceled. Feel free to rejoin us anytime for top-notch expense tracking! 📉`,
    subscription_expired: `⏰ Subscription Expired! Your subscription has come to an end. Renew now to keep the financial insights flowing! 🔄`,
    subscription_paused: `⏸ Subscription Paused! Taking a break? No worries. Resume your expense tracking journey whenever you're ready! 🛌`
  },
  ES: {
    subscription_created: `🎉 Tu suscripción fue creada con éxito. Ya puedes comenzar a registrar tus gastos.`,
    subscription_resumed: `🔄 Has reactivado tu suscripción. ¡Seguimos ayudándote a llevar el control de tus gastos!`,
    subscription_unpaused: `🚀 Tu suscripción ya no está en pausa. Puedes volver a usar el bot como siempre.`,
    subscription_cancelled: `😢 Tu suscripción ha sido cancelada. Puedes volver cuando quieras, estaremos aquí.`,
    subscription_expired: `⏰ Tu suscripción ha vencido. Renuévala para seguir registrando tus gastos sin perder el ritmo.`,
    subscription_paused: `⏸ Tu suscripción ha sido pausada. Puedes reactivarla cuando estés listo para continuar.`
  }
};
