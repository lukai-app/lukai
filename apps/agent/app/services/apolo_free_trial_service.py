from app.services.apolo_service import ApoloService
from app.services.apolo_free_trial_prompt_formatter import ApoloFreeTrialPromptFormatter


class ApoloFreeTrialService(ApoloService):
    def __init__(self):
        super().__init__()
        self.prompt_formatter = ApoloFreeTrialPromptFormatter()


# Create a singleton instance
apolo_free_trial_service = ApoloFreeTrialService()
