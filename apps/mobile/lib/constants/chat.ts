export const WHATSAPP_BOT_LINK =
  'https://wa.me/51977504342?text=Hola!!%20%C2%BFQu%C3%A9%20debo%20hacer%20para%20empezar%20a%20usar%20apollo?';

export const getWhatsappBotLinkWithMessage = (message: string) => {
  return `https://wa.me/51977504342?text=${encodeURIComponent(message)}`;
};

export const ADMIN_PHONE_NUMBER = '51989009435';
