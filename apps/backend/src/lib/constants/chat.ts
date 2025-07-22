export const WHATSAPP_BOT_LINK =
  'https://wa.me/51977504342?text=Hi!!%20How%20can%20I%20start%20to%20use%20apollo?';

// https://wa.me/51977504342?text=hola%21%21%20como%20puedo%20empezar%20a%20usar%20Apolo

export const getWhatsappBotLinkWithMessage = (message: string) => {
  return `https://wa.me/51977504342?text=${encodeURIComponent(message)}`;
};

export const ADMIN_PHONE_NUMBER = '51989009435';
