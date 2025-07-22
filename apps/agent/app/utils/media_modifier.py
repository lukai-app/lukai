import base64
import logging
from io import BytesIO
from typing import List, Optional

from PIL import Image, ImageDraw, ImageFont
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

logger = logging.getLogger(__name__)


def modify_image_with_context(
    image_bytes: bytes,
    caption: Optional[str],
    expense_category_keys: List[str],
    income_category_keys: List[str],
    mime_type: str = "image/jpeg",
) -> str:
    """
    Modify an image by adding user context (caption and categories) at the bottom.

    Args:
        image_bytes: Original image as bytes
        caption: User-provided caption (optional)
        expense_category_keys: List of expense category keys
        income_category_keys: List of income category keys
        mime_type: MIME type of the image

    Returns:
        Base64 encoded string of the modified image

    Raises:
        Exception: If image modification fails
    """
    try:
        logger.info("Starting image modification with context embedding")
        logger.info(
            f"Context to embed - Caption: '{caption}', Expense categories: {expense_category_keys}, Income categories: {income_category_keys}"
        )

        # Open original image and convert to RGB
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        width, height = image.size

        logger.info(f"Original image size: {width}x{height}")

        # Calculate text area height needed
        # Estimate: caption + expense categories + income categories + padding
        lines_needed = 1  # Base padding
        if caption:
            lines_needed += 2  # Caption + blank line
        if expense_category_keys:
            lines_needed += 2  # Label + categories
        if income_category_keys:
            lines_needed += 2  # Label + categories

        line_height = 25
        extra_height = lines_needed * line_height + 20  # Extra padding

        logger.info(f"Adding {extra_height}px for context text")

        # Create new image with extra height
        new_image = Image.new("RGB", (width, height + extra_height), (255, 255, 255))

        # Paste original image at the top
        new_image.paste(image, (0, 0))

        # Draw context text at the bottom
        draw = ImageDraw.Draw(new_image)

        # Try to load a better font, fallback to default
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        except:
            font = ImageFont.load_default()

        # Starting position for text
        text_y = height + 10
        text_x = 10

        # Add caption if provided
        if caption:
            draw.text(
                (text_x, text_y), f"User caption: {caption}", fill="black", font=font
            )
            text_y += line_height * 2

        # Add expense categories
        if expense_category_keys:
            draw.text((text_x, text_y), "Expense categories:", fill="black", font=font)
            text_y += line_height
            categories_text = ", ".join(expense_category_keys)
            draw.text((text_x, text_y), categories_text, fill="black", font=font)
            text_y += line_height * 1.5

        # Add income categories
        if income_category_keys:
            draw.text((text_x, text_y), "Income categories:", fill="black", font=font)
            text_y += line_height
            categories_text = ", ".join(income_category_keys)
            draw.text((text_x, text_y), categories_text, fill="black", font=font)

        # Save modified image to buffer
        buffer = BytesIO()
        format_name = "JPEG" if mime_type.startswith("image/jpeg") else "PNG"
        new_image.save(buffer, format=format_name, quality=90)

        # Convert to base64
        base64_string = base64.b64encode(buffer.getvalue()).decode()

        logger.info("Image modification completed successfully")
        return base64_string

    except Exception as e:
        logger.error(f"Failed to modify image: {str(e)}")
        raise Exception(f"Image modification failed: {str(e)}")


def create_context_page(
    caption: Optional[str],
    expense_category_keys: List[str],
    income_category_keys: List[str],
) -> PdfReader:
    """
    Create a PDF page with context information.

    Args:
        caption: User-provided caption (optional)
        expense_category_keys: List of expense category keys
        income_category_keys: List of income category keys

    Returns:
        PdfReader object containing the context page
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    # Starting position for text
    y_position = 750
    x_position = 50
    line_height = 25

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x_position, y_position, "Document Context Information")
    y_position -= line_height * 2

    # Set regular font for content
    c.setFont("Helvetica", 12)

    # Add caption if provided
    if caption:
        c.drawString(x_position, y_position, f"User caption: {caption}")
        y_position -= line_height * 2

    # Add expense categories
    if expense_category_keys:
        c.drawString(x_position, y_position, "Expense categories:")
        y_position -= line_height
        categories_text = ", ".join(expense_category_keys)
        c.drawString(x_position + 20, y_position, categories_text)
        y_position -= line_height * 2

    # Add income categories
    if income_category_keys:
        c.drawString(x_position, y_position, "Income categories:")
        y_position -= line_height
        categories_text = ", ".join(income_category_keys)
        c.drawString(x_position + 20, y_position, categories_text)

    c.save()
    buffer.seek(0)
    return PdfReader(buffer)


def modify_pdf_with_context(
    pdf_bytes: bytes,
    caption: Optional[str],
    expense_category_keys: List[str],
    income_category_keys: List[str],
) -> str:
    """
    Modify a PDF by adding a context page at the end.

    Args:
        pdf_bytes: Original PDF as bytes
        caption: User-provided caption (optional)
        expense_category_keys: List of expense category keys
        income_category_keys: List of income category keys

    Returns:
        Base64 encoded string of the modified PDF

    Raises:
        Exception: If PDF modification fails
    """
    try:
        logger.info("Starting PDF modification with context embedding")
        logger.info(
            f"Context to embed - Caption: '{caption}', Expense categories: {expense_category_keys}, Income categories: {income_category_keys}"
        )

        # Read original PDF
        original = PdfReader(BytesIO(pdf_bytes))
        writer = PdfWriter()

        # Add all original pages
        for page in original.pages:
            writer.add_page(page)

        logger.info(f"Original PDF has {len(original.pages)} pages")

        # Create and add context page
        context_page_reader = create_context_page(
            caption, expense_category_keys, income_category_keys
        )
        writer.add_page(context_page_reader.pages[0])

        logger.info("Added context page to PDF")

        # Save modified PDF to buffer
        buffer = BytesIO()
        writer.write(buffer)

        # Convert to base64
        base64_string = base64.b64encode(buffer.getvalue()).decode()

        logger.info("PDF modification completed successfully")
        return base64_string

    except Exception as e:
        logger.error(f"Failed to modify PDF: {str(e)}")
        raise Exception(f"PDF modification failed: {str(e)}")


def modify_media_with_context(
    media_bytes: bytes,
    mime_type: str,
    caption: Optional[str],
    expense_category_keys: List[str],
    income_category_keys: List[str],
) -> str:
    """
    Modify media (image or PDF) by embedding context information.

    Args:
        media_bytes: Original media as bytes
        mime_type: MIME type of the media
        caption: User-provided caption (optional)
        expense_category_keys: List of expense category keys
        income_category_keys: List of income category keys

    Returns:
        Base64 encoded string of the modified media

    Raises:
        Exception: If media modification fails
    """
    try:
        if mime_type.startswith("image/"):
            return modify_image_with_context(
                media_bytes,
                caption,
                expense_category_keys,
                income_category_keys,
                mime_type,
            )
        elif mime_type == "application/pdf" or mime_type.startswith("application/"):
            return modify_pdf_with_context(
                media_bytes, caption, expense_category_keys, income_category_keys
            )
        else:
            raise Exception(f"Unsupported MIME type for modification: {mime_type}")

    except Exception as e:
        logger.error(f"Media modification failed for MIME type {mime_type}: {str(e)}")
        raise
