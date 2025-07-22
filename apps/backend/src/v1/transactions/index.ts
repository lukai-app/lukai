import { Router } from 'express';
import {
  getTransactions,
  deleteTransaction,
  queueTransactionDeletion,
  cancelTransactionDeletion
} from './controllers';
import { verifyUserToken } from '../middlewares';

const transactionsRouter = Router();

transactionsRouter.get('/', verifyUserToken, getTransactions);
transactionsRouter.delete(
  '/:transactionId',
  verifyUserToken,
  deleteTransaction
);
transactionsRouter.post(
  '/:transactionId/queue-deletion',
  verifyUserToken,
  queueTransactionDeletion
);
transactionsRouter.post(
  '/cancel-deletion/:undo_token',
  verifyUserToken,
  cancelTransactionDeletion
);

export default transactionsRouter;
