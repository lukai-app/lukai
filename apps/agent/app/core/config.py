from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "LukAI Agent API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    OPENAI_API_KEY: str
    MISTRAL_API_KEY: str

    # Main API Configuration
    MAIN_API_URL: str
    AGENT_API_SECRET: str

    # Mixpanel Configuration
    MIXPANEL_TOKEN: str

    # AI Configuration
    GOOGLE_API_KEY: str

    # WhatsApp Configuration
    WHATSAPP_VERIFY_TOKEN: str = "your_verify_token"  # Change this in .env
    WHATSAPP_API_TOKEN: str  # Your WhatsApp Business API token
    WHATSAPP_WEBHOOK_SECRET: str = (
        ""  # Your WhatsApp Webhook Secret for signature verification
    )
    WHATSAPP_SKIP_SIGNATURE_VERIFICATION: bool = (
        False  # Set to True for development only
    )
    WHATSAPP_API_URL: str = "https://graph.facebook.com"  # WhatsApp API base URL
    WHATSAPP_PHONE_NUMBER_ID: str  # Your WhatsApp Phone Number ID
    WHATSAPP_ADMIN_NUMBER: str  # Admin's WhatsApp number for error notifications

    # PostgreSQL Configuration for LangGraph
    CHAT_DATABASE_URL: str  # PostgreSQL connection string for conversation storage

    # LangSmith Configuration
    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str = ""

    # Documentation URLs (disable documentation)
    DOCS_URL: str | None = None
    REDOC_URL: str | None = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert string "None" to actual None for docs URLs
        if self.DOCS_URL == "None":
            self.DOCS_URL = None
        if self.REDOC_URL == "None":
            self.REDOC_URL = None

    # Upstash Redis settings
    UPSTASH_REDIS_REST_URL: str
    UPSTASH_REDIS_REST_TOKEN: str

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
