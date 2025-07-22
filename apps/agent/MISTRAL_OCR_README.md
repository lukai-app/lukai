# 📄 Mistral OCR Integration for WhatsApp Financial Documents

This document explains the new Mistral OCR functionality for processing financial documents and images via WhatsApp.

## 🚀 Features

- **Document OCR**: Process PDFs, DOCX, PPTX, Excel files, and more
- **Image OCR**: Enhanced image processing using Mistral OCR
- **Financial Validation**: AI-powered validation to ensure documents contain transaction data
- **Auto-Processing**: Automatic extraction and registration of transactions
- **Comprehensive Logging**: Detailed logs for testing and debugging

## 📋 Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 2. Dependencies

The required `mistralai` package is already in `requirements.txt`:

```
mistralai==1.7.0
```

## 🔍 Testing

### Quick Test

Run the test script to validate your setup:

```bash
cd agent
python test_mistral_service.py
```

### Full Integration Test

1. Start the FastAPI server:

   ```bash
   uvicorn app.main:app --reload --log-level info
   ```

2. Send documents via WhatsApp and monitor logs

## 📝 Supported Document Types

### Documents (via "document" message type)

- **PDF**: Bank statements, financial reports
- **DOCX**: Financial documents
- **PPTX**: Financial presentations
- **Excel/Sheets**: Transaction spreadsheets

### Images (via "image" message type)

- **JPEG/PNG**: Receipts, screenshots of transactions
- **Any image format**: Financial data in image form

## 🔄 Processing Flow

```
Document/Image Upload
    ↓
Download & Size Check (50MB limit)
    ↓
Mistral OCR Processing
    ↓
Financial Content Validation (AI-powered)
    ↓
Transaction Extraction & Registration
    ↓
Summary Response to User
```

## 📊 Logging Details

### Mistral Service Logs

- `INFO`: OCR processing start/completion
- `INFO`: File size validation
- `INFO`: Financial validation results
- `ERROR`: API failures, timeouts
- `DEBUG`: Extracted text previews

### Webhook Logs

- `INFO`: Message type processing
- `INFO`: Download status
- `INFO`: Validation results
- `WARNING`: Download failures
- `ERROR`: Processing exceptions

## 🚨 Error Handling

### File Size Limits

- **Limit**: 50MB per file
- **Response**: "Your document has to be less than 50 MB, consider splitting the document"

### OCR Failures

- **Timeout**: "Document processing timed out. Please try with a smaller document."
- **API Error**: "Failed to process document with OCR"

### Non-Financial Documents

- **Response**: Explains document doesn't contain recognizable financial data
- **Includes**: AI reasoning for why document was rejected

## 🔧 Configuration

### Log Levels

Adjust in `app/main.py`:

```python
logging.basicConfig(level=logging.INFO)  # Change to DEBUG for more detail
```

### File Size Limit

Modify in `app/services/mistral_service.py`:

```python
if file_size_mb > 50:  # Change limit here
```

### Validation Model

Change in `mistral_service.py`:

```python
"model": "mistral-medium-latest",  # Use different model if needed
```

## 📈 Monitoring

### Key Metrics to Watch

1. **OCR Success Rate**: Check for frequent failures
2. **Validation Accuracy**: Monitor false positives/negatives
3. **Processing Time**: Watch for timeout issues
4. **File Size Distribution**: Monitor if users hit limits

### Log Analysis

```bash
# Filter OCR-related logs
grep "OCR" app.log

# Filter validation logs
grep "validation" app.log

# Filter error logs
grep "ERROR" app.log
```

## 🐛 Troubleshooting

### Common Issues

**1. Import Errors**

```bash
# Ensure you're in the correct directory
cd agent
python -c "from app.services.mistral_service import mistral_service"
```

**2. API Key Issues**

```bash
# Check if key is set
python -c "from app.core.config import get_settings; print(get_settings().MISTRAL_API_KEY)"
```

**3. Large Files**

- Check file size before processing
- Logs will show exact file size in MB

**4. OCR Failures**

- Check Mistral API status
- Verify file format is supported
- Check network connectivity

### Debug Mode

Enable debug logging for detailed information:

```python
logging.getLogger().setLevel(logging.DEBUG)
```

## 📞 Support

For issues with:

- **OCR Processing**: Check Mistral API documentation
- **WhatsApp Integration**: Review webhook logs
- **Financial Validation**: Monitor validation logs for accuracy

## 🔄 Updates

To update Mistral dependency:

```bash
pip install --upgrade mistralai
pip freeze > requirements.txt
```

rede
