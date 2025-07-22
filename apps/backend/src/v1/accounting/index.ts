import { Router } from 'express';
import { getAccounting, getCurrentMonthAccounting } from './controllers';
import { verifyUserToken } from '../middlewares';

const accountingRouter = Router();

accountingRouter.get('/historical', verifyUserToken, getAccounting);
accountingRouter.get('/current', verifyUserToken, getCurrentMonthAccounting);

export default accountingRouter;
