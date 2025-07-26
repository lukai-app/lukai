from typing import List, Dict, Any, Annotated, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import BaseMessage
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import create_react_agent, InjectedState
from langgraph.graph import StateGraph, START
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Command
from langchain_core.tools import InjectedToolCallId
from app.core.config import get_settings

from app.services.main_api_service import UserData
from app.services.prompt_formatter import ApoloPromptFormatter
from app.services.postgres_checkpointer_service import get_postgres_checkpointer_service

# Import our native LangGraph tools (much simpler!)
from app.services.apolo_langgraph_tools import (
    ApoloState,
    # Expense tools
    register_expenses_tool,
    create_expense_category_tool,
    get_spending_tool,
    find_spendings_tool,
    # Income tools
    register_incomes_tool,
    create_income_category_tool,
    get_income_tool,
    find_incomes_tool,
    # Support tools
    call_customer_support_tool,
    get_billing_portal_link_tool,
    # Account tools
    create_financial_account_tool,
    get_account_balance_tool,
    transfer_money_between_accounts_tool,
    get_transfers_tool,
    find_transfers_tool,
    # Budget tools
    set_budget_tool,
    get_budget_tool,
    set_expense_category_budget_tool,
    get_budget_by_category_tool,
    get_savings_tool,
    # Transaction tools
    create_transaction_tags_tool,
)


def create_handoff_tool(*, agent_name: str, description: str | None = None):
    """Create a handoff tool for transferring control between agents"""
    name = f"transfer_to_{agent_name}"
    description = description or f"Transfer to {agent_name}"

    @tool(name, description=description)
    def handoff_tool(
        state: Annotated[ApoloState, InjectedState],
        tool_call_id: Annotated[str, InjectedToolCallId],
    ) -> Command:
        tool_message = {
            "role": "tool",
            "content": f"Successfully transferred to {agent_name}",
            "name": name,
            "tool_call_id": tool_call_id,
        }
        return Command(
            goto=agent_name,
            update={
                "messages": state["messages"] + [tool_message],
                "last_active_agent": agent_name,
            },
            graph=Command.PARENT,
        )

    return handoff_tool


# No more complex adapter needed! Using native LangGraph tools instead.


class ApoloLangGraphService:
    def __init__(self):
        settings = get_settings()

        self.prompt_formatter = ApoloPromptFormatter()
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite-preview-06-17",
            temperature=0,
            api_key=settings.GOOGLE_API_KEY,
        )

        # Initialize PostgreSQL checkpointer (persistent and reliable)
        self.checkpointer = None  # Will be initialized lazily

        # Native LangGraph tools (much simpler and more reliable!)
        self.tools = {
            # Support tools
            "call_customer_support": call_customer_support_tool,
            "get_billing_portal_link": get_billing_portal_link_tool,
            # Expense tools
            "register_expenses": register_expenses_tool,
            "create_expense_category": create_expense_category_tool,
            "get_spending": get_spending_tool,
            "find_spendings": find_spendings_tool,
            # Income tools
            "register_incomes": register_incomes_tool,
            "create_income_category": create_income_category_tool,
            "get_income": get_income_tool,
            "find_incomes": find_incomes_tool,
            # Account tools
            "create_financial_account": create_financial_account_tool,
            "get_account_balance": get_account_balance_tool,
            "transfer_money_between_accounts": transfer_money_between_accounts_tool,
            "get_transfers": get_transfers_tool,
            "find_transfers": find_transfers_tool,
            # Budget tools
            "set_budget": set_budget_tool,
            "get_budget": get_budget_tool,
            "set_expense_category_budget": set_expense_category_budget_tool,
            "get_budget_by_category": get_budget_by_category_tool,
            "get_savings": get_savings_tool,
            # Transaction tools
            "create_transaction_tags": create_transaction_tags_tool,
        }

    async def _get_checkpointer(self):
        """Get the PostgreSQL checkpointer (async initialization)"""
        if self.checkpointer is None:
            postgres_service = await get_postgres_checkpointer_service()
            self.checkpointer = await postgres_service.get_checkpointer()
        return self.checkpointer

    def _create_handoff_tools(self):
        """Create handoff tools for agent communication"""
        return {
            "transfer_to_income_agent": create_handoff_tool(
                agent_name="income_agent",
                description="Handles all income-related tasks like registering, categorizing, tracking user income, and answering income-related questions clearly and accurately.",
            ),
            "transfer_to_expense_agent": create_handoff_tool(
                agent_name="expense_agent",
                description="Handles all expense-related tasks like registering, categorizing, tracking user spending, and answering questions about their expenses.",
            ),
            "transfer_to_accounts_agent": create_handoff_tool(
                agent_name="accounts_agent",
                description="Handles account transfers, balance inquiries, and financial account management.",
            ),
            "transfer_to_budget_agent": create_handoff_tool(
                agent_name="budget_agent",
                description="Handles all budget-related tasks like setting and tracking budgets, managing category budgets, and monitoring savings goals.",
            ),
            "transfer_to_main_agent": create_handoff_tool(
                agent_name="main_agent",
                description="Main agent that can support user, coordinate between agents and handle mixed financial queries.",
            ),
        }

    async def create_agents_graph(self, user: UserData) -> CompiledStateGraph:
        """Create the multi-agent graph with handoff capabilities"""

        # Get handoff tools
        handoff_tools = self._create_handoff_tools()

        # Create specialized agents
        income_agent = create_react_agent(
            self.model,
            tools=[
                self.tools["register_incomes"],
                self.tools["create_income_category"],
                self.tools["get_income"],
                self.tools["find_incomes"],
                self.tools["create_financial_account"],
                handoff_tools["transfer_to_main_agent"],
            ],
            prompt=self.prompt_formatter.format_income_agent_prompt(user),
            state_schema=ApoloState,
        )

        expense_agent = create_react_agent(
            self.model,
            tools=[
                self.tools["register_expenses"],
                self.tools["create_expense_category"],
                self.tools["get_spending"],
                self.tools["find_spendings"],
                self.tools["create_financial_account"],
                handoff_tools["transfer_to_main_agent"],
            ],
            prompt=self.prompt_formatter.format_expense_agent_prompt(user),
            state_schema=ApoloState,
        )

        accounts_agent = create_react_agent(
            self.model,
            tools=[
                self.tools["create_financial_account"],
                self.tools["get_account_balance"],
                self.tools["transfer_money_between_accounts"],
                self.tools["get_transfers"],
                self.tools["find_transfers"],
                handoff_tools["transfer_to_main_agent"],
            ],
            prompt=self.prompt_formatter.format_accounts_agent_prompt(user),
            state_schema=ApoloState,
        )

        budget_agent = create_react_agent(
            self.model,
            tools=[
                self.tools["set_budget"],
                self.tools["get_budget"],
                self.tools["set_expense_category_budget"],
                self.tools["get_budget_by_category"],
                self.tools["get_savings"],
                handoff_tools["transfer_to_main_agent"],
            ],
            prompt=self.prompt_formatter.format_budget_agent_prompt(user),
            state_schema=ApoloState,
        )

        # Main coordination agent
        main_agent_prompt = (
            self.prompt_formatter.format_spanish_accounting_agent_prompt(user)
            if user.favorite_language == "es"
            else (
                self.prompt_formatter.format_english_accounting_agent_prompt(user)
                if user.favorite_language == "en"
                else self.prompt_formatter.format_multilingual_accounting_agent_prompt(
                    user
                )
            )
        )

        main_agent = create_react_agent(
            self.model,
            tools=[
                self.tools["call_customer_support"],
                self.tools["get_billing_portal_link"],
                self.tools["create_transaction_tags"],
                handoff_tools["transfer_to_expense_agent"],
                handoff_tools["transfer_to_income_agent"],
                handoff_tools["transfer_to_accounts_agent"],
                handoff_tools["transfer_to_budget_agent"],
            ],
            prompt=main_agent_prompt,
            state_schema=ApoloState,
        )

        # Build the graph
        graph = StateGraph(ApoloState)

        # Add agent nodes
        graph.add_node("main_agent", main_agent)
        graph.add_node("income_agent", income_agent)
        graph.add_node("expense_agent", expense_agent)
        graph.add_node("accounts_agent", accounts_agent)
        graph.add_node("budget_agent", budget_agent)

        # Set entry point
        graph.add_edge(START, "main_agent")

        # Get memory checkpointer (async)
        checkpointer = await self._get_checkpointer()

        # Compile with checkpointer for session persistence
        return graph.compile(checkpointer=checkpointer)

    async def process_query(
        self, query: str, user_data: UserData, thread_id: Optional[str] = None
    ) -> str:
        """Process a single query using the LangGraph multi-agent system"""

        # Create the graph for this user
        graph = await self.create_agents_graph(user_data)

        # Prepare initial state
        initial_state = {
            "messages": [{"role": "user", "content": query}],
            "user_data": user_data,
            "last_active_agent": "main_agent",
            "remaining_steps": 25,
        }

        # Configuration for checkpointing
        config: RunnableConfig = {
            "configurable": {"thread_id": thread_id or f"user_{user_data.phone_number}"}
        }

        # Invoke the graph
        result = await graph.ainvoke(initial_state, config=config)

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
        """Process a new message using the LangGraph multi-agent system with automatic conversation memory"""
        import logging

        logger = logging.getLogger(__name__)

        logger.info(
            f"🚀 Starting LangGraph conversation processing for user {user_data.phone_number}"
        )

        # Create the graph for this user
        graph = await self.create_agents_graph(user_data)
        logger.info(f"📊 Graph created successfully with {len(self.tools)} tools")

        # Prepare initial state with only the new message
        # LangGraph will automatically load previous conversation state via thread_id
        initial_state = {
            "messages": [{"role": "user", "content": current_message}],
            "user_data": user_data,
            "last_active_agent": "main_agent",
            "remaining_steps": 25,
        }

        # Configuration for checkpointing - this is where LangGraph manages conversation memory
        config: RunnableConfig = {
            "configurable": {"thread_id": thread_id or f"user_{user_data.phone_number}"}
        }

        logger.info(
            f"📤 Invoking graph with new message for thread {config['configurable']['thread_id']}"
        )

        # Invoke the graph - LangGraph automatically handles conversation continuity
        result = await graph.ainvoke(initial_state, config=config)

        logger.info(
            f"📥 Graph execution completed. Result messages: {len(result.get('messages', []))}"
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
            return []
        except Exception:
            pass
        return []

    async def clear_conversation_history(self, thread_id: str) -> bool:
        """Clear conversation history for a specific thread"""
        try:
            # Use checkpointer's delete functionality if available
            # For now, we'll rely on Redis TTL for cleanup
            return True
        except Exception as e:
            return False


# Create a singleton instance
apolo_langgraph_service = ApoloLangGraphService()
