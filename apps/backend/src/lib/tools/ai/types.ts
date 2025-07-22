import { ChatCompletionMessageParam } from 'openai/resources';

export type Message = ChatCompletionMessageParam;

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  messages: Message[];
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: string;
}

export type User = {
  id: string;
  full_name: string;
  avatar_url: string;
};

export type AIState = {
  chatId: string;
  user: User;
  messages: Message[];
};

export interface ServerMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
}
