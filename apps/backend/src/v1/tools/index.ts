import { Router } from 'express';

import { verifyAgentServiceToken } from '../middlewares';
import {
  callForCustomerSupportController,
  saveUserFeedbackController,
  registerExpensesController,
  createExpenseCategoryController,
  getSpendingController,
  findSpendingsController,
  getCustomerBillingPortalLinkController,
  getCheckoutPaymentLinkController,
  createFinancialAccountController,
  registerIncomesController,
  createIncomeCategoryController,
  getIncomeController,
  findIncomesController,
  upsertUserController,
  transferMoneyBetweenAccountsController,
  getTransfersController,
  findTransfersController,
  getAccountBalanceController,
  createTransactionTagsController,
  setBudgetController,
  getBudgetController,
  setExpenseCategoryBudgetController,
  getBudgetByCategoryController,
  getSavingsController
} from './controllers';

const toolsRouter = Router();

toolsRouter.post(
  '/call-for-customer-support',
  verifyAgentServiceToken,
  callForCustomerSupportController
);
toolsRouter.post(
  '/save-user-feedback',
  verifyAgentServiceToken,
  saveUserFeedbackController
);

toolsRouter.post(
  '/get-customer-billing-portal-link',
  verifyAgentServiceToken,
  getCustomerBillingPortalLinkController
);
toolsRouter.post(
  '/get-checkout-payment-link',
  verifyAgentServiceToken,
  getCheckoutPaymentLinkController
);

toolsRouter.post(
  '/register-expenses',
  verifyAgentServiceToken,
  registerExpensesController
);
toolsRouter.post(
  '/create-expense-category',
  verifyAgentServiceToken,
  createExpenseCategoryController
);
toolsRouter.post(
  '/get-spending',
  verifyAgentServiceToken,
  getSpendingController
);
toolsRouter.post(
  '/find-spendings',
  verifyAgentServiceToken,
  findSpendingsController
);

toolsRouter.post(
  '/register-incomes',
  verifyAgentServiceToken,
  registerIncomesController
);
toolsRouter.post(
  '/create-income-category',
  verifyAgentServiceToken,
  createIncomeCategoryController
);
toolsRouter.post('/get-income', verifyAgentServiceToken, getIncomeController);
toolsRouter.post(
  '/find-incomes',
  verifyAgentServiceToken,
  findIncomesController
);

toolsRouter.post(
  '/create-financial-account',
  verifyAgentServiceToken,
  createFinancialAccountController
);

toolsRouter.post('/upsert-user', verifyAgentServiceToken, upsertUserController);

toolsRouter.post(
  '/transfer-money-between-accounts',
  verifyAgentServiceToken,
  transferMoneyBetweenAccountsController
);
toolsRouter.post(
  '/get-transfers',
  verifyAgentServiceToken,
  getTransfersController
);
toolsRouter.post(
  '/find-transfers',
  verifyAgentServiceToken,
  findTransfersController
);
toolsRouter.post(
  '/get-account-balance',
  verifyAgentServiceToken,
  getAccountBalanceController
);

toolsRouter.post(
  '/create-transaction-tags',
  verifyAgentServiceToken,
  createTransactionTagsController
);

// athena - Agente de Presupuesto y Ahorros: Encargada de presupuestos y ahorros.
toolsRouter.post('/set-budget', verifyAgentServiceToken, setBudgetController);
toolsRouter.post('/get-budget', verifyAgentServiceToken, getBudgetController);
toolsRouter.post(
  '/set-expense-category-budget',
  verifyAgentServiceToken,
  setExpenseCategoryBudgetController
);
toolsRouter.post(
  '/get-budget-by-category',
  verifyAgentServiceToken,
  getBudgetByCategoryController
);
toolsRouter.post('/get-savings', verifyAgentServiceToken, getSavingsController);
export default toolsRouter;
