from mixpanel import Mixpanel
from functools import lru_cache
from app.core.config import get_settings


@lru_cache()
def get_mixpanel() -> Mixpanel:
    """
    Returns a singleton instance of Mixpanel client.
    Uses lru_cache to ensure only one instance is created.
    """
    settings = get_settings()
    return Mixpanel(settings.MIXPANEL_TOKEN)


# Create a global instance that can be imported and used throughout the application
mixpanel = get_mixpanel()
