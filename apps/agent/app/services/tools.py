from typing import List, Literal
from agents import function_tool, RunContextWrapper
from pydantic import BaseModel
from app.services.main_api_service import (
    main_api_service,
    ExpenseItem,
    IncomeItem,
    ExpenseCategoryCreate,
    IncomeCategoryCreate,
    GetSpendingParams,
    GetIncomeParams,
    FindSpendingsParams,
    FindIncomesParams,
    FinancialAccountCreate,
    UserData,
    TransferCreate,
    GetTransfersParams,
    FindTransfersParams,
    BudgetCreate,
    GetBudgetParams,
    ExpenseCategoryBudgetCreate,
    GetBudgetByCategoryParams,
    GetSavingsParams,
)


# ============================================================================
# MODELS
# ============================================================================


class ExpenseCreate(BaseModel):
    amount: float
    categoryKey: str
    description: str
    message: str
    currencyCode: str
    fromAccountKey: str
    transactionTags: List[str] | None = None
    createdAt: str | None = None


class IncomeCreate(BaseModel):
    amount: float
    categoryKey: str
    description: str
    message: str
    currencyCode: str
    toAccountKey: str
    createdAt: str | None = None


# ============================================================================
# SUPPORT & CUSTOMER SERVICE TOOLS
# ============================================================================


@function_tool
async def call_for_customer_support(
    wrapper: RunContextWrapper[UserData], context: str
) -> str:
    """Call customer support for a given phone number with context.

    Args:
        wrapper: Contains user context with phone number and other user data
        context: Additional context or reason for the call
    """
    response = await main_api_service.call_customer_support(
        phone_number=wrapper.context.phone_number,
        context=context,
    )
    return response.data.tool_response


@function_tool
async def save_user_feedback(
    wrapper: RunContextWrapper[UserData], feedback: str
) -> str:
    """Save user feedback about their experience with Apolo (process, chatbot, etc).

    Args:
        wrapper: Contains user context with phone number and other user data
        feedback: User's feedback or opinion
    """
    response = await main_api_service.save_user_feedback(
        feedback=feedback,
        phone_number=wrapper.context.phone_number,
    )
    return response.data.tool_response


@function_tool
async def get_customer_billing_portal_link(wrapper: RunContextWrapper[UserData]) -> str:
    """Get the customer billing portal link for managing their subscription.

    Args:
        wrapper: Contains user context with phone number and other user data
    """
    response = await main_api_service.get_customer_billing_portal_link(
        phone_number=wrapper.context.phone_number,
    )
    return response.data.tool_response


@function_tool
async def get_checkout_payment_link(wrapper: RunContextWrapper[UserData]) -> str:
    """Get the checkout payment link for starting a subscription.

    Args:
        wrapper: Contains user context with phone number and other user data
    """
    response = await main_api_service.get_checkout_payment_link(
        phone_number=wrapper.context.phone_number,
    )
    return response.data.tool_response


# ============================================================================
# EXPENSE TOOLS
# ============================================================================


@function_tool
async def register_expenses(
    wrapper: RunContextWrapper[UserData], expenses: List[ExpenseCreate]
) -> str:
    """Register user expenses and update account balances.

    Args:
        wrapper: Contains user context with phone number and other user data
        expenses: List of expenses to register, each with:
            - amount: Expense amount
            - categoryKey: Category identifier (e.g., ALIMENTACION)
            - description: AI-interpreted expense description
            - message: Original user message for the expense
            - currencyCode: Currency code of the expense in ISO 4217 format (e.g., USD, EUR, GBP, etc.). Defaults to user's preferred currency.
            - fromAccountKey: Account identifier (e.g., BANCO_INTERBANK)
            - transactionTags: (Optional) List of transaction tags (e.g., ["novia", "mercado"])
            - createdAt: (Optional) Expense date/time, only if explicitly mentioned by user
    """
    # Convert the ExpenseCreate items to ExpenseItem objects
    expense_items = [ExpenseItem(**expense.model_dump()) for expense in expenses]

    response = await main_api_service.register_expenses(
        user_phone_number=wrapper.context.phone_number,
        expenses=expense_items,
    )
    return response.data.tool_response


@function_tool
async def create_expense_category(
    wrapper: RunContextWrapper[UserData],
    name: str,
    key: str,
    description: str | None = None,
) -> str:
    """Create a new expense category for the user.

    Args:
        wrapper: Contains user context with phone number and other user data
        name: Name of the expense category
        key: Easy identifier for the expense category in UPPERCASE_UNDERSCORE format (e.g., ALIMENTACION)
        description: Optional description of the expense category to help AI classify expenses
    """
    category = ExpenseCategoryCreate(
        name=name,
        key=key.upper(),  # Ensure key is in uppercase
        description=description,
    )

    response = await main_api_service.create_expense_category(
        user_phone_number=wrapper.context.phone_number,
        category=category,
    )
    return response.data.tool_response


@function_tool
async def get_spending(
    wrapper: RunContextWrapper[UserData],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_key: str | None = None,
) -> str:
    """Get total user spending for a date range in a specific currency. Defaults to last 30 days if no dates provided.

    Args:
        wrapper: Contains user context with phone number and other user data
        currency_code: Currency code for the expenses (defaults to user's preferred currency) in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        date_from: Start date for expenses (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for expenses (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        category_key: Optional category identifier to filter expenses (e.g., ALIMENTACION)
    """
    params = GetSpendingParams(
        currencyCode=currency_code,
        dateFrom=date_from,
        dateTo=date_to,
        categoryKey=category_key,
    )

    response = await main_api_service.get_spending(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


@function_tool
async def find_spendings(
    wrapper: RunContextWrapper[UserData],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_keys: List[str] | None = None,
    search_query: str | None = None,
    amount_from: float | None = None,
    amount_to: float | None = None,
) -> str:
    """Search for user expenses with various filters. Defaults to last 30 days if no dates provided.

    Args:
        wrapper: Contains user context with phone number and other user data
        currency_code: Currency code for the expenses (defaults to user's preferred currency) in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        date_from: Start date for expenses (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for expenses (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        category_keys: Optional list of category identifiers to filter expenses (e.g., ["ALIMENTACION", "TRANSPORTE"])
        search_query: Optional text to search in expense descriptions
        amount_from: Optional minimum amount for expenses
        amount_to: Optional maximum amount for expenses
    """
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
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


# ============================================================================
# INCOME TOOLS
# ============================================================================


@function_tool
async def register_incomes(
    wrapper: RunContextWrapper[UserData], incomes: List[IncomeCreate]
) -> str:
    """Register user incomes and update account balances.

    Args:
        wrapper: Contains user context with phone number and other user data
        incomes: List of incomes to register, each with:
            - amount: Income amount
            - categoryKey: Category identifier (e.g., SALARIO)
            - description: AI-interpreted income description
            - message: Original user message for the income
            - currencyCode: Currency code in ISO 4217 format (e.g., USD, EUR). Defaults to user's preferred currency.
            - toAccountKey: Account identifier (e.g., BANCO_INTERBANK)
            - createdAt: (Optional) Income date/time, only if explicitly mentioned by user
    """
    # Convert the IncomeCreate items to IncomeItem objects
    income_items = [IncomeItem(**income.model_dump()) for income in incomes]

    response = await main_api_service.register_incomes(
        user_phone_number=wrapper.context.phone_number,
        incomes=income_items,
    )
    return response.data.tool_response


@function_tool
async def create_income_category(
    wrapper: RunContextWrapper[UserData],
    name: str,
    key: str,
    description: str | None = None,
) -> str:
    """Create a new income category for the user.

    Args:
        wrapper: Contains user context with phone number and other user data
        name: Name of the income category
        key: Easy identifier for the income category in UPPERCASE_UNDERSCORE format (e.g., SALARIO)
        description: Optional description of the income category to help AI classify incomes
    """
    category = IncomeCategoryCreate(
        name=name,
        key=key.upper(),  # Ensure key is in uppercase
        description=description,
    )

    response = await main_api_service.create_income_category(
        user_phone_number=wrapper.context.phone_number,
        category=category,
    )
    return response.data.tool_response


@function_tool
async def get_income(
    wrapper: RunContextWrapper[UserData],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_key: str | None = None,
) -> str:
    """Get total user income for a date range in a specific currency. Defaults to last 30 days if no dates provided.

    Args:
        wrapper: Contains user context with phone number and other user data
        currency_code: Currency code for the incomes (defaults to user's preferred currency) in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        date_from: Start date for incomes (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for incomes (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        category_key: Optional category identifier to filter incomes (e.g., SALARIO)
    """
    params = GetIncomeParams(
        currencyCode=currency_code,
        dateFrom=date_from,
        dateTo=date_to,
        categoryKey=category_key,
    )

    response = await main_api_service.get_income(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


@function_tool
async def find_incomes(
    wrapper: RunContextWrapper[UserData],
    currency_code: str,
    date_from: str,
    date_to: str,
    category_keys: List[str] | None = None,
    search_query: str | None = None,
    amount_from: float | None = None,
    amount_to: float | None = None,
) -> str:
    """Search for user incomes with various filters. Defaults to last 30 days if no dates provided.

    Args:
        wrapper: Contains user context with phone number and other user data
        currency_code: Currency code for the incomes (defaults to user's preferred currency) in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        date_from: Start date for incomes (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for incomes (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        category_keys: Optional list of category identifiers to filter incomes (e.g., ["SALARIO", "FREELANCE"])
        search_query: Optional text to search in income descriptions
        amount_from: Optional minimum amount for incomes
        amount_to: Optional maximum amount for incomes
    """
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
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


# ============================================================================
# ACCOUNT & TRANSFER TOOLS
# ============================================================================


@function_tool
async def create_financial_account(
    wrapper: RunContextWrapper[UserData],
    account_type: Literal["REGULAR", "SAVINGS", "DEBT"],
    name: str,
    key: str,
    balance: float,
    currency_code: str,
    description: str | None = None,
) -> str:
    """Create a new financial account for the user.

    Args:
        wrapper: Contains user context with phone number and other user data
        account_type: Type of financial account (REGULAR, SAVINGS, or DEBT)
        name: Name of the financial account
        key: Easy identifier for the financial account in UPPERCASE_UNDERSCORE format (e.g., BANCO_INTERBANK)
        balance: Initial balance of the financial account
        currency_code: Currency code in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        description: Optional description of the financial account
    """
    account = FinancialAccountCreate(
        accountType=account_type,
        name=name,
        key=key.upper(),  # Ensure key is in uppercase
        balance=balance,
        currencyCode=currency_code,
        description=description,
    )

    response = await main_api_service.create_financial_account(
        user_phone_number=wrapper.context.phone_number,
        account=account,
    )
    return response.data.tool_response


@function_tool
async def transfer_money_between_accounts(
    wrapper: RunContextWrapper[UserData],
    transfers: List[TransferCreate],
) -> str:
    """Transfer money between accounts.

    Args:
        wrapper: Contains user context with phone number and other user data
        transfers: List of transfers to make between accounts
    """
    response = await main_api_service.transfer_money_between_accounts(
        user_phone_number=wrapper.context.phone_number,
        transfers=transfers,
    )
    return response.data.tool_response


@function_tool
async def get_transfers(
    wrapper: RunContextWrapper[UserData],
    date_from: str,
    date_to: str,
    from_account_key: str | None = None,
    to_account_key: str | None = None,
    amount_from: float | None = None,
    amount_to: float | None = None,
) -> str:
    """Get total transfers between accounts for a date range.

    Args:
        wrapper: Contains user context with phone number and other user data
        date_from: Start date for transfers (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for transfers (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        from_account_key: Optional source account identifier (e.g., BANCO_INTERBANK)
        to_account_key: Optional destination account identifier (e.g., BANCO_SCOTIABANK)
        amount_from: Optional minimum amount for transfers
        amount_to: Optional maximum amount for transfers
    """
    params = GetTransfersParams(
        dateFrom=date_from,
        dateTo=date_to,
        fromAccountKey=from_account_key,
        toAccountKey=to_account_key,
        amountFrom=amount_from,
        amountTo=amount_to,
    )

    response = await main_api_service.get_transfers(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


@function_tool
async def find_transfers(
    wrapper: RunContextWrapper[UserData],
    date_from: str,
    date_to: str,
    from_account_key: str | None = None,
    to_account_key: str | None = None,
    amount_from: float | None = None,
    amount_to: float | None = None,
) -> str:
    """Search for transfers between accounts with various filters.

    Args:
        wrapper: Contains user context with phone number and other user data
        date_from: Start date for transfers (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        date_to: End date for transfers (ISO format, e.g., 2023-10-05T14:48:00.000Z)
        from_account_key: Optional source account identifier (e.g., BANCO_INTERBANK)
        to_account_key: Optional destination account identifier (e.g., BANCO_SCOTIABANK)
        amount_from: Optional minimum amount for transfers
        amount_to: Optional maximum amount for transfers
    """
    params = FindTransfersParams(
        dateFrom=date_from,
        dateTo=date_to,
        fromAccountKey=from_account_key,
        toAccountKey=to_account_key,
        amountFrom=amount_from,
        amountTo=amount_to,
    )

    response = await main_api_service.find_transfers(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


@function_tool
async def get_account_balance(
    wrapper: RunContextWrapper[UserData],
    account_key: str,
) -> str:
    """Get the current balance of a specific account.

    Args:
        wrapper: Contains user context with phone number and other user data
        account_key: Account identifier (e.g., BANCO_INTERBANK)
    """
    response = await main_api_service.get_account_balance(
        user_phone_number=wrapper.context.phone_number,
        account_key=account_key,
    )
    return response.data.tool_response


# ============================================================================
# BUDGET TOOLS
# ============================================================================


@function_tool
async def set_budget(
    wrapper: RunContextWrapper[UserData],
    amount: float,
    year: int,
    currency_code: str,
    month: int,
) -> str:
    """Set a general budget for the user.

    Args:
        wrapper: Contains user context with phone number and other user data
        amount: Budget amount to set
        year: Year for the budget
        currency_code: Currency code in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        month: Month number (0-11) for the budget
    """
    budget = BudgetCreate(
        amount=amount,
        year=year,
        currencyCode=currency_code,
        month=month,
    )

    response = await main_api_service.set_budget(
        user_phone_number=wrapper.context.phone_number,
        budget=budget,
    )
    return response.data.tool_response


@function_tool
async def get_budget(
    wrapper: RunContextWrapper[UserData],
    year: int,
    month: int,
    currency_code: str,
) -> str:
    """Get the general budget for a specific month and year.

    Args:
        wrapper: Contains user context with phone number and other user data
        year: Year for the budget
        month: Month number (0-11) for the budget
        currency_code: Currency code in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
    """
    params = GetBudgetParams(
        year=year,
        month=month,
        currencyCode=currency_code,
    )

    response = await main_api_service.get_budget(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


@function_tool
async def set_expense_category_budget(
    wrapper: RunContextWrapper[UserData],
    category_key: str,
    amount: float,
    year: int,
    currency_code: str,
    month: int,
) -> str:
    """Set a budget for a specific expense category.

    Args:
        wrapper: Contains user context with phone number and other user data
        category_key: Category identifier (e.g., ALIMENTACION)
        amount: Budget amount to set
        year: Year for the budget
        currency_code: Currency code in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
        month: Month number (0-11) for the budget
    """
    budget = ExpenseCategoryBudgetCreate(
        categoryKey=category_key,
        amount=amount,
        year=year,
        currencyCode=currency_code,
        month=month,
    )

    response = await main_api_service.set_expense_category_budget(
        user_phone_number=wrapper.context.phone_number,
        budget=budget,
    )
    return response.data.tool_response


@function_tool
async def get_budget_by_category(
    wrapper: RunContextWrapper[UserData],
    category_key: str,
    year: int,
    month: int,
    currency_code: str,
) -> str:
    """Get the budget for a specific expense category.

    Args:
        wrapper: Contains user context with phone number and other user data
        category_key: Category identifier (e.g., ALIMENTACION)
        year: Year for the budget
        month: Month number (0-11) for the budget
        currency_code: Currency code in ISO 4217 format (e.g., USD, EUR, GBP, etc.)
    """
    params = GetBudgetByCategoryParams(
        categoryKey=category_key,
        year=year,
        month=month,
        currencyCode=currency_code,
    )

    response = await main_api_service.get_budget_by_category(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


@function_tool
async def get_savings(
    wrapper: RunContextWrapper[UserData],
    savings_accounts_keys: List[str],
) -> str:
    """Get savings information for specific savings accounts.

    Args:
        wrapper: Contains user context with phone number and other user data
        savings_accounts_keys: List of savings account identifiers
    """
    params = GetSavingsParams(
        savingsAccountsKeys=savings_accounts_keys,
    )

    response = await main_api_service.get_savings(
        user_phone_number=wrapper.context.phone_number,
        params=params,
    )
    return response.data.tool_response


# ============================================================================
# TRANSACTION TAG TOOLS
# ============================================================================


@function_tool
async def create_transaction_tags(
    wrapper: RunContextWrapper[UserData],
    tags: List[str],
) -> str:
    """Create transaction tags for the user.

    Args:
        wrapper: Contains user context with phone number and other user data
        tags: List of tags to create
    """
    response = await main_api_service.create_transaction_tags(
        phone_number=wrapper.context.phone_number,
        tags=tags,
    )
    return response.data.tool_response
