#!/usr/bin/env python3
"""
Test script for Mistral OCR service with real PDF files
Place your test files in the root directory and this script will process them
Usage: python test_real_pdf.py
"""

import asyncio
import logging
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.mistral_service import mistral_service
from app.core.config import get_settings

# Configure logging for testing
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

logger = logging.getLogger(__name__)


def find_test_files():
    """Find PDF and image files in the root directory"""
    root_dir = Path(__file__).parent

    # Look for common financial document files
    pdf_patterns = ["*.pdf", "*.PDF", "*bank*", "*statement*", "*receipt*", "*invoice*"]

    image_patterns = [
        "*.jpg",
        "*.jpeg",
        "*.png",
        "*.webp",
        "*.gif",
        "*.JPG",
        "*.JPEG",
        "*.PNG",
        "*.WEBP",
        "*.GIF",
    ]

    found_files = []

    # Find PDFs
    for pattern in ["*.pdf", "*.PDF"]:
        found_files.extend(root_dir.glob(pattern))

    # Find images
    for pattern in image_patterns:
        found_files.extend(root_dir.glob(pattern))

    return sorted(found_files)


def get_mime_type(file_path):
    """Get MIME type based on file extension"""
    suffix = file_path.suffix.lower()

    mime_types = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }

    return mime_types.get(suffix, "application/octet-stream")


async def process_file(file_path):
    """Process a single file with OCR and validation"""
    logger.info(f"📄 Processing file: {file_path.name}")

    try:
        # Read file content
        with open(file_path, "rb") as f:
            file_content = f.read()

        file_size_mb = len(file_content) / (1024 * 1024)
        mime_type = get_mime_type(file_path)

        logger.info(f"   📊 File size: {file_size_mb:.2f} MB")
        logger.info(f"   🎯 MIME type: {mime_type}")

        # Process with OCR
        logger.info(f"   🔍 Starting OCR processing...")
        ocr_result = await mistral_service.process_document_ocr(
            media_content=file_content,
            mime_type=mime_type,
            user_id=f"test_user_{file_path.stem}",
        )

        if ocr_result["success"]:
            extracted_text = ocr_result["extracted_text"]
            logger.info(
                f"   ✅ OCR Success! Extracted {len(extracted_text)} characters"
            )

            # Show preview of extracted text
            preview = extracted_text[:200].replace("\n", " ").strip()
            logger.info(f"   📖 Text preview: {preview}...")

            # Validate if financial document
            logger.info(f"   🤖 Starting financial validation...")
            validation_result = await mistral_service.validate_financial_document(
                extracted_text=extracted_text, user_id=f"test_user_{file_path.stem}"
            )

            if validation_result["success"]:
                validation = validation_result["validation"]

                logger.info(f"   📋 VALIDATION RESULTS:")
                logger.info(
                    f"      • Is Financial: {validation.get('is_financial_document')}"
                )
                logger.info(
                    f"      • Contains Transactions: {validation.get('contains_transactions')}"
                )
                logger.info(f"      • Document Type: {validation.get('document_type')}")
                logger.info(
                    f"      • Confidence: {validation.get('confidence', 0):.2f}"
                )
                logger.info(
                    f"      • Est. Transactions: {validation.get('estimated_transaction_count')}"
                )
                logger.info(f"      • Reasoning: {validation.get('reasoning')}")

                return {
                    "file": file_path.name,
                    "ocr_success": True,
                    "validation_success": True,
                    "is_financial": validation.get("is_financial_document", False),
                    "contains_transactions": validation.get(
                        "contains_transactions", False
                    ),
                    "confidence": validation.get("confidence", 0),
                    "document_type": validation.get("document_type", "unknown"),
                    "transaction_count": validation.get(
                        "estimated_transaction_count", 0
                    ),
                    "text_length": len(extracted_text),
                }
            else:
                logger.error(f"   ❌ Validation failed: {validation_result}")
                return {
                    "file": file_path.name,
                    "ocr_success": True,
                    "validation_success": False,
                    "error": validation_result.get(
                        "message", "Unknown validation error"
                    ),
                }
        else:
            logger.error(f"   ❌ OCR failed: {ocr_result}")
            return {
                "file": file_path.name,
                "ocr_success": False,
                "validation_success": False,
                "error": ocr_result.get("message", "Unknown OCR error"),
            }

    except Exception as e:
        logger.error(f"   💥 Error processing {file_path.name}: {str(e)}")
        return {
            "file": file_path.name,
            "ocr_success": False,
            "validation_success": False,
            "error": str(e),
        }


async def main():
    """Main test function"""
    try:
        settings = get_settings()
        logger.info(
            f"🔑 API Key: {'***' + settings.MISTRAL_API_KEY[-4:] if settings.MISTRAL_API_KEY else 'NOT SET'}"
        )

        if not settings.MISTRAL_API_KEY:
            logger.error("❌ MISTRAL_API_KEY not set. Please add it to your .env file.")
            return

        print("\n" + "=" * 80)
        print("📁 REAL FILE OCR TESTING")
        print("=" * 80)

        # Find test files
        test_files = find_test_files()

        if not test_files:
            print("\n❌ No test files found in the root directory!")
            print("📋 Please add some files to test:")
            print("   • bank_statement.pdf")
            print("   • receipt.jpg")
            print("   • credit_card_statement.pdf")
            print("   • any other PDF or image files")
            print("\n💡 Supported formats:")
            print("   • PDFs: .pdf")
            print("   • Images: .jpg, .jpeg, .png, .webp, .gif")
            print("   • Documents: .docx, .xlsx, .pptx")
            return

        print(f"\n🎯 Found {len(test_files)} files to test:")
        for file_path in test_files:
            size_mb = file_path.stat().st_size / (1024 * 1024)
            print(f"   📄 {file_path.name} ({size_mb:.2f} MB)")

        # Process each file
        results = []

        for i, file_path in enumerate(test_files, 1):
            print(f"\n{'='*60}")
            print(f"📄 PROCESSING FILE {i}/{len(test_files)}: {file_path.name}")
            print(f"{'='*60}")

            result = await process_file(file_path)
            results.append(result)

            # Brief pause between files
            if i < len(test_files):
                logger.info("⏳ Pausing 2 seconds before next file...")
                await asyncio.sleep(2)

        # Summary
        print(f"\n{'='*80}")
        print("📊 FINAL RESULTS SUMMARY")
        print("=" * 80)

        ocr_success_count = sum(1 for r in results if r.get("ocr_success", False))
        validation_success_count = sum(
            1 for r in results if r.get("validation_success", False)
        )
        financial_docs = sum(1 for r in results if r.get("is_financial", False))

        print(f"\n📈 Overall Statistics:")
        print(f"   • Files processed: {len(results)}")
        print(f"   • OCR successful: {ocr_success_count}/{len(results)}")
        print(f"   • Validation successful: {validation_success_count}/{len(results)}")
        print(f"   • Financial documents found: {financial_docs}")

        print(f"\n📋 Detailed Results:")
        for result in results:
            file_name = result["file"]
            if result.get("ocr_success") and result.get("validation_success"):
                is_financial = (
                    "✅ Financial" if result.get("is_financial") else "❌ Not Financial"
                )
                confidence = result.get("confidence", 0)
                doc_type = result.get("document_type", "unknown")
                transactions = result.get("transaction_count", 0)
                print(
                    f"   📄 {file_name:<30} {is_financial} (conf: {confidence:.2f}, type: {doc_type}, txns: {transactions})"
                )
            else:
                error = result.get("error", "Unknown error")
                print(f"   📄 {file_name:<30} ❌ Failed: {error}")

        if financial_docs > 0:
            print(f"\n🎉 Success! Found {financial_docs} financial document(s)!")
            print("🚀 Your OCR system is working perfectly with real files!")
        else:
            print(f"\n💡 No financial documents detected.")
            print("   Try adding bank statements, receipts, or credit card statements.")

    except Exception as e:
        logger.error(f"❌ Test setup failed: {str(e)}")


if __name__ == "__main__":
    print("🧪 Starting Real File OCR Tests...")
    print("📁 Looking for PDF and image files in the root directory...")
    asyncio.run(main())
    print("\n✨ Testing completed!")

    print("\n📝 How to use this tester:")
    print("1. Place your test files (PDFs, images) in the agent/ directory")
    print("2. Run: python test_real_pdf.py")
    print("3. Watch the detailed OCR and validation results")
    print("4. Files like 'bank_statement.pdf' or 'receipt.jpg' work great!")
