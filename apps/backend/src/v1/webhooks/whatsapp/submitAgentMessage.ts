import { ChatCompletionAssistantMessageParam } from 'openai/resources';
import { getChat, saveChat } from '../../../lib/tools/ai/chat-storage';

export type UserContextForChat = {
  id: string;
  name: string;
};

export async function submitAgentMessage({
  content,
  chatId,
  user
}: {
  content: string;
  chatId: string;
  user: UserContextForChat;
}) {
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
  }

  const messages = [
    ...chat.messages,
    {
      role: 'assistant',
      content: content
    } as ChatCompletionAssistantMessageParam
  ];

  const updatedChat = {
    ...chat,
    messages: messages
  };

  await saveChat(updatedChat);
}
