"""
Simplified LangGraph service for free users (≤31 days without subscription).
This service provides basic expense tracking functionality with limited tools.
"""

import logging
from typing import List, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import create_react_agent
from app.core.config import get_settings

from app.services.main_api_service import UserData
from app.services.lukai_free_prompt_formatter import LukaiFreePromptFormatter
from app.services.postgres_checkpointer_service import get_postgres_checkpointer_service

# Import tools and state from the main tools file
from app.services.apolo_langgraph_tools import (
    ApoloState,
    register_expenses_tool,
    call_customer_support_tool,
)

# Set up logger
logger = logging.getLogger(__name__)


class LukaiFreeLangugraphService:
    def __init__(self):
        settings = get_settings()

        self.prompt_formatter = LukaiFreePromptFormatter()
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite-preview-06-17",
            temperature=0,
            api_key=settings.GOOGLE_API_KEY,
        )

        # Initialize PostgreSQL checkpointer (same as full service)
        self.checkpointer = None  # Will be initialized lazily

        # Limited tools for free users
        self.tools = {
            "register_expenses": register_expenses_tool,
            "call_customer_support": call_customer_support_tool,
        }

        logger.info("🆓 LukaiFreeLangugraphService initialized with limited tools")

    async def _get_checkpointer(self):
        """Get the PostgreSQL checkpointer (async initialization)"""
        if self.checkpointer is None:
            postgres_service = await get_postgres_checkpointer_service()
            self.checkpointer = await postgres_service.get_checkpointer()
            logger.info("📦 PostgreSQL checkpointer initialized for free service")
        return self.checkpointer

    async def create_free_agent(self, user: UserData):
        """Create a simple single-agent graph for free users"""

        # Select prompt based on user's favorite language (same logic as full service)
        if user.favorite_language == "es":
            agent_prompt = self.prompt_formatter.format_spanish_free_agent_prompt(user)
            logger.info(f"🇪🇸 Using Spanish prompt for free user {user.phone_number}")
        elif user.favorite_language == "en":
            agent_prompt = self.prompt_formatter.format_english_free_agent_prompt(user)
            logger.info(f"🇺🇸 Using English prompt for free user {user.phone_number}")
        else:
            agent_prompt = self.prompt_formatter.format_multilingual_free_agent_prompt(
                user
            )
            logger.info(
                f"🌍 Using multilingual prompt for free user {user.phone_number}"
            )

        # Get memory checkpointer (async)
        checkpointer = await self._get_checkpointer()

        # Create single agent with limited tools and checkpointer
        free_agent = create_react_agent(
            self.model,
            tools=[
                self.tools["register_expenses"],
                self.tools["call_customer_support"],
            ],
            prompt=agent_prompt,
            state_schema=ApoloState,
            checkpointer=checkpointer,
        )

        logger.info(f"🤖 Free agent created successfully for user {user.phone_number}")
        return free_agent

    async def process_query(
        self, query: str, user_data: UserData, thread_id: Optional[str] = None
    ) -> str:
        """Process a single query using the simple free user agent"""

        logger.info(f"🚀 Processing query for free user {user_data.phone_number}")

        # Create the agent for this user
        agent = await self.create_free_agent(user_data)

        # Prepare initial state
        initial_state = {
            "messages": [{"role": "user", "content": query}],
            "user_data": user_data,
            "last_active_agent": "free_agent",
            "remaining_steps": 25,
        }

        # Configuration for checkpointing
        config: RunnableConfig = {
            "configurable": {
                "thread_id": thread_id or f"free_user_{user_data.phone_number}"
            }
        }

        logger.info(
            f"📤 Invoking free agent for thread {config['configurable']['thread_id']}"
        )

        # Invoke the agent
        result = await agent.ainvoke(initial_state, config=config)

        # Return the final message content
        if result["messages"]:
            last_message = result["messages"][-1]
            if hasattr(last_message, "content"):
                return last_message.content
            return str(last_message)

        return "I apologize, but I couldn't process your request. Please try again."

    async def process_conversation(
        self,
        current_message: str,
        user_data: UserData,
        thread_id: Optional[str] = None,
    ) -> str:
        """Process a new message using the simple free user agent with automatic conversation memory"""

        logger.info(
            f"🚀 Starting Free LangGraph conversation processing for user {user_data.phone_number}"
        )

        # Create the agent for this user
        agent = await self.create_free_agent(user_data)
        logger.info(f"📊 Free agent created successfully with {len(self.tools)} tools")

        # Prepare initial state with only the new message
        # LangGraph will automatically load previous conversation state via thread_id
        initial_state = {
            "messages": [{"role": "user", "content": current_message}],
            "user_data": user_data,
            "last_active_agent": "free_agent",
            "remaining_steps": 25,
        }

        # Configuration for checkpointing - this is where LangGraph manages conversation memory
        config: RunnableConfig = {
            "configurable": {
                "thread_id": thread_id or f"free_user_{user_data.phone_number}"
            }
        }

        logger.info(
            f"📤 Invoking free agent with new message for thread {config['configurable']['thread_id']}"
        )

        # Invoke the agent - LangGraph automatically handles conversation continuity
        result = await agent.ainvoke(initial_state, config=config)

        logger.info(
            f"📥 Free agent execution completed. Result messages: {len(result.get('messages', []))}"
        )

        # Return the final assistant message content
        if result["messages"]:
            # Get the last message from the assistant
            for msg in reversed(result["messages"]):
                if hasattr(msg, "content") and getattr(msg, "type", None) == "ai":
                    return msg.content
                elif hasattr(msg, "content"):
                    # Fallback to any message with content
                    return msg.content

            # Fallback to the last message
            last_message = result["messages"][-1]
            if hasattr(last_message, "content"):
                return last_message.content
            return str(last_message)

        return "I apologize, but I couldn't process your request. Please try again."

    async def get_conversation_history(self, thread_id: str) -> List[BaseMessage]:
        """Get conversation history for a specific thread"""
        try:
            # For now, return empty list since LangGraph manages this internally
            # This method can be enhanced later if needed for debugging/audit purposes
            logger.info(f"📋 Conversation history requested for thread {thread_id}")
            return []
        except Exception as e:
            logger.error(f"❌ Error getting conversation history: {str(e)}")
            pass
        return []

    async def clear_conversation_history(self, thread_id: str) -> bool:
        """Clear conversation history for a specific thread"""
        try:
            # Use checkpointer's delete functionality if available
            # For now, we'll rely on automatic cleanup
            logger.info(f"🗑️ Clearing conversation history for thread {thread_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Error clearing conversation history: {str(e)}")
            return False


# Create a singleton instance
lukai_free_langgraph_service = LukaiFreeLangugraphService()
