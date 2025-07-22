from openai import OpenAI
from app.core.config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)


CHAT_GPT4_MINI_TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe"

max_tokens_per_minute = 50000
max_requests_per_minute = 500


async def transcribe_audio(audio_content: bytes, mime_type: str) -> str:
    """
    Transcribe audio content using OpenAI's API.

    Args:
        audio_content: Raw audio content in bytes
        mime_type: MIME type of the audio (e.g., 'audio/mp4', 'audio/mpeg', 'audio/ogg')

    Returns:
        str: Transcribed text from the audio

    Raises:
        Exception: If transcription fails
    """
    try:
        # Create a file-like object from bytes
        from io import BytesIO

        audio_file = BytesIO(audio_content)

        # Set a name with appropriate extension based on mime_type
        # Handle both simple MIME types (audio/ogg) and those with codec info (audio/ogg; codecs=opus)
        mime_subtype = mime_type.split("/")[-1]
        extension = mime_subtype.split(";")[0].strip()
        audio_file.name = f"audio.{extension}"

        # Request transcription
        transcript = client.audio.transcriptions.create(
            model=CHAT_GPT4_MINI_TRANSCRIBE_MODEL,  # Using Whisper model as it's the current standard for OpenAI transcription
            file=audio_file,
        )

        return transcript.text

    except Exception as e:
        raise Exception(f"Failed to transcribe audio: {str(e)}")
