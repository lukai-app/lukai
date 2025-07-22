from typing import List, Dict, Any
from agents import Agent, Runner
from app.services.main_api_service import UserData
from app.services.prompt_formatter import ApoloPromptFormatter
from app.services.tools import (
    call_for_customer_support,
    get_customer_billing_portal_link,
    register_expenses,
    register_incomes,
    create_expense_category,
    create_income_category,
    get_spending,
    get_income,
    find_spendings,
    find_incomes,
    create_financial_account,
    transfer_money_between_accounts,
    get_transfers,
    find_transfers,
    get_account_balance,
    set_budget,
    get_budget,
    set_expense_category_budget,
    get_budget_by_category,
    get_savings,
    create_transaction_tags,
)

model = "gpt-4o-mini"


class ApoloService:
    def __init__(self):
        self.prompt_formatter = ApoloPromptFormatter()

    def get_agents(self, user: UserData) -> Agent[UserData]:
        """Get the complete agent hierarchy with current user context.
        The hierarchy is:
        - Main Apolo Agent
          - Spanish Agent
            - Accounting Agent
              - Expense Agent
              - Income Agent
              - Budget Agent
          - English Agent
            - Accounting Agent
              - Expense Agent
              - Income Agent
              - Budget Agent
          - Multilingual Agent
            - Accounting Agent
              - Expense Agent
              - Income Agent
              - Budget Agent
        """
        # Base agents
        income_agent = Agent[UserData](
            name="Apolo Income",
            model=model,
            handoff_description="Handles all income-related tasks like registering, categorizing, tracking user income, and answering income-related questions clearly and accurately.",
            instructions=self.prompt_formatter.format_income_agent_prompt(user),
            tools=[
                register_incomes,
                create_income_category,
                get_income,
                find_incomes,
                create_financial_account,
            ],
        )

        expense_agent = Agent[UserData](
            name="Apolo Expense",
            model=model,
            handoff_description="Handles all expense-related tasks like registering, categorizing, tracking user spending, and answering questions about their expenses.",
            instructions=self.prompt_formatter.format_expense_agent_prompt(user),
            tools=[
                register_expenses,
                create_expense_category,
                get_spending,
                find_spendings,
                create_financial_account,
            ],
        )

        accounts_agent = Agent[UserData](
            name="Apolo Accounts",
            model=model,
            instructions=self.prompt_formatter.format_accounts_agent_prompt(user),
            tools=[
                transfer_money_between_accounts,
                create_financial_account,
                get_account_balance,
                get_transfers,
                find_transfers,
            ],
        )

        budget_agent = Agent[UserData](
            name="Apolo Budget",
            model=model,
            handoff_description="Handles all budget-related tasks like setting and tracking budgets, managing category budgets, and monitoring savings goals.",
            instructions=self.prompt_formatter.format_budget_agent_prompt(user),
            tools=[
                set_budget,
                get_budget,
                set_expense_category_budget,
                get_budget_by_category,
                get_savings,
            ],
        )

        apolo_agent = Agent[UserData](
            name="Apolo",
            model=model,
            handoff_description="Main agent that can support user, coordinate between agents and handle mixed financial queries.",
            instructions=(
                self.prompt_formatter.format_spanish_accounting_agent_prompt(user)
                if user.favorite_language == "es"
                else (
                    self.prompt_formatter.format_english_accounting_agent_prompt(user)
                    if user.favorite_language == "en"
                    else self.prompt_formatter.format_multilingual_accounting_agent_prompt(
                        user
                    )
                )
            ),
            tools=[
                call_for_customer_support,
                get_customer_billing_portal_link,
                create_transaction_tags,
            ],
            handoffs=[expense_agent, income_agent, accounts_agent, budget_agent],
        )

        income_agent.handoffs.append(apolo_agent)
        expense_agent.handoffs.append(apolo_agent)
        accounts_agent.handoffs.append(apolo_agent)
        budget_agent.handoffs.append(apolo_agent)

        # Main Apolo agent
        return apolo_agent

    async def process_query(self, query: str, user_data: UserData) -> str:
        # Get agent with current context
        apolo_agent = self.get_agents(user_data)

        result = await Runner.run(
            apolo_agent,
            input=query,
            context=user_data,
        )
        return result.final_output

    async def process_conversation(
        self, conversation: List[Dict[str, Any]], user_data: UserData
    ) -> List[Dict[str, Any]]:
        # Get agent with current context
        apolo_agent = self.get_agents(user_data)

        result = await Runner.run(
            apolo_agent,
            input=conversation,
            context=user_data,
        )

        return result.final_output


# Create a singleton instance
apolo_service = ApoloService()
