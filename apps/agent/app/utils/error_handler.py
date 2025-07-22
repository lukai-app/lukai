import logging
from typing import Optional
from app.core.config import get_settings
from app.services.whatsapp_service import send_message

settings = get_settings()


async def handle_error(
    error: Exception, user_id: Optional[str], endpoint: str, message: str
) -> None:
    """
    Handle errors by logging them and notifying admin via WhatsApp.

    Args:
        error: The exception that occurred
        user_id: The user's phone number or identifier (optional)
        endpoint: The endpoint/function where the error occurred
        message: Additional context about the error
    """
    # Log the error
    logging.error(f"Error at {endpoint}: {str(error)} for user {user_id}")
    logging.error(f"Additional context: {message}")

    # Format WhatsApp message
    whatsapp_message = (
        f"🚨 Error at {endpoint}\n"
        f"User: {user_id or 'Unknown'}\n"
        f"Error: {str(error)}\n"
        f"Context: {message}"
    )

    try:
        # Send WhatsApp notification to admin
        await send_message(to=settings.WHATSAPP_ADMIN_NUMBER, message=whatsapp_message)
    except Exception as e:
        # If sending WhatsApp message fails, just log it
        logging.error(f"Failed to send error notification to admin: {str(e)}")
