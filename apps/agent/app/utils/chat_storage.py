from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel, ConfigDict
from upstash_redis.asyncio import Redis
from app.core.config import get_settings
import json

settings = get_settings()

# Initialize Redis client
redis = Redis(
    url=settings.UPSTASH_REDIS_REST_URL,
    token=settings.UPSTASH_REDIS_REST_TOKEN,
)

""" "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "what is in this image?"},
          {
            "type": "input_image",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
          }
        ]
      }
    ] """


class MessageContent(BaseModel):
    """Content of a message, can be text or image"""

    type: str  # 'input_text' or 'input_image'
    text: Optional[str] = None
    image_url: Optional[str] = None


class Message(BaseModel):
    """A message in the chat"""

    role: str  # 'user' or 'assistant'
    content: List[MessageContent]


class Chat(BaseModel):
    """A chat session with messages"""

    id: str  # chat_id from UserData
    title: str
    created_at: datetime
    user_id: str  # id from UserData
    messages: List[Message]

    def model_dump_redis(self) -> Dict[str, str]:
        """Convert the model to a Redis-compatible format"""
        dump = self.model_dump()
        # Convert datetime to ISO format string
        dump["created_at"] = dump["created_at"].isoformat()
        # Convert messages to JSON string
        dump["messages"] = [msg.model_dump(exclude_none=True) for msg in self.messages]
        return dump


async def clear_chats(user_id: str) -> None:
    """Delete all chats for a user.

    Args:
        user_id: The user's phone number
    """
    # Get all chat keys for the user
    chats: List[str] = await redis.zrange(f"user:chat:{user_id}", 0, -1)

    # Create a pipeline for batch operations
    pipeline = redis.pipeline()

    # Delete each chat and remove from the sorted set
    for chat in chats:
        pipeline.delete(chat)
        pipeline.zrem(f"user:chat:{user_id}", chat)

    await pipeline.execute()


async def get_chats(user_id: str) -> List[Chat]:
    """Get all chats for a user, sorted by most recent first.

    Args:
        user_id: The user's phone number

    Returns:
        List of Chat objects
    """
    try:
        # Get all chat keys for the user, sorted by score (timestamp) in descending order
        chats: List[str] = await redis.zrange(f"user:chat:{user_id}", 0, -1, rev=True)

        # Create a pipeline for batch operations
        pipeline = redis.pipeline()

        # Queue up all the hgetall operations
        for chat in chats:
            pipeline.hgetall(chat)

        # Execute pipeline and get results
        results = await pipeline.execute()

        # Convert results to Chat objects
        chat_objects = []
        for result in results:
            if result:
                # Convert stored strings back to proper types
                result["created_at"] = datetime.fromisoformat(result["created_at"])
                chat = Chat(**result)
                chat_objects.append(chat)

        return chat_objects

    except Exception as e:
        print(f"Error getting chats: {str(e)}")
        return []


async def get_chat(chat_id: str, user_id: str) -> Optional[Chat]:
    """Get a specific chat by ID and user ID.

    Args:
        chat_id: The chat ID
        user_id: The user's id

    Returns:
        Chat object if found and belongs to user, None otherwise
    """
    try:
        chat_data = await redis.hgetall(f"chat:{chat_id}")

        if not chat_data or chat_data.get("user_id") != user_id:
            return None

        # Convert stored strings back to proper types
        chat_data["created_at"] = datetime.fromisoformat(chat_data["created_at"])
        # Parse messages JSON string back to list
        chat_data["messages"] = json.loads(chat_data["messages"])
        return Chat(**chat_data)

    except Exception as e:
        print(f"Error getting chat: {str(e)}")
        return None


async def save_chat(chat: Chat) -> None:
    """Save or update a chat.

    Args:
        chat: The Chat object to save
    """
    # Create a pipeline for batch operations
    pipeline = redis.pipeline()

    # Save the chat hash
    pipeline.hmset(f"chat:{chat.id}", chat.model_dump_redis())

    # Add to user's chat list with timestamp score
    chat_key = f"user:chat:{chat.user_id}"
    pipeline.zadd(chat_key, {f"chat:{chat.id}": datetime.now().timestamp()})

    # Set expiration (30 days)
    pipeline.expire(chat_key, 2592000)

    await pipeline.exec()
