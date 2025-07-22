import { Router } from 'express';
import {
  updateCountry,
  updateLanguage,
  updateCurrency,
  updateLocale,
  updateTimezone,
  updateCategoryName,
  sendCampaignToUser
} from './controllers';
import { verifyUserToken, verifyAdminToken } from '../middlewares';

const usersRouter = Router();

// Update user country
usersRouter.patch('/update-country', verifyUserToken, updateCountry);

// Update user language
usersRouter.patch('/update-language', verifyUserToken, updateLanguage);

// Update user currency
usersRouter.patch('/update-currency', verifyUserToken, updateCurrency);

// Update user locale
usersRouter.patch('/update-locale', verifyUserToken, updateLocale);

// Update user timezone
usersRouter.patch('/update-timezone', verifyUserToken, updateTimezone);

// Update category name
usersRouter.patch('/update-category-name', verifyUserToken, updateCategoryName);

usersRouter.post('/:id/send-campaign', verifyAdminToken, sendCampaignToUser);

export default usersRouter;
