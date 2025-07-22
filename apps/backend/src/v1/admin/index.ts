import { Router } from 'express';
import { verifyAdminToken } from '../middlewares';
import {
  uploadImageToVercel,
  uploadSingleImage,
  createIncomeCategoryForAllUsers
} from './controllers';

const adminRouter = Router();

// POST /v1/admin/upload-image
// Upload image to Vercel Blob and save to database
adminRouter.post(
  '/upload-image',
  verifyAdminToken,
  uploadSingleImage,
  uploadImageToVercel
);

// POST /v1/admin/create-income-category
// Create income category for all users
adminRouter.post(
  '/create-income-category',
  verifyAdminToken,
  createIncomeCategoryForAllUsers
);

export default adminRouter;
