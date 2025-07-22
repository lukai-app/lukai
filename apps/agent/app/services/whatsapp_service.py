from typing import Dict, Any
import httpx
from app.core.config import get_settings

settings = get_settings()


async def send_message(to: str, message: str) -> Dict[str, Any]:
    """
    Send a WhatsApp message using the WhatsApp Business API.

    Args:
        to: The recipient's phone number
        message: The message text to send

    Returns:
        Dict[str, Any]: The API response

    Raises:
        HTTPException: If the message sending fails
    """
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            }

            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": to,
                "type": "text",
                "text": {"body": message},
            }

            response = await client.post(
                f"{settings.WHATSAPP_API_URL}/v21.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
                headers=headers,
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

    except httpx.TimeoutException:
        raise Exception("Request to WhatsApp API timed out while sending message")
    except httpx.HTTPError as e:
        raise Exception(f"Error sending message via WhatsApp API: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error while sending message: {str(e)}")
