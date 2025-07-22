import base64
import logging
import httpx
from typing import Optional, Dict, Any, List
from mistralai import Mistral
from mistralai.models import UserMessage, SystemMessage
from mistralai import models as mistral_models
from mistralai.extra import response_format_from_pydantic_model
from pydantic import BaseModel
from app.core.config import get_settings
from app.utils.error_handler import handle_error

settings = get_settings()
logger = logging.getLogger(__name__)


class ExtractedExpense(BaseModel):
    """Expense extracted from document using Mistral annotation API"""

    amount: float
    description: str
    date: str  # Format: YYYY-MM-DD
    category: str


class ExtractedIncome(BaseModel):
    """Income extracted from document using Mistral annotation API"""

    amount: float
    description: str
    date: str  # Format: YYYY-MM-DD
    category: str


class FinancialDocumentData(BaseModel):
    """Response format for financial document annotation"""

    expenses: List[ExtractedExpense]
    incomes: List[ExtractedIncome]


class MistralService:
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        # Create httpx client with custom timeout for the Mistral SDK
        http_client = httpx.AsyncClient(timeout=httpx.Timeout(120.0))
        self.client = Mistral(api_key=self.api_key, async_client=http_client)

    async def process_document_ocr(
        self, media_content: bytes, mime_type: str, user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process document or image using Mistral OCR API

        Args:
            media_content: The binary content of the document/image
            mime_type: MIME type of the file
            user_id: User ID for error handling

        Returns:
            Dict containing OCR results and metadata
        """
        try:
            logger.info(
                f"Starting OCR processing for user {user_id}, mime_type: {mime_type}"
            )

            # Check file size (50MB limit)
            file_size_mb = len(media_content) / (1024 * 1024)
            logger.info(f"File size: {file_size_mb:.2f} MB")

            if file_size_mb > 50:
                logger.warning(
                    f"File size {file_size_mb:.2f} MB exceeds 50MB limit for user {user_id}"
                )
                return {
                    "success": False,
                    "error": "size_limit",
                    "message": "Your document has to be less than 50 MB, consider splitting the document",
                }

            # Convert to base64
            media_base64 = base64.b64encode(media_content).decode("utf-8")
            logger.info(f"Converted file to base64, length: {len(media_base64)} chars")

            # Determine document type based on MIME type
            if mime_type.startswith("image/"):
                document_type = "image_url"
                logger.info("Processing as image document")
            else:
                document_type = "document_url"
                logger.info("Processing as document")

            # Prepare the OCR request using Mistral SDK
            document_config = {
                "type": document_type,
                f"{document_type}": f"data:{mime_type};base64,{media_base64}",
            }

            logger.info(f"Sending OCR request to Mistral API for user {user_id}")

            ocr_response = await self.client.ocr.process_async(
                model="mistral-ocr-latest",
                document=document_config,
                include_image_base64=True,
            )

            logger.info(f"OCR processing successful for user {user_id}")

            # Extract text from all pages, not just the first one
            extracted_text = ""
            if ocr_response.pages:
                page_texts = []
                for i, page in enumerate(ocr_response.pages):
                    if hasattr(page, "markdown") and page.markdown:
                        page_texts.append(f"--- Page {i + 1} ---\n{page.markdown}")
                    elif hasattr(page, "text") and page.text:
                        page_texts.append(f"--- Page {i + 1} ---\n{page.text}")

                extracted_text = "\n\n".join(page_texts)
                logger.info(f"Extracted text from {len(ocr_response.pages)} page(s)")
            else:
                logger.warning("No pages found in OCR response")

            logger.info(
                f"OCR processing successful. Total extracted text length: {len(extracted_text)} chars"
            )
            logger.debug(f"Extracted text preview: {extracted_text[:200]}...")

            return {
                "success": True,
                "extracted_text": extracted_text,
                "metadata": {
                    "file_size_mb": round(file_size_mb, 2),
                    "mime_type": mime_type,
                    "processing_model": "mistral-ocr-latest",
                },
                "raw_result": (
                    ocr_response.model_dump()
                    if hasattr(ocr_response, "model_dump")
                    else str(ocr_response)
                ),
            }

        except mistral_models.SDKError as e:
            if hasattr(e, "status_code") and e.status_code:
                if e.status_code == 504:  # Gateway timeout
                    logger.error(f"OCR processing timeout for user {user_id}")
                    await handle_error(
                        error=Exception("OCR processing timeout"),
                        user_id=user_id,
                        endpoint="mistral_service.process_document_ocr",
                        message="OCR processing timed out",
                    )
                    return {
                        "success": False,
                        "error": "timeout",
                        "message": "Document processing timed out. Please try with a smaller document.",
                    }
                else:
                    logger.error(
                        f"OCR API error: {e.status_code} - {e.message if hasattr(e, 'message') else str(e)}"
                    )
                    await handle_error(
                        error=Exception(f"Mistral OCR API error: {e.status_code}"),
                        user_id=user_id,
                        endpoint="mistral_service.process_document_ocr",
                        message=f"OCR processing failed with status {e.status_code}",
                    )
                    return {
                        "success": False,
                        "error": "ocr_api_error",
                        "message": "Failed to process document with OCR",
                    }
            else:
                logger.error(
                    f"Mistral SDK error during OCR processing for user {user_id}: {str(e)}"
                )
                await handle_error(
                    error=e,
                    user_id=user_id,
                    endpoint="mistral_service.process_document_ocr",
                    message="Mistral SDK error during OCR processing",
                )
                return {
                    "success": False,
                    "error": "sdk_error",
                    "message": "An error occurred while processing your document.",
                }

        except Exception as e:
            logger.error(
                f"Unexpected error during OCR processing for user {user_id}: {str(e)}"
            )
            await handle_error(
                error=e,
                user_id=user_id,
                endpoint="mistral_service.process_document_ocr",
                message="Unexpected error during OCR processing",
            )
            return {
                "success": False,
                "error": "unexpected_error",
                "message": "An unexpected error occurred while processing your document.",
            }

    async def process_financial_document_with_annotation(
        self,
        media_content: bytes,
        mime_type: str,
        user_id: Optional[str] = None,
        media_base64: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process document or image using Mistral's document annotation API to directly extract financial data

        Args:
            media_content: The binary content of the document/image
            mime_type: MIME type of the file
            user_id: User ID for error handling
            media_base64: Optional pre-encoded base64 string (if provided, skips encoding step)

        Returns:
            Dict containing extracted financial data (expenses and incomes)
        """
        try:
            logger.info(
                f"Starting financial document annotation for user {user_id}, mime_type: {mime_type}"
            )

            # Check file size (50MB limit)
            file_size_mb = len(media_content) / (1024 * 1024)
            logger.info(f"File size: {file_size_mb:.2f} MB")

            if file_size_mb > 50:
                logger.warning(
                    f"File size {file_size_mb:.2f} MB exceeds 50MB limit for user {user_id}"
                )
                return {
                    "success": False,
                    "error": "size_limit",
                    "message": "Your document has to be less than 50 MB, consider splitting the document",
                }

            # Convert to base64 if not provided
            if media_base64 is None:
                media_base64 = base64.b64encode(media_content).decode("utf-8")
                logger.info(
                    f"Converted file to base64, length: {len(media_base64)} chars"
                )
            else:
                logger.info(
                    f"Using provided base64 string, length: {len(media_base64)} chars"
                )

            # Determine document type based on MIME type
            if mime_type.startswith("image/"):
                document_type = "image_url"
                logger.info("Processing as image document")
            else:
                document_type = "document_url"
                logger.info("Processing as document")

            # Prepare the document annotation request using Mistral SDK
            document_config = {
                "type": document_type,
                f"{document_type}": f"data:{mime_type};base64,{media_base64}",
            }

            logger.info(
                f"Sending document annotation request to Mistral API for user {user_id}"
            )

            # Use document annotation API to extract structured financial data
            annotation_response = await self.client.ocr.process_async(
                model="mistral-ocr-latest",
                document=document_config,
                document_annotation_format=response_format_from_pydantic_model(
                    FinancialDocumentData
                ),
                include_image_base64=True,
            )

            logger.info(f"Document annotation processing successful for user {user_id}")

            # Extract the structured data from the annotation response
            if (
                hasattr(annotation_response, "document_annotation")
                and annotation_response.document_annotation
            ):
                # Parse the JSON string returned by the annotation API
                import json

                try:
                    financial_data = json.loads(annotation_response.document_annotation)
                except (json.JSONDecodeError, TypeError) as e:
                    logger.error(
                        f"Failed to parse document annotation JSON for user {user_id}: {str(e)}"
                    )
                    logger.error(
                        f"Raw annotation response: {annotation_response.document_annotation}"
                    )
                    return {
                        "success": True,
                        "has_financial_data": False,
                        "expenses": [],
                        "incomes": [],
                        "metadata": {
                            "file_size_mb": round(file_size_mb, 2),
                            "mime_type": mime_type,
                            "processing_model": "mistral-ocr-latest",
                            "total_transactions": 0,
                        },
                    }

                expenses = financial_data.get("expenses", [])
                incomes = financial_data.get("incomes", [])

                logger.info(
                    f"Extracted {len(expenses)} expenses and {len(incomes)} incomes for user {user_id}"
                )

                return {
                    "success": True,
                    "has_financial_data": len(expenses) > 0 or len(incomes) > 0,
                    "expenses": expenses,
                    "incomes": incomes,
                    "metadata": {
                        "file_size_mb": round(file_size_mb, 2),
                        "mime_type": mime_type,
                        "processing_model": "mistral-ocr-latest",
                        "total_transactions": len(expenses) + len(incomes),
                    },
                }
            else:
                logger.warning(
                    f"No document annotation found in response for user {user_id}"
                )
                return {
                    "success": True,
                    "has_financial_data": False,
                    "expenses": [],
                    "incomes": [],
                    "metadata": {
                        "file_size_mb": round(file_size_mb, 2),
                        "mime_type": mime_type,
                        "processing_model": "mistral-ocr-latest",
                        "total_transactions": 0,
                    },
                }

        except mistral_models.SDKError as e:
            if hasattr(e, "status_code") and e.status_code:
                if e.status_code == 504:  # Gateway timeout
                    logger.error(
                        f"Document annotation processing timeout for user {user_id}"
                    )
                    await handle_error(
                        error=Exception("Document annotation processing timeout"),
                        user_id=user_id,
                        endpoint="mistral_service.process_financial_document_with_annotation",
                        message="Document annotation processing timed out",
                    )
                    return {
                        "success": False,
                        "error": "timeout",
                        "message": "Document processing timed out. Please try with a smaller document.",
                    }
                else:
                    logger.error(
                        f"Document annotation API error: {e.status_code} - {e.message if hasattr(e, 'message') else str(e)}"
                    )
                    await handle_error(
                        error=Exception(
                            f"Mistral document annotation API error: {e.status_code}"
                        ),
                        user_id=user_id,
                        endpoint="mistral_service.process_financial_document_with_annotation",
                        message=f"Document annotation processing failed with status {e.status_code}",
                    )
                    return {
                        "success": False,
                        "error": "annotation_api_error",
                        "message": "Failed to process document with annotation API",
                    }
            else:
                logger.error(
                    f"Mistral SDK error during document annotation for user {user_id}: {str(e)}"
                )
                await handle_error(
                    error=e,
                    user_id=user_id,
                    endpoint="mistral_service.process_financial_document_with_annotation",
                    message="Mistral SDK error during document annotation",
                )
                return {
                    "success": False,
                    "error": "sdk_error",
                    "message": "An error occurred while processing your document.",
                }

        except Exception as e:
            logger.error(
                f"Unexpected error during document annotation for user {user_id}: {str(e)}"
            )
            await handle_error(
                error=e,
                user_id=user_id,
                endpoint="mistral_service.process_financial_document_with_annotation",
                message="Unexpected error during document annotation",
            )
            return {
                "success": False,
                "error": "unexpected_error",
                "message": "An unexpected error occurred while processing your document.",
            }


# Create singleton instance
mistral_service = MistralService()
