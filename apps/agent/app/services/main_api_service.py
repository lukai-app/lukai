import logging
from typing import Dict, Any, TypeVar, Generic, Type, List, Literal
import httpx
from fastapi import HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.core.config import get_settings
from app.schemas.api_responses import (
    MainAPIResponse,
    ToolResponse,
)

settings = get_settings()
logger = logging.getLogger(__name__)
T = TypeVar("T")


class ExpenseItem(BaseModel):
    amount: float
    categoryKey: str
    description: str
    message: str
    currencyCode: str
    fromAccountKey: str
    transactionTags: List[str] | None = None
    createdAt: str | None = None


class IncomeItem(BaseModel):
    amount: float
    categoryKey: str
    description: str
    message: str
    currencyCode: str
    toAccountKey: str
    createdAt: str | None = None


class CategoryCreate(BaseModel):
    name: str
    key: str
    description: str | None = None


class ExpenseCategoryCreate(CategoryCreate):
    pass


class IncomeCategoryCreate(CategoryCreate):
    pass


class GetSpendingParams(BaseModel):
    currencyCode: str
    dateFrom: str
    dateTo: str
    categoryKey: str | None = None


class GetIncomeParams(BaseModel):
    currencyCode: str
    dateFrom: str
    dateTo: str
    categoryKey: str | None = None


class FindSpendingsParams(BaseModel):
    currencyCode: str
    dateFrom: str
    dateTo: str
    categoryKeys: List[str] | None = None
    searchQuery: str | None = None
    amountFrom: float | None = None
    amountTo: float | None = None


class FindIncomesParams(BaseModel):
    currencyCode: str
    dateFrom: str
    dateTo: str
    categoryKeys: List[str] | None = None
    searchQuery: str | None = None
    amountFrom: float | None = None
    amountTo: float | None = None


class TransferCreate(BaseModel):
    amount: float
    description: str
    message: str
    fromAccountKey: str
    toAccountKey: str
    createdAt: str | None = None


class GetTransfersParams(BaseModel):
    dateFrom: str
    dateTo: str
    fromAccountKey: str | None = None
    toAccountKey: str | None = None
    amountFrom: float | None = None
    amountTo: float | None = None


class FindTransfersParams(BaseModel):
    dateFrom: str
    dateTo: str
    fromAccountKey: str | None = None
    toAccountKey: str | None = None
    amountFrom: float | None = None
    amountTo: float | None = None


class FinancialAccountCreate(BaseModel):
    accountType: Literal["REGULAR", "SAVINGS", "DEBT"]
    name: str
    key: str
    balance: float
    currencyCode: str
    description: str | None = None


class SubscriptionData(BaseModel):
    """Subscription data for a user"""

    id: str
    subscription_id: str
    product_id: str
    variant_id: str
    customer_id: str
    user_email: str
    status: str
    trial_ends_at: datetime | None
    renews_at: datetime
    ends_at: datetime | None
    card_brand: str | None
    card_last_four: str | None
    created_at: datetime
    updated_at: datetime


class IncomeCategoryData(BaseModel):
    """Income category data"""

    id: str
    key: str
    name: str
    description: str | None
    color: str
    image_id: str | None
    created_at: datetime
    updated_at: datetime


class ExpenseCategoryData(BaseModel):
    """Expense category data"""

    id: str
    key: str
    name: str
    description: str | None
    color: str | None
    image_id: str | None
    created_at: datetime
    updated_at: datetime


class AccountData(BaseModel):
    """Financial account data"""

    id: str
    key: str
    account_type: str
    name: str
    description: str | None
    balance: str
    currency_code: str
    created_at: datetime
    updated_at: datetime


class TransactionTagData(BaseModel):
    """Transaction tag data"""

    id: str
    name: str


class UserData(BaseModel):
    """User data returned from the upsert-user endpoint"""

    id: str
    name: str | None
    phone_number: str
    country_code: str | None  # ISO 3166-1 alpha-2
    favorite_language: str | None  # ISO 639-1
    favorite_currency_code: str | None  # ISO 4217
    favorite_locale: str | None  # BCP 47
    favorite_timezone: str | None  # IANA Time Zone Database
    user_profile_insights: str | None
    chatId: str
    weeklyReport: bool
    encryption_key: str | None  # Encrypted encryption key
    recovery_key: str | None  # Encrypted recovery key
    created_at: datetime
    updated_at: datetime
    subscription: SubscriptionData | None
    expense_categories: List[ExpenseCategoryData]
    income_categories: List[IncomeCategoryData]
    accounts: List[AccountData]
    expenses_count: int
    transaction_tags: List[TransactionTagData]


class BudgetCreate(BaseModel):
    amount: float
    year: int
    currencyCode: str
    month: int


class GetBudgetParams(BaseModel):
    year: int
    month: int
    currencyCode: str


class ExpenseCategoryBudgetCreate(BaseModel):
    categoryKey: str
    amount: float
    year: int
    currencyCode: str
    month: int


class GetBudgetByCategoryParams(BaseModel):
    categoryKey: str
    year: int
    month: int
    currencyCode: str


class GetSavingsParams(BaseModel):
    savingsAccountsKeys: List[str]


class MainAPIService:
    def __init__(self):
        self.base_url = settings.MAIN_API_URL.rstrip("/")
        logger.info(f"🌐 Main API URL: {self.base_url}")
        self.headers = {
            "Authorization": f"Bearer {settings.AGENT_API_SECRET}",
            "Content-Type": "application/json",
        }

    async def _make_request(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        response_model: Type[MainAPIResponse[T]],
    ) -> MainAPIResponse[T]:
        """
        Generic method to make requests to the main API
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}{endpoint}",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0,
                )

                logger.info(f"📡 Response status: {response.status_code}")
                logger.info(f"📡 Response headers: {dict(response.headers)}")

                if response.status_code == 401:
                    logger.error(f"❌ 401 Unauthorized - Check AGENT_API_SECRET")
                    raise HTTPException(
                        status_code=401,
                        detail="Unauthorized access to main API. Check AGENT_API_SECRET.",
                    )

                response.raise_for_status()

                response_data = response.json()

                return response_model(**response_data)

        except httpx.TimeoutException as e:
            logger.error(f"⏰ Timeout error: {str(e)}")
            raise HTTPException(status_code=504, detail="Request to main API timed out")
        except httpx.HTTPStatusError as e:
            logger.error(
                f"📡 HTTP status error: {e.response.status_code} - {e.response.text}"
            )
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"HTTP error {e.response.status_code}: {e.response.text}",
            )
        except httpx.HTTPError as e:
            logger.error(f"🌐 HTTP error: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"HTTP error calling main API: {str(e)}"
            )
        except Exception as e:
            logger.error(f"💥 Unexpected error in _make_request: {str(e)}")
            logger.error(f"💥 Error type: {type(e).__name__}")
            import traceback

            logger.error(f"💥 Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Unexpected error calling main API: {str(e)}"
            )

    async def call_customer_support(
        self, phone_number: str, context: str
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to initiate customer support call
        """
        return await self._make_request(
            endpoint="/v1/tools/call-for-customer-support",
            payload={"phoneNumber": phone_number, "context": context},
            response_model=MainAPIResponse[ToolResponse],
        )

    async def save_user_feedback(
        self, feedback: str, phone_number: str
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to save user feedback
        """
        return await self._make_request(
            endpoint="/v1/tools/save-user-feedback",
            payload={"feedback": feedback, "phoneNumber": phone_number},
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_customer_billing_portal_link(
        self, phone_number: str
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get the customer billing portal link
        """
        return await self._make_request(
            endpoint="/v1/tools/get-customer-billing-portal-link",
            payload={"phoneNumber": phone_number},
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_checkout_payment_link(
        self, phone_number: str
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get the checkout payment link
        """
        return await self._make_request(
            endpoint="/v1/tools/get-checkout-payment-link",
            payload={"phoneNumber": phone_number},
            response_model=MainAPIResponse[ToolResponse],
        )

    async def register_expenses(
        self, user_phone_number: str, expenses: List[ExpenseItem]
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to register user expenses
        """
        return await self._make_request(
            endpoint="/v1/tools/register-expenses",
            payload={
                "phoneNumber": user_phone_number,
                "expenses": [
                    expense.model_dump(exclude_none=True) for expense in expenses
                ],
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def register_incomes(
        self, user_phone_number: str, incomes: List[IncomeItem]
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to register user incomes
        """
        return await self._make_request(
            endpoint="/v1/tools/register-incomes",
            payload={
                "phoneNumber": user_phone_number,
                "incomes": [income.model_dump(exclude_none=True) for income in incomes],
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def create_expense_category(
        self, user_phone_number: str, category: ExpenseCategoryCreate
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to create an expense category
        """
        return await self._make_request(
            endpoint="/v1/tools/create-expense-category",
            payload={
                "phoneNumber": user_phone_number,
                **category.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def create_income_category(
        self, user_phone_number: str, category: IncomeCategoryCreate
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to create an income category
        """
        return await self._make_request(
            endpoint="/v1/tools/create-income-category",
            payload={
                "phoneNumber": user_phone_number,
                **category.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_spending(
        self, user_phone_number: str, params: GetSpendingParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get user spending for a date range
        """
        return await self._make_request(
            endpoint="/v1/tools/get-spending",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_income(
        self, user_phone_number: str, params: GetIncomeParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get user income for a date range
        """
        return await self._make_request(
            endpoint="/v1/tools/get-income",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def find_spendings(
        self, user_phone_number: str, params: FindSpendingsParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to find user spendings with filters
        """
        return await self._make_request(
            endpoint="/v1/tools/find-spendings",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def find_incomes(
        self, user_phone_number: str, params: FindIncomesParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to find user incomes with filters
        """
        return await self._make_request(
            endpoint="/v1/tools/find-incomes",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def create_financial_account(
        self, user_phone_number: str, account: FinancialAccountCreate
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to create a financial account
        """
        try:
            response = await self._make_request(
                endpoint="/v1/tools/create-financial-account",
                payload={
                    "phoneNumber": user_phone_number,
                    **account.model_dump(exclude_none=True),
                },
                response_model=MainAPIResponse[ToolResponse],
            )
            return response
        except Exception as e:
            logger.error(f"❌ Error in create_financial_account: {str(e)}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            import traceback

            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            raise

    async def transfer_money_between_accounts(
        self, user_phone_number: str, transfers: List[TransferCreate]
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to transfer money between accounts
        """
        return await self._make_request(
            endpoint="/v1/tools/transfer-money-between-accounts",
            payload={
                "phoneNumber": user_phone_number,
                "transfers": [
                    transfer.model_dump(exclude_none=True) for transfer in transfers
                ],
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_transfers(
        self, user_phone_number: str, params: GetTransfersParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get transfers between accounts
        """
        return await self._make_request(
            endpoint="/v1/tools/get-transfers",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def find_transfers(
        self, user_phone_number: str, params: FindTransfersParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to find transfers between accounts with filters
        """
        return await self._make_request(
            endpoint="/v1/tools/find-transfers",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_account_balance(
        self, user_phone_number: str, account_key: str
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get account balance
        """
        return await self._make_request(
            endpoint="/v1/tools/get-account-balance",
            payload={
                "phoneNumber": user_phone_number,
                "accountKey": account_key,
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def create_transaction_tags(
        self, phone_number: str, tags: List[str]
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to create transaction tags
        """
        return await self._make_request(
            endpoint="/v1/tools/create-transaction-tags",
            payload={
                "phoneNumber": phone_number,
                "tags": tags,
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def upsert_user(
        self, phone_number: str, contact_name: str | None = None
    ) -> MainAPIResponse[UserData]:
        """
        Make a POST request to upsert (create or update) a user.
        This endpoint ensures the user exists and returns their data.

        Args:
            phone_number: The user's phone number
            contact_name: Optional contact name from WhatsApp
        """
        logger.info(f"🌐 Main API URL: {self.base_url}")
        return await self._make_request(
            endpoint="/v1/tools/upsert-user",
            payload={
                "phoneNumber": phone_number,
                "name": contact_name,
            },
            response_model=MainAPIResponse[UserData],
        )

    async def set_budget(
        self, user_phone_number: str, budget: BudgetCreate
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to set a general budget
        """
        return await self._make_request(
            endpoint="/v1/tools/set-budget",
            payload={
                "phoneNumber": user_phone_number,
                **budget.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_budget(
        self, user_phone_number: str, params: GetBudgetParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get the general budget
        """
        return await self._make_request(
            endpoint="/v1/tools/get-budget",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def set_expense_category_budget(
        self, user_phone_number: str, budget: ExpenseCategoryBudgetCreate
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to set a budget for a specific expense category
        """
        return await self._make_request(
            endpoint="/v1/tools/set-expense-category-budget",
            payload={
                "phoneNumber": user_phone_number,
                **budget.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_budget_by_category(
        self, user_phone_number: str, params: GetBudgetByCategoryParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get the budget for a specific category
        """
        return await self._make_request(
            endpoint="/v1/tools/get-budget-by-category",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    async def get_savings(
        self, user_phone_number: str, params: GetSavingsParams
    ) -> MainAPIResponse[ToolResponse]:
        """
        Make a POST request to get savings information
        """
        return await self._make_request(
            endpoint="/v1/tools/get-savings",
            payload={
                "phoneNumber": user_phone_number,
                **params.model_dump(exclude_none=True),
            },
            response_model=MainAPIResponse[ToolResponse],
        )

    # Example of how to add another tool endpoint:
    # async def get_weather(self, location: str) -> WeatherResponse:
    #     return await self._make_request(
    #         endpoint="/v1/tools/weather",
    #         payload={"location": location},
    #         response_model=WeatherResponse
    #     )


# Create a singleton instance
main_api_service = MainAPIService()
