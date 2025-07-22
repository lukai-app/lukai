import { Router } from 'express';

import { getCategoryBudget } from './controllers';
import { verifyUserToken } from '../middlewares';

const chartsRouter = Router();

chartsRouter.get('/category-budget', verifyUserToken, getCategoryBudget);

export default chartsRouter;
