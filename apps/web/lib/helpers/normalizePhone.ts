export const normalizePhone = (phoneNumber: string) => {
  // function that return an object with the whatsapp number and the real number

  /*
  - Mexico:
    - whatsapp: +5219841056553 (db) → real: +529841056553
  - Argentina:
    - whatsapp: +5491154933738 (db) → real: +541154933738
  - Brazil:
    - whatsapp: +55912345678 (db) → real: +5512345678
  - Colombia:
    - whatsapp: +57312345678 (db) → real: +5712345678
  */

  const isMexico = phoneNumber.startsWith('+52');
  const isArgentina = phoneNumber.startsWith('+54');
  const isBrazil = phoneNumber.startsWith('+55');
  const isColombia = phoneNumber.startsWith('+57');

  if (isMexico) {
    const isWhatsApp = phoneNumber.startsWith('+521');

    if (isWhatsApp) {
      // starts with +521
      return {
        whatsapp: phoneNumber,
        real: phoneNumber.replace('+521', '+52'),
      };
    } else {
      // starts with +52
      return {
        whatsapp: phoneNumber.replace('+52', '+521'),
        real: phoneNumber,
      };
    }
  } else if (isArgentina) {
    const isWhatsApp = phoneNumber.startsWith('+549');

    if (isWhatsApp) {
      // starts with +549
      return {
        whatsapp: phoneNumber,
        real: phoneNumber.replace('+549', '+54'),
      };
    } else {
      // starts with +54
      return {
        whatsapp: phoneNumber.replace('+54', '+549'),
        real: phoneNumber,
      };
    }
  } else if (isBrazil) {
    // In Brazil, WhatsApp numbers have a '9' prefix after the country code
    const withoutCountryCode = phoneNumber.slice(3); // Remove +55
    const isWhatsApp = withoutCountryCode.startsWith('9');

    if (isWhatsApp) {
      return {
        whatsapp: phoneNumber,
        real: '+55' + withoutCountryCode.slice(1), // Remove the 9
      };
    } else {
      return {
        whatsapp: '+55' + '9' + withoutCountryCode,
        real: phoneNumber,
      };
    }
  } else if (isColombia) {
    // In Colombia, mobile numbers (used for WhatsApp) start with 3
    const withoutCountryCode = phoneNumber.slice(3); // Remove +57
    const isWhatsApp = withoutCountryCode.startsWith('3');

    if (isWhatsApp) {
      return {
        whatsapp: phoneNumber,
        real: phoneNumber,
      };
    } else {
      return {
        whatsapp: '+57' + '3' + withoutCountryCode,
        real: phoneNumber,
      };
    }
  } else {
    return {
      whatsapp: phoneNumber,
      real: phoneNumber,
    };
  }
};
