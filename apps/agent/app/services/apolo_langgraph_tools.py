"""
Native LangGraph tools for Apolo financial assistant.
These tools directly call main_api_service without complex adapters.
"""

import logging
from typing import List, Annotated
from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

from app.services.main_api_service import (
    main_api_service,
    UserData,
    ExpenseItem,
    IncomeItem,
    ExpenseCategoryCreate,
    IncomeCategoryCreate,
    GetSpendingParams,
    GetIncomeParams,
    FindSpendingsParams,
    FindIncomesParams,
    FinancialAccountCreate,
    TransferCreate,
    GetTransfersParams,
    FindTransfersParams,
    BudgetCreate,
    GetBudgetParams,
    ExpenseCategoryBudgetCreate,
    GetBudgetByCategoryParams,
    GetSavingsParams,
)

# Import ApoloState directly - we need it at runtime for the @tool decorator
from langgraph.graph.message import MessagesState

# Set up logger
logger = logging.getLogger(__name__)


# Define ApoloState here to avoid circular imports
class ApoloState(MessagesState):
    user_data: UserData
    last_active_agent: str
    remaining_steps: int = 25


# ============================================================================
# EXPENSE TOOLS
# ============================================================================


@tool
async def register_expenses_tool(
    state: Annotated[ApoloState, InjectedState], expenses: List[dict]
) -> str:
    """Register user expenses and update account balances.

    Args:
        expenses: List of expense dictionaries with fields:
            - amount: Expense amount (float)
            - categoryKey: Category identifier (str, e.g., "ALIMENTACION")
            - description: AI-interpreted expense description (str)
            - message: Original user message for the expense (str)
            - currencyCode: Currency code in ISO 4217 format (str, e.g., "USD", "EUR", "PEN")
            - fromAccountKey: Account identifier (str, e.g., "BANCO_INTERBANK")
            - transactionTags: Optional list of tags (List[str])
            - createdAt: Optional expense date/time (str, ISO format)
    """
    try:
        # Convert dict expenses to ExpenseItem objects
        expense_items = []
        for expense_data in expenses:
            expense_item = ExpenseItem(
                amount=expense_data["amount"],
                categoryKey=expense_data["categoryKey"],
                description=expense_data["description"],
                message=expense_data["message"],
                currencyCode=expense_data["currencyCode"],
                fromAccountKey=expense_data["fromAccountKey"],
                transactionTags=expense_data.get("transactionTags"),
                createdAt=expense_data.get("createdAt"),
            )
            expense_items.append(expense_item)

        # Call the main API service
        response = await main_api_service.register_expenses(
            user_phone_number=state["user_data"].phone_number,
            expenses=expense_items,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error registering expenses: {str(e)}"


@tool
async def create_expense_category_tool(
    state: Annotated[ApoloState, InjectedState],
    name: str,
    key: str,
    description: str = None,
) -> str:
    """Create a new expense category for the user.

    Args:
        name: Name of the expense category
        key: Easy identifier for the expense category in UPPERCASE_UNDERSCORE format (e.g., ALIMENTACION)
        description: Optional description of the expense category to help AI classify expenses
    """
    try:
        category = ExpenseCategoryCreate(
            name=name,
            key=key.upper(),  # Ensure key is in uppercase
            description=description,
        )

        response = await main_api_service.create_expense_category(
            user_phone_number=state["user_data"].phone_number,
            category=category,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error creating expense category: {str(e)}"


@tool
async def get_spending_tool(
    state: Annotated[ApoloState, InjectedState],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_key: str = None,
) -> str:
    """Get total user spending for a date range in a specific currency.

    Args:
        currency_code: Currency code for the expenses in ISO 4217 format (e.g., USD, EUR, PEN)
        date_from: Start date for expenses (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for expenses (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        category_key: Optional category identifier to filter expenses (e.g., ALIMENTACION)
    """
    try:
        params = GetSpendingParams(
            currencyCode=currency_code,
            dateFrom=date_from,
            dateTo=date_to,
            categoryKey=category_key,
        )

        response = await main_api_service.get_spending(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting spending: {str(e)}"


@tool
async def find_spendings_tool(
    state: Annotated[ApoloState, InjectedState],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_keys: List[str] = None,
    search_query: str = None,
    amount_from: float = None,
    amount_to: float = None,
) -> str:
    """Find specific user expenses based on filters and search criteria.

    Args:
        currency_code: Currency code for the expenses in ISO 4217 format (e.g., USD, EUR, PEN)
        date_from: Start date for expenses (ISO format)
        date_to: End date for expenses (ISO format)
        category_keys: Optional list of category identifiers to filter expenses
        search_query: Optional search query to find expenses by description or message
        amount_from: Optional minimum amount filter
        amount_to: Optional maximum amount filter
    """
    try:
        params = FindSpendingsParams(
            currencyCode=currency_code,
            dateFrom=date_from,
            dateTo=date_to,
            categoryKeys=category_keys,
            searchQuery=search_query,
            amountFrom=amount_from,
            amountTo=amount_to,
        )

        response = await main_api_service.find_spendings(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error finding spendings: {str(e)}"


# ============================================================================
# INCOME TOOLS
# ============================================================================


@tool
async def register_incomes_tool(
    state: Annotated[ApoloState, InjectedState], incomes: List[dict]
) -> str:
    """Register user incomes and update account balances.

    Args:
        incomes: List of income dictionaries with fields:
            - amount: Income amount (float)
            - categoryKey: Category identifier (str, e.g., "SALARY")
            - description: AI-interpreted income description (str)
            - message: Original user message for the income (str)
            - currencyCode: Currency code in ISO 4217 format (str, e.g., "USD", "EUR", "PEN")
            - toAccountKey: Account identifier (str, e.g., "BANCO_INTERBANK")
            - createdAt: Optional income date/time (str, ISO format)
    """
    try:
        # Convert dict incomes to IncomeItem objects
        income_items = []
        for income_data in incomes:
            income_item = IncomeItem(
                amount=income_data["amount"],
                categoryKey=income_data["categoryKey"],
                description=income_data["description"],
                message=income_data["message"],
                currencyCode=income_data["currencyCode"],
                toAccountKey=income_data["toAccountKey"],
                createdAt=income_data.get("createdAt"),
            )
            income_items.append(income_item)

        # Call the main API service
        response = await main_api_service.register_incomes(
            user_phone_number=state["user_data"].phone_number,
            incomes=income_items,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error registering incomes: {str(e)}"


@tool
async def create_income_category_tool(
    state: Annotated[ApoloState, InjectedState],
    name: str,
    key: str,
    description: str = None,
) -> str:
    """Create a new income category for the user.

    Args:
        name: Name of the income category
        key: Easy identifier for the income category in UPPERCASE_UNDERSCORE format (e.g., SALARY)
        description: Optional description of the income category to help AI classify incomes
    """
    try:
        category = IncomeCategoryCreate(
            name=name,
            key=key.upper(),  # Ensure key is in uppercase
            description=description,
        )

        response = await main_api_service.create_income_category(
            user_phone_number=state["user_data"].phone_number,
            category=category,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error creating income category: {str(e)}"


@tool
async def get_income_tool(
    state: Annotated[ApoloState, InjectedState],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_key: str = None,
) -> str:
    """Get total user income for a date range in a specific currency.

    Args:
        currency_code: Currency code for the incomes in ISO 4217 format (e.g., USD, EUR, PEN)
        date_from: Start date for incomes (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for incomes (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        category_key: Optional category identifier to filter incomes (e.g., SALARY)
    """
    try:
        params = GetIncomeParams(
            currencyCode=currency_code,
            dateFrom=date_from,
            dateTo=date_to,
            categoryKey=category_key,
        )

        response = await main_api_service.get_income(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting income: {str(e)}"


@tool
async def find_incomes_tool(
    state: Annotated[ApoloState, InjectedState],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_keys: List[str] = None,
    search_query: str = None,
    amount_from: float = None,
    amount_to: float = None,
) -> str:
    """Find specific user incomes based on filters and search criteria.

    Args:
        currency_code: Currency code for the incomes in ISO 4217 format (e.g., USD, EUR, PEN)
        date_from: Start date for incomes (ISO format)
        date_to: End date for incomes (ISO format)
        category_keys: Optional list of category identifiers to filter incomes
        search_query: Optional search query to find incomes by description or message
        amount_from: Optional minimum amount filter
        amount_to: Optional maximum amount filter
    """
    try:
        params = FindIncomesParams(
            currencyCode=currency_code,
            dateFrom=date_from,
            dateTo=date_to,
            categoryKeys=category_keys,
            searchQuery=search_query,
            amountFrom=amount_from,
            amountTo=amount_to,
        )

        response = await main_api_service.find_incomes(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error finding incomes: {str(e)}"


# ============================================================================
# SUPPORT TOOLS
# ============================================================================


@tool
async def call_customer_support_tool(
    state: Annotated[ApoloState, InjectedState], context: str
) -> str:
    """Call customer support for a given phone number with context.

    Args:
        context: Additional context or reason for the call
    """
    try:
        response = await main_api_service.call_customer_support(
            phone_number=state["user_data"].phone_number,
            context=context,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error calling customer support: {str(e)}"


@tool
async def get_billing_portal_link_tool(
    state: Annotated[ApoloState, InjectedState],
) -> str:
    """Get the customer billing portal link for managing their subscription."""
    try:
        response = await main_api_service.get_customer_billing_portal_link(
            phone_number=state["user_data"].phone_number,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting billing portal link: {str(e)}"


# ============================================================================
# ACCOUNT TOOLS
# ============================================================================


@tool
async def create_financial_account_tool(
    state: Annotated[ApoloState, InjectedState],
    account_type: str,  # "REGULAR", "SAVINGS", "DEBT"
    name: str,
    key: str,
    balance: float,
    currency_code: str,
    description: str = None,
) -> str:
    """Create a new financial account for the user.

    Args:
        account_type: Type of account ("REGULAR", "SAVINGS", "DEBT")
        name: Name of the account
        key: Easy identifier for the account in UPPERCASE_UNDERSCORE format
        balance: Initial balance
        currency_code: Currency code in ISO 4217 format (e.g., USD, EUR, PEN)
        description: Optional description of the account
    """
    try:
        account = FinancialAccountCreate(
            accountType=account_type,
            name=name,
            key=key.upper(),
            balance=balance,
            currencyCode=currency_code,
            description=description,
        )

        response = await main_api_service.create_financial_account(
            user_phone_number=state["user_data"].phone_number,
            account=account,
        )

        return response.data.tool_response

    except ValueError as e:
        # Handle validation errors (e.g., Pydantic validation)
        logger.error(
            "Validation error creating financial account",
            extra={
                "error": str(e),
                "account_type": account_type,
                "user_phone": state["user_data"].phone_number,
            },
        )
        return f"Invalid account data: {str(e)}"

    except Exception as e:
        # Handle all other errors
        logger.error(
            "Unexpected error creating financial account",
            extra={
                "error": str(e),
                "error_type": type(e).__name__,
                "user_phone": state["user_data"].phone_number,
            },
            exc_info=True,
        )  # This includes the traceback automatically
        return f"Error creating financial account: {str(e)}"


@tool
async def get_account_balance_tool(
    state: Annotated[ApoloState, InjectedState],
    account_key: str,
) -> str:
    """Get the current balance of a financial account.

    Args:
        account_key: Account identifier (e.g., BANCO_INTERBANK)
    """
    try:
        response = await main_api_service.get_account_balance(
            user_phone_number=state["user_data"].phone_number,
            account_key=account_key,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting account balance: {str(e)}"


# ============================================================================
# BUDGET TOOLS
# ============================================================================


@tool
async def set_budget_tool(
    state: Annotated[ApoloState, InjectedState],
    amount: float,
    year: int,
    currency_code: str,
    month: int,
) -> str:
    """Set a monthly budget for the user.

    Args:
        amount: Budget amount
        year: Budget year
        currency_code: Currency code in ISO 4217 format
        month: Budget month (1-12)
    """
    try:
        budget = BudgetCreate(
            amount=amount,
            year=year,
            currencyCode=currency_code,
            month=month,
        )

        response = await main_api_service.set_budget(
            user_phone_number=state["user_data"].phone_number,
            budget=budget,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error setting budget: {str(e)}"


@tool
async def get_budget_tool(
    state: Annotated[ApoloState, InjectedState],
    year: int,
    month: int,
    currency_code: str,
) -> str:
    """Get the user's budget for a specific month.

    Args:
        year: Budget year
        month: Budget month (1-12)
        currency_code: Currency code in ISO 4217 format
    """
    try:
        params = GetBudgetParams(
            year=year,
            month=month,
            currencyCode=currency_code,
        )

        response = await main_api_service.get_budget(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting budget: {str(e)}"


# ============================================================================
# TRANSFER TOOLS
# ============================================================================


@tool
async def transfer_money_between_accounts_tool(
    state: Annotated[ApoloState, InjectedState], transfers: List[dict]
) -> str:
    """Transfer money between user's financial accounts.

    Args:
        transfers: List of transfer dictionaries with fields:
            - amount: Transfer amount (float)
            - fromAccountKey: Source account identifier (str)
            - toAccountKey: Destination account identifier (str)
            - description: Transfer description (str)
            - currencyCode: Currency code in ISO 4217 format (str)
    """
    try:
        # Convert dict transfers to TransferCreate objects
        transfer_items = []
        for transfer_data in transfers:
            transfer_item = TransferCreate(
                amount=transfer_data["amount"],
                fromAccountKey=transfer_data["fromAccountKey"],
                toAccountKey=transfer_data["toAccountKey"],
                description=transfer_data["description"],
                currencyCode=transfer_data["currencyCode"],
            )
            transfer_items.append(transfer_item)

        response = await main_api_service.transfer_money_between_accounts(
            user_phone_number=state["user_data"].phone_number,
            transfers=transfer_items,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error transferring money: {str(e)}"


@tool
async def get_transfers_tool(
    state: Annotated[ApoloState, InjectedState],
    date_from: str,
    date_to: str,
    from_account_key: str = None,
    to_account_key: str = None,
    amount_from: float = None,
    amount_to: float = None,
) -> str:
    """Get user's account transfers for a date range.

    Args:
        date_from: Start date for transfers (ISO format)
        date_to: End date for transfers (ISO format)
        from_account_key: Optional source account identifier to filter transfers
        to_account_key: Optional destination account identifier to filter transfers
        amount_from: Optional minimum amount filter
        amount_to: Optional maximum amount filter
    """
    try:
        params = GetTransfersParams(
            dateFrom=date_from,
            dateTo=date_to,
            fromAccountKey=from_account_key,
            toAccountKey=to_account_key,
            amountFrom=amount_from,
            amountTo=amount_to,
        )

        response = await main_api_service.get_transfers(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting transfers: {str(e)}"


@tool
async def find_transfers_tool(
    state: Annotated[ApoloState, InjectedState],
    date_from: str,
    date_to: str,
    from_account_key: str = None,
    to_account_key: str = None,
    amount_from: float = None,
    amount_to: float = None,
) -> str:
    """Find specific user transfers based on filters and search criteria.

    Args:
        date_from: Start date for transfers (ISO format)
        date_to: End date for transfers (ISO format)
        from_account_key: Optional source account identifier to filter transfers
        to_account_key: Optional destination account identifier to filter transfers
        amount_from: Optional minimum amount filter
        amount_to: Optional maximum amount filter
    """
    try:
        params = FindTransfersParams(
            dateFrom=date_from,
            dateTo=date_to,
            fromAccountKey=from_account_key,
            toAccountKey=to_account_key,
            amountFrom=amount_from,
            amountTo=amount_to,
        )

        response = await main_api_service.find_transfers(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error finding transfers: {str(e)}"


# ============================================================================
# ADDITIONAL BUDGET TOOLS
# ============================================================================


@tool
async def set_expense_category_budget_tool(
    state: Annotated[ApoloState, InjectedState],
    category_key: str,
    amount: float,
    year: int,
    currency_code: str,
    month: int,
) -> str:
    """Set a budget for a specific expense category.

    Args:
        category_key: Expense category identifier (e.g., ALIMENTACION)
        amount: Budget amount
        year: Budget year
        currency_code: Currency code in ISO 4217 format
        month: Budget month (1-12)
    """
    try:
        budget = ExpenseCategoryBudgetCreate(
            categoryKey=category_key,
            amount=amount,
            year=year,
            currencyCode=currency_code,
            month=month,
        )

        response = await main_api_service.set_expense_category_budget(
            user_phone_number=state["user_data"].phone_number,
            budget=budget,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error setting expense category budget: {str(e)}"


@tool
async def get_budget_by_category_tool(
    state: Annotated[ApoloState, InjectedState],
    category_key: str,
    year: int,
    month: int,
    currency_code: str,
) -> str:
    """Get the user's budget for a specific expense category.

    Args:
        category_key: Expense category identifier (e.g., ALIMENTACION)
        year: Budget year
        month: Budget month (1-12)
        currency_code: Currency code in ISO 4217 format
    """
    try:
        params = GetBudgetByCategoryParams(
            categoryKey=category_key,
            year=year,
            month=month,
            currencyCode=currency_code,
        )

        response = await main_api_service.get_budget_by_category(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting budget by category: {str(e)}"


@tool
async def get_savings_tool(
    state: Annotated[ApoloState, InjectedState],
    savings_accounts_keys: List[str],
) -> str:
    """Get the user's savings information from specified savings accounts.

    Args:
        savings_accounts_keys: List of savings account identifiers
    """
    try:
        params = GetSavingsParams(
            savingsAccountsKeys=savings_accounts_keys,
        )

        response = await main_api_service.get_savings(
            user_phone_number=state["user_data"].phone_number,
            params=params,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error getting savings: {str(e)}"


@tool
async def create_transaction_tags_tool(
    state: Annotated[ApoloState, InjectedState],
    tags: List[str],
) -> str:
    """Create new transaction tags for the user.

    Args:
        tags: List of tag names to create
    """
    try:
        response = await main_api_service.create_transaction_tags(
            user_phone_number=state["user_data"].phone_number,
            tags=tags,
        )
        return response.data.tool_response

    except Exception as e:
        return f"Error creating transaction tags: {str(e)}"
