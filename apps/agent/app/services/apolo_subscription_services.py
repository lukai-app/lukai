from agents import Agent, Runner, ModelSettings
from typing import List, Dict, Any
from app.services.tools import (
    call_for_customer_support,
    get_customer_billing_portal_link,
    get_checkout_payment_link,
    get_income,
    get_spending,
    find_incomes,
    find_spendings,
)

from app.services.apolo_subscription_prompts import ApoloSubscriptionPromptFormatter
from app.services.main_api_service import UserData

model = "gpt-4o-mini"


class ApoloExpiredService:
    def __init__(self):
        self.prompt_formatter = ApoloSubscriptionPromptFormatter()

    def create_spanish_agent(self, user: UserData) -> Agent[UserData]:
        """Create Spanish agent for expired subscription users"""
        return Agent[UserData](
            name="Apolo Expired Spanish",
            handoff_description="A Spanish-speaking assistant.",
            model=model,
            instructions=self.prompt_formatter.format_expired_spanish_prompt(user),
            tools=[
                call_for_customer_support,
                # save_user_feedback,
                get_customer_billing_portal_link,
                get_income,
                get_spending,
                find_incomes,
                find_spendings,
            ],
        )

    def create_english_agent(self, user: UserData) -> Agent[UserData]:
        """Create English agent for expired subscription users"""
        return Agent[UserData](
            name="Apolo Expired English",
            handoff_description="An English-speaking assistant.",
            model=model,
            instructions=self.prompt_formatter.format_expired_english_prompt(user),
            tools=[
                call_for_customer_support,
                # save_user_feedback,
                get_customer_billing_portal_link,
                get_income,
                get_spending,
                find_incomes,
                find_spendings,
            ],
        )

    def create_multilingual_agent(self, user: UserData) -> Agent[UserData]:
        """Create multilingual agent for expired subscription users"""
        return Agent[UserData](
            name="Apolo Expired Multilingual",
            handoff_description="A multilingual assistant that can help the user in any language depending on the user's message language.",
            model=model,
            instructions=self.prompt_formatter.format_expired_multilingual_prompt(user),
            tools=[
                call_for_customer_support,
                # save_user_feedback,
                get_customer_billing_portal_link,
                get_income,
                get_spending,
                find_incomes,
                find_spendings,
            ],
        )

    def create_apolo_agent(self, user: UserData) -> Agent[UserData]:
        """Create main Apolo agent for expired subscription users"""
        spanish_agent = self.create_spanish_agent(user)
        english_agent = self.create_english_agent(user)
        multilingual_agent = self.create_multilingual_agent(user)

        return Agent[UserData](
            name="Apolo Expired",
            model=model,
            instructions="You have to handoff to the appropriate agent based on the user's message language. Multilingual when the user's message is not on spanish or english (first analize the message language and then handoff to the appropriate agent)",
            handoffs=[spanish_agent, english_agent, multilingual_agent],
            model_settings=ModelSettings(tool_choice="required"),
        )

    async def process_query(self, query: str, user_data: UserData) -> str:
        apolo_agent = self.create_apolo_agent(user_data)
        result = await Runner.run(
            apolo_agent,
            input=query,
            context=user_data,
        )
        return result.final_output

    async def process_conversation(
        self, conversation: List[Dict[str, Any]], user_data: UserData
    ) -> List[Dict[str, Any]]:
        apolo_agent = self.create_apolo_agent(user_data)
        result = await Runner.run(
            apolo_agent,
            input=conversation,
            context=user_data,
        )
        return result.final_output


class ApoloTrialConversionService:
    def __init__(self):
        self.prompt_formatter = ApoloSubscriptionPromptFormatter()

    def create_spanish_agent(self, user: UserData) -> Agent[UserData]:
        """Create Spanish agent for trial conversion"""
        return Agent[UserData](
            name="Apolo Trial Conversion Spanish",
            handoff_description="A Spanish-speaking assistant.",
            model=model,
            instructions=self.prompt_formatter.format_trial_conversion_spanish_prompt(
                user
            ),
            tools=[
                call_for_customer_support,
                # save_user_feedback,
                get_checkout_payment_link,
                get_income,
                get_spending,
                find_incomes,
                find_spendings,
            ],
        )

    def create_english_agent(self, user: UserData) -> Agent[UserData]:
        """Create English agent for trial conversion"""
        return Agent[UserData](
            name="Apolo Trial Conversion English",
            handoff_description="An English-speaking assistant.",
            model=model,
            instructions=self.prompt_formatter.format_trial_conversion_english_prompt(
                user
            ),
            tools=[
                call_for_customer_support,
                # save_user_feedback,
                get_checkout_payment_link,
                get_income,
                get_spending,
                find_incomes,
                find_spendings,
            ],
        )

    def create_multilingual_agent(self, user: UserData) -> Agent[UserData]:
        """Create multilingual agent for trial conversion"""
        return Agent[UserData](
            name="Apolo Trial Conversion Multilingual",
            handoff_description="A multilingual assistant that can help the user in any language depending on the user's message language.",
            model=model,
            instructions=self.prompt_formatter.format_trial_conversion_multilingual_prompt(
                user
            ),
            tools=[
                call_for_customer_support,
                # save_user_feedback,
                get_checkout_payment_link,
                get_income,
                get_spending,
                find_incomes,
                find_spendings,
            ],
        )

    def create_apolo_agent(self, user: UserData) -> Agent[UserData]:
        """Create main Apolo agent for trial conversion"""
        spanish_agent = self.create_spanish_agent(user)
        english_agent = self.create_english_agent(user)
        multilingual_agent = self.create_multilingual_agent(user)

        return Agent[UserData](
            name="Apolo Trial Conversion",
            model=model,
            instructions="You have to handoff to the appropriate agent based on the user's message language. Multilingual when the user's message is not on spanish or english (first analize the message language and then handoff to the appropriate agent)",
            handoffs=[spanish_agent, english_agent, multilingual_agent],
            model_settings=ModelSettings(tool_choice="required"),
        )

    async def process_query(self, query: str, user_data: UserData) -> str:
        apolo_agent = self.create_apolo_agent(user_data)
        result = await Runner.run(
            apolo_agent,
            input=query,
            context=user_data,
        )
        return result.final_output

    async def process_conversation(
        self, conversation: List[Dict[str, Any]], user_data: UserData
    ) -> List[Dict[str, Any]]:
        apolo_agent = self.create_apolo_agent(user_data)
        result = await Runner.run(
            apolo_agent,
            input=conversation,
            context=user_data,
        )
        return result.final_output


# Create singleton instances
apolo_expired_service = ApoloExpiredService()
apolo_trial_conversion_service = ApoloTrialConversionService()
