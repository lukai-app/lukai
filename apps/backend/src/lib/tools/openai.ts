import OpenAI from 'openai';
import { env } from '../../env';
import { observeOpenAI } from 'langfuse';

export const CHAT_GPT4_MINI_MODEL = 'gpt-4o-mini';
export const CHAT_GPT4_NANO_MODEL = 'gpt-4.1-nano';
export const CHAT_GPT4_MODEL = 'gpt-4o';
export const CHAT_GPT4_MINI_TRANSCRIBE_MODEL = 'gpt-4o-mini-transcribe';

export const openai = observeOpenAI(
  new OpenAI({
    apiKey: env.OPENAI_API_KEY
  })
);

export const sendChatPrompt = async (prompt: string) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: CHAT_GPT4_MINI_MODEL
  });

  return chatCompletion.choices[0].message;
};

export const sendImagePrompt = async (
  image: string,
  prompt: string,
  options?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming>
) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `${image}`
            }
          }
        ]
      }
    ],
    ...options
  });

  return response.choices[0].message;
};

export const sendImageBase64Prompt = async (
  image: string,
  prompt: string,
  options?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming>
) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${image}`
            }
          }
        ]
      }
    ],
    ...options
  });

  return response.choices[0].message;
};
