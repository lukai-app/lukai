import {
  accounts,
  contact,
  expense_category,
  subscription
} from '@prisma/client';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionUserMessageParam
} from 'openai/resources';

import DayjsSingleton from '../../../lib/helpers/Dayjs';
import {
  CHAT_GPT4_MINI_MODEL,
  //CHAT_GPT4_NANO_MODEL,
  //CHAT_GPT4_MODEL,
  openai
} from '../../../lib/tools/openai';
import { getChat, saveChat } from '../../../lib/tools/ai/chat-storage';

import { available_tools, toolToFunction } from './tools';
import {
  apolloExpenseAgent,
  getAgentTools,
  inactiveSubscriptionAgent,
  preSubscriptionAgent
} from './agents';
import { generateNextDays, generatePastDays } from './utils';
import { decryptPermanentKey } from '../../../utils/encryption';
import { env } from '../../../env';
import { mixpanelServer } from '../../../lib/tools/mixpanel';

function getValidMessages(messages: ChatCompletionMessageParam[]) {
  const maxMessages = 10;
  let validMessages = messages.slice(-maxMessages); // Toma los últimos 10 mensajes

  // Asegurarse de que el primer mensaje no tenga el rol 'tool'
  let index = messages.length - maxMessages;

  while (
    validMessages.length > 0 &&
    validMessages[0].role === 'tool' &&
    index > 0
  ) {
    index--; // Mover hacia atrás en la lista de mensajes
    validMessages = messages.slice(index, messages.length); // Actualizar el rango de mensajes
  }

  return validMessages;
}

export type UserContextForChat = contact & {
  subscription: subscription | null;
  expense_categories: expense_category[];
  income_categories: expense_category[];
  accounts: accounts[];
};

export async function submitUserMessage({
  content,
  chatId,
  user,
  image_url
}: {
  content: string;
  chatId: string;
  user: UserContextForChat;
  image_url?: string;
}) {
  const model = CHAT_GPT4_MINI_MODEL;
  const dayjs = DayjsSingleton.getInstance(user.favorite_locale ?? 'es-PE');

  const currentDateAndTimeInUserTimezone = user.favorite_timezone
    ? dayjs()
        .tz(user.favorite_timezone)
        .format('dddd, DD [de] MMMM YYYY HH:mm:ss')
    : dayjs().format('dddd, DD [de] MMMM YYYY HH:mm:ss');

  let chat = await getChat({
    id: chatId,
    userId: user.id
  });

  if (!chat) {
    chat = {
      id: chatId,
      title: `Chat con ${user.name}`,
      createdAt: new Date(),
      userId: user.id,
      messages: []
    };

    mixpanelServer.track('primer_mensaje_enviado', {
      canal: 'whatsapp',
      mensaje_inicial: content,
      fecha_hora: new Date(),
      distinct_id: user.phone_number,
      mp_country_code: user.country_code,
      country_code: user.country_code
    });
  }

  const sanitizedName = (user.name ?? 'usuario')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  const locale = user.favorite_locale ?? 'es-PE';
  const userTimezone = user.favorite_timezone ?? 'America/Lima';

  const pastDays = generatePastDays({
    locale,
    userTimezone
  });

  const nextDays = generateNextDays({
    locale,
    userTimezone
  });

  const messages = [
    ...chat.messages,
    {
      role: 'user',
      content: image_url
        ? [
            { type: 'text', text: content },
            {
              type: 'image_url',
              image_url: {
                url: image_url
              }
            }
          ]
        : `
      ${content}\n\n
      *Datos extra sobre fechas(para que el modelo tenga contexto de las fechas):
      - Fecha y hora actual en timezone del cliente(${userTimezone}): ${currentDateAndTimeInUserTimezone}
      - Días pasados:
      ${pastDays}
      - Días futuros:
      ${nextDays} 
      `,
      name: `${sanitizedName}`
    } as ChatCompletionUserMessageParam
  ];

  let prompt: string;
  let tools: ChatCompletionTool[];

  if (!user.subscription) {
    prompt = preSubscriptionAgent(user);
    tools = getAgentTools('preSubscription');
  } else if (
    user.subscription.status !== 'active' &&
    user.subscription.status !== 'on_trial'
  ) {
    prompt = inactiveSubscriptionAgent(user);
    tools = getAgentTools('inactiveSubscription');
  } else {
    prompt = apolloExpenseAgent(user);
    tools = getAgentTools('apolloExpense');
  }

  // para los messages tomar 10 por default, pero asegurarse que el primero no tenga rol tool, si lo tiene, tomar un mensaje más hasta que el primer mensaje no tenga ese rol
  const messagesForChatbot = getValidMessages(messages);

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: prompt
      },
      ...messagesForChatbot // context of the last 10 messages
    ],
    tools: tools
  });

  const responseMessage = response.choices[0].message;
  messages.push(responseMessage);

  let responseToUser = responseMessage.content;

  const toolCalls = responseMessage.tool_calls;

  if (toolCalls) {
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name as available_tools;
      const functionToCall = toolToFunction[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);

      functionArgs.userPhoneNumber = user.phone_number;
      functionArgs.phoneNumber = user.phone_number;
      const encryptionKey = decryptPermanentKey(
        user.encryption_key,
        env.ENCRYPTION_MASTER_KEY
      );
      functionArgs.encryptionKey = encryptionKey;

      const functionResponse = await functionToCall(functionArgs);
      messages.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        content: functionResponse ?? 'Hubo un error al ejecutar la herramienta'
      });
    }

    const secondResponse = await openai.chat.completions.create({
      model: model,
      messages: messages
    });

    messages.push(secondResponse.choices[0].message);
    responseToUser = secondResponse.choices[0].message.content;
  }

  const updatedChat = {
    ...chat,
    messages: messages
  };

  await saveChat(updatedChat);

  return responseToUser;
}
