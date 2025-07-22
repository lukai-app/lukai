# To update requirements: pip freeze > requirements.txt
import logging
from fastapi import FastAPI
from app.core.config import get_settings
from app.api.v1.endpoints import webhooks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Console output
    ],
)

# Initialize settings
settings = get_settings()

# Verify required environment variables
if not settings.OPENAI_API_KEY:
    raise ValueError(
        "OPENAI_API_KEY environment variable is not set. "
        "Please set it in your .env file or environment variables."
    )

# Verify Mistral API key
if not settings.MISTRAL_API_KEY:
    raise ValueError(
        "MISTRAL_API_KEY environment variable is not set. "
        "Please set it in your .env file or environment variables."
    )

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LukAI Python Agent Service - AI-powered scheduling and automation",
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
)

# Include routers
app.include_router(
    webhooks.router, prefix=f"{settings.API_V1_STR}/webhooks", tags=["webhooks"]
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
