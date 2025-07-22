'use server';

import { client as RedisClient } from '../kv';
import type { Chat } from './types';

export async function clearChats(userId: string) {
  const chats: string[] = await RedisClient.zrange(
    `user:chat:${userId}`,
    0,
    -1
  );

  const pipeline = RedisClient.pipeline();

  for (const chat of chats) {
    pipeline.del(chat);
    pipeline.zrem(`user:chat:${userId}`, chat);
  }

  await pipeline.exec();
}

export async function getChats(userId: string) {
  try {
    const pipeline = RedisClient.pipeline();
    const chats: string[] = await RedisClient.zrange(
      `user:chat:${userId}`,
      0,
      -1,
      {
        rev: true
      }
    );

    for (const chat of chats) {
      pipeline.hgetall(chat);
    }

    const results = await pipeline.exec();

    return results as Chat[];
  } catch (error) {
    return [];
  }
}

export async function getChat({ id, userId }: { id: string; userId: string }) {
  const chat = await RedisClient.hgetall<Chat>(`chat:${id}`);

  if (!chat || (userId && chat.userId !== userId)) {
    return null;
  }

  return chat;
}

export async function saveChat(chat: Chat) {
  const pipeline = RedisClient.pipeline();
  pipeline.hmset(`chat:${chat.id}`, chat);

  const chatKey = `user:chat:${chat.userId}`;
  pipeline
    .zadd(chatKey, {
      score: Date.now(),
      member: `chat:${chat.id}`
    })
    // Expire in 30 days
    .expire(chatKey, 2592000);

  await pipeline.exec();
}
