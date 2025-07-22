import { Router } from 'express';
import { getBillingPortal } from './controllers';
import { verifyUserToken } from '../middlewares';

const subscriptionRouter = Router();

subscriptionRouter.get('/billing-portal', verifyUserToken, getBillingPortal);

export default subscriptionRouter;
