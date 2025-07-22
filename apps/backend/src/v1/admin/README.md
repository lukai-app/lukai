# Admin Routes

These routes are for admin use only and require the `ADMIN_TOKEN` in the Authorization header.

## Authentication

All admin routes require:

```
Authorization: YOUR_ADMIN_TOKEN
```

## Endpoints

### 1. Upload Image to Vercel Blob

**POST** `/v1/admin/upload-image`

Upload an image file to Vercel Blob storage and save the metadata to the database.

**Body (multipart/form-data):**

- `image` (file): The image file to upload (max 5MB, images only)
- `fileName` (string): The name for the file (will be used as filename prefix)

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageId": "unique-uuid",
    "url": "https://vercel-blob-url...",
    "fileName": "your-filename",
    "size": 45
  }
}
```

**Example using curl:**

```bash
curl -X POST \
  -H "Authorization: YOUR_ADMIN_TOKEN" \
  -F "image=@./path/to/image.png" \
  -F "fileName=new_category_icon" \
  http://localhost:3000/v1/admin/upload-image
```

### 2. Create Income Category for All Users

**POST** `/v1/admin/create-income-category`

Create a new income category for all existing users in the system.

**Body (JSON):**

```json
{
  "key": "FREELANCE",
  "enName": "Freelance Work",
  "esName": "Trabajo Freelance",
  "enDescription": "Income from freelance work and projects",
  "esDescription": "Ingresos de trabajo freelance y proyectos",
  "imageId": "image-uuid-from-upload-endpoint",
  "color": "#4CAF50"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Income category created successfully for all users",
  "data": {
    "usersCount": 150,
    "categoriesCreated": 150,
    "categoryKey": "FREELANCE",
    "categoryNames": {
      "en": "Freelance Work",
      "es": "Trabajo Freelance"
    }
  }
}
```

**Example using curl:**

```bash
curl -X POST \
  -H "Authorization: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "FREELANCE",
    "enName": "Freelance Work",
    "esName": "Trabajo Freelance",
    "enDescription": "Income from freelance work and projects",
    "esDescription": "Ingresos de trabajo freelance y proyectos",
    "imageId": "your-image-id-here"
  }' \
  http://localhost:3000/v1/admin/create-income-category
```

## Workflow

1. First, upload an image using the `/upload-image` endpoint
2. Take note of the `imageId` from the response
3. Use that `imageId` when creating the income category with `/create-income-category`

## Notes

- Images are uploaded to Vercel Blob with public access
- Categories are created for ALL users based on their `favorite_language` preference
- If `color` is not provided, a random color from the default palette will be assigned
- The `key` field will be automatically converted to uppercase
- Categories with duplicate keys for the same user will be skipped (using `skipDuplicates: true`)
