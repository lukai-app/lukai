import { Request, Response } from 'express';
import { put } from '@vercel/blob';
import multer from 'multer';
import { generateId } from 'ai';
import prisma from '../../lib/prisma';
import { handleError } from '../../utils/handleError';
import { defaultColors } from '../../lib/constants/defaultCategories';

// Multer configuration for handling multipart form data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const uploadSingleImage = upload.single('image');

interface UploadImageRequest extends Request {
  file?: Express.Multer.File;
  body: {
    fileName: string;
  };
}

export const uploadImageToVercel = async (
  req: UploadImageRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'fileName is required'
      });
    }

    // Generate unique filename to avoid conflicts
    const fileExtension = req.file.originalname.split('.').pop() || 'png';
    const uniqueFileName = `${fileName}-${Date.now()}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, req.file.buffer, {
      access: 'public'
    });

    // Generate UUID for the image
    const imageId = generateId();

    // Save image info to database
    const savedImage = await prisma.images.create({
      data: {
        id: imageId,
        url: blob.url,
        file_name: fileName,
        extension: fileExtension,
        size: Math.round(req.file.size / 1024) // Convert to KB
      }
    });

    console.log(`Uploaded ${uniqueFileName} to ${blob.url}`);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId: savedImage.id,
        url: savedImage.url,
        fileName: savedImage.file_name,
        size: savedImage.size
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: 'admin',
      endpoint: 'admin.uploadImageToVercel',
      message: `Error uploading image: ${error.message}`
    });

    return res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

interface CreateIncomeCategoryRequest extends Request {
  body: {
    key: string;
    enName: string;
    esName: string;
    enDescription: string;
    esDescription: string;
    imageId: string;
    color?: string;
  };
}

export const createIncomeCategoryForAllUsers = async (
  req: CreateIncomeCategoryRequest,
  res: Response
) => {
  try {
    const {
      key,
      enName,
      esName,
      enDescription,
      esDescription,
      imageId,
      color
    } = req.body;

    // Validate required fields
    if (
      !key ||
      !enName ||
      !esName ||
      !enDescription ||
      !esDescription ||
      !imageId
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: key, enName, esName, enDescription, esDescription, imageId'
      });
    }

    // Validate that the image exists
    const image = await prisma.images.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image not found with the provided imageId'
      });
    }

    // Get all users
    const allUsers = await prisma.contact.findMany({
      select: {
        id: true,
        favorite_language: true
      }
    });

    if (allUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users found, category definition saved for future users',
        data: {
          usersCount: 0,
          categoriesCreated: 0
        }
      });
    }

    // Select color (use provided or random from defaults)
    const categoryColor =
      color || defaultColors[Math.floor(Math.random() * defaultColors.length)];

    // Create category for each user
    const categoriesToCreate = allUsers.map((user) => ({
      name: user.favorite_language === 'ES' ? esName : enName,
      key: key.toUpperCase(),
      description:
        user.favorite_language === 'ES' ? esDescription : enDescription,
      color: categoryColor,
      image_id: imageId,
      contact_id: user.id
    }));

    // Create categories in bulk
    const result = await prisma.income_category.createMany({
      data: categoriesToCreate,
      skipDuplicates: true // Skip if key already exists for a user
    });

    console.log(`Created income category '${key}' for ${result.count} users`);

    return res.status(200).json({
      success: true,
      message: 'Income category created successfully for all users',
      data: {
        usersCount: allUsers.length,
        categoriesCreated: result.count,
        categoryKey: key.toUpperCase(),
        categoryNames: {
          en: enName,
          es: esName
        }
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: 'admin',
      endpoint: 'admin.createIncomeCategoryForAllUsers',
      message: `Error creating income category: ${error.message}`
    });

    return res.status(500).json({
      success: false,
      message: 'Error creating income category',
      error: error.message
    });
  }
};
