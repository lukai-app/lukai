# Test Guide for Admin Endpoints

## Prerequisites

Make sure you have the following environment variables set:

- `ADMIN_TOKEN` - Your admin token for authentication
- `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob token for file uploads

## Test Endpoint 1: Upload Image

Create a test image file (or use any PNG/JPG image) and test the upload endpoint:

```bash
# Replace YOUR_ADMIN_TOKEN with your actual admin token
# Replace ./test-image.png with path to your test image

curl -X POST \
  -H "Authorization: YOUR_ADMIN_TOKEN" \
  -F "image=@./test-image.png" \
  -F "fileName=test_category_icon" \
  http://localhost:3000/v1/admin/upload-image
```

Expected response:

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageId": "some-uuid-here",
    "url": "https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/test_category_icon-1234567890.png",
    "fileName": "test_category_icon",
    "size": 45
  }
}
```

## Test Endpoint 2: Create Income Category

Use the `imageId` from the previous response:

```bash
# Replace YOUR_ADMIN_TOKEN with your actual admin token
# Replace IMAGE_ID_FROM_UPLOAD with the imageId from step 1

curl -X POST \
  -H "Authorization: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "FREELANCE",
    "enName": "Freelance Work",
    "esName": "Trabajo Freelance",
    "enDescription": "Income from freelance work and projects",
    "esDescription": "Ingresos de trabajo freelance y proyectos",
    "imageId": "IMAGE_ID_FROM_UPLOAD",
    "color": "#4CAF50"
  }' \
  http://localhost:3000/v1/admin/create-income-category
```

Expected response:

```json
{
  "success": true,
  "message": "Income category created successfully for all users",
  "data": {
    "usersCount": 10,
    "categoriesCreated": 10,
    "categoryKey": "FREELANCE",
    "categoryNames": {
      "en": "Freelance Work",
      "es": "Trabajo Freelance"
    }
  }
}
```

## Common Error Responses

### 403 Unauthorized

```json
{
  "message": "No token provided",
  "success": false
}
```

or

```json
{
  "message": "Invalid token",
  "success": false
}
```

### 400 Bad Request (Missing file)

```json
{
  "success": false,
  "message": "No image file provided"
}
```

### 400 Bad Request (Missing fields)

```json
{
  "success": false,
  "message": "Missing required fields: key, enName, esName, enDescription, esDescription, imageId"
}
```

## Verify Results

After creating the category, you can verify it was created by:

1. Checking your database directly
2. Making API calls to get user categories
3. Looking at the WhatsApp tool categories in your application

The new income category should now be available for all users based on their language preference.
