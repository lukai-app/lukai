import { redirect } from 'next/navigation';
import parsePhoneNumber from 'libphonenumber-js';

import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { lemonProductLink } from '@/lib/constants/lemon';
import { mixpanelServer } from '@/lib/tools/mixpanelServer';
import { normalizePhone } from '@/lib/helpers/normalizePhone';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Checkout(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const { user, cc } = searchParams as {
    user: string | undefined;
    cc: string | undefined;
  };

  if (!user) {
    mixpanelServer.track('on_checkout_page_error', {
      distinct_id: user,
      error: 'User not found',
    });

    redirect(
      getWhatsappBotLinkWithMessage(
        'Hola! quiero iniciar la suscripción premium en Apolo'
      )
    );
  }

  const parsedPhoneNumber = parsePhoneNumber(
    normalizePhone(user.startsWith('+') ? user : `+${user}`).real
  );

  if (!parsedPhoneNumber) {
    mixpanelServer.track('on_checkout_page_error', {
      distinct_id: user,
      error: 'Invalid phone number',
    });

    redirect(
      getWhatsappBotLinkWithMessage(
        'Hola! hubo un error al iniciar la suscripción, necesito ayuda con eso'
      )
    );
  }

  const phoneNumber = parsedPhoneNumber.number;
  const countryCode = cc ?? parsedPhoneNumber.country;

  mixpanelServer.track('checkout_started', {
    distinct_id: phoneNumber,
    phone_number: phoneNumber,
    country_code: countryCode,
    source: 'checkout_page',
  });

  const checkoutLink = `${lemonProductLink}?checkout[custom][phone_number]=${phoneNumber}&checkout[billing_address][country]=${countryCode}`;

  redirect(checkoutLink);
}
