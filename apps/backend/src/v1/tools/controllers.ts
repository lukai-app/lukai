import { Request, Response } from 'express';
import parsePhoneNumber from 'libphonenumber-js';

import {
  callForCustomerSupport,
  saveUserFeedback,
  registerExpenses,
  createExpenseCategory,
  getSpending,
  findSpendings,
  getCustomerBillingPortalLink,
  getCheckoutPaymentLink,
  createFinancialAccount,
  registerIncomes,
  createIncomeCategory,
  getIncome,
  findIncomes,
  transferMoneyBetweenAccounts,
  getTransfers,
  findTransfers,
  getAccountBalance,
  createTransactionTags,
  setBudget,
  getBudget,
  setExpenseCategoryBudget,
  getBudgetByCategory,
  getSavings
} from '../webhooks/whatsapp/tools';
import { handleError } from '../../utils/handleError';
import { decryptPermanentKey } from '../../utils/encryption';
import { env } from '../../env';
import prisma from '../../lib/prisma';
import { upsertUser } from '../../utils/upsertUser';
import { normalizePhone } from '../../lib/helpers/normalizePhone';
import {
  countryCodeToLanguageCode,
  countryCodeToCurrencyCode,
  countryCodeToTimezone
} from '../../lib/helpers/currency';
import clm from 'country-locale-map';

export const callForCustomerSupportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, context } = req.body;

    const result = await callForCustomerSupport({ phoneNumber, context });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.callForCustomerSupportController',
      message: 'Error in tools.callForCustomerSupportController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al llamar al soporte'
    });
  }
};

export const saveUserFeedbackController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, feedback } = req.body;

    const result = await saveUserFeedback({ phoneNumber, feedback });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.saveUserFeedbackController',
      message: 'Error in tools.saveUserFeedbackController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al guardar el feedback',
      data: {
        tool_response: 'Error al guardar el feedback'
      }
    });
  }
};

export const registerExpensesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, expenses } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await registerExpenses({
      userPhoneNumber: phoneNumber,
      expenses,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.registerExpensesController',
      message: 'Error in tools.registerExpensesController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al registrar los gastos',
      data: {
        tool_response: 'Error al registrar los gastos'
      }
    });
  }
};

export const createExpenseCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, name, key, description } = req.body;

    const result = await createExpenseCategory({
      userPhoneNumber: phoneNumber,
      name,
      key,
      description
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.createExpenseCategoryController',
      message: 'Error in tools.createExpenseCategoryController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al crear la categoría de gasto',
      data: {
        tool_response: 'Error al crear la categoría de gasto'
      }
    });
  }
};

export const getSpendingController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, categoryKey, currencyCode, dateFrom, dateTo } =
      req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getSpending({
      userPhoneNumber: phoneNumber,
      categoryKey,
      currencyCode,
      dateFrom,
      dateTo,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getSpendingController',
      message: 'Error in tools.getSpendingController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los gastos',
      data: {
        tool_response: 'Error al obtener los gastos'
      }
    });
  }
};

export const findSpendingsController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, categoryKeys, currencyCode, dateFrom, dateTo } =
      req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await findSpendings({
      userPhoneNumber: phoneNumber,
      categoryKeys,
      currencyCode,
      dateFrom,
      dateTo,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.findSpendingsController',
      message: 'Error in tools.findSpendingsController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los gastos',
      data: {
        tool_response: 'Error al obtener los gastos'
      }
    });
  }
};

export const getCustomerBillingPortalLinkController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber } = req.body;

    const result = await getCustomerBillingPortalLink({ phoneNumber });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getCustomerBillingPortalLinkController',
      message: 'Error in tools.getCustomerBillingPortalLinkController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener el link de facturación',
      data: {
        tool_response: 'Error al obtener el link de facturación'
      }
    });
  }
};

export const getCheckoutPaymentLinkController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber } = req.body;

    const result = await getCheckoutPaymentLink({ phoneNumber });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getCheckoutPaymentLinkController',
      message: 'Error in tools.getCheckoutPaymentLinkController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener el link de pago',
      data: {
        tool_response: 'Error al obtener el link de pago'
      }
    });
  }
};

export const createFinancialAccountController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, name, accountType, key, balance, currencyCode } =
      req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await createFinancialAccount({
      userPhoneNumber: phoneNumber,
      name,
      accountType,
      key,
      balance,
      currencyCode,
      encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.createFinancialAccountController',
      message: 'Error in tools.createFinancialAccountController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al crear la cuenta financiera',
      data: {
        tool_response: 'Error al crear la cuenta financiera'
      }
    });
  }
};

export const registerIncomesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, incomes } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await registerIncomes({
      userPhoneNumber: phoneNumber,
      incomes,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.registerIncomesController',
      message: 'Error in tools.registerIncomesController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al registrar los ingresos',
      data: {
        tool_response: 'Error al registrar los ingresos'
      }
    });
  }
};

export const createIncomeCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, name, key, description } = req.body;

    const result = await createIncomeCategory({
      userPhoneNumber: phoneNumber,
      name,
      key,
      description
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.createIncomeCategoryController',
      message: 'Error in tools.createIncomeCategoryController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al crear la categoría de ingreso',
      data: {
        tool_response: 'Error al crear la categoría de ingreso'
      }
    });
  }
};

export const getIncomeController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, categoryKey, currencyCode, dateFrom, dateTo } =
      req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getIncome({
      userPhoneNumber: phoneNumber,
      categoryKey,
      currencyCode,
      dateFrom,
      dateTo,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getIncomeController',
      message: 'Error in tools.getIncomeController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los ingresos',
      data: {
        tool_response: 'Error al obtener los ingresos'
      }
    });
  }
};

export const findIncomesController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, categoryKeys, currencyCode, dateFrom, dateTo } =
      req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await findIncomes({
      userPhoneNumber: phoneNumber,
      categoryKeys,
      currencyCode,
      dateFrom,
      dateTo,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.findIncomesController',
      message: 'Error in tools.findIncomesController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los ingresos',
      data: {
        tool_response: 'Error al obtener los ingresos'
      }
    });
  }
};

export const upsertUserController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, contactName } = req.body;

    const parsedPhoneNumber = parsePhoneNumber(
      normalizePhone(`${phoneNumber.startsWith('+') ? '' : '+'}${phoneNumber}`)
        .real
    );

    if (!parsedPhoneNumber) {
      throw new Error(`Invalid phone number: ${phoneNumber}`);
    }

    const normalizedPhoneNumber = parsedPhoneNumber.number;
    const countryCode = parsedPhoneNumber.country;
    const language = countryCode
      ? countryCodeToLanguageCode(countryCode)
      : 'es';
    const currencyCode = countryCode
      ? countryCodeToCurrencyCode(countryCode) ?? 'USD'
      : 'USD';
    const locale = countryCode
      ? clm.getLocaleByAlpha2(countryCode)
        ? clm.getLocaleByAlpha2(countryCode).replace('_', '-')
        : 'es-PE'
      : 'es-PE';
    const timezone = countryCode
      ? countryCodeToTimezone(countryCode) ?? 'America/Lima'
      : 'America/Lima';

    const user = await upsertUser({
      phoneNumber: normalizedPhoneNumber,
      name: contactName ?? undefined,
      favorite_language: language,
      favorite_currency_code: currencyCode,
      favorite_locale: locale,
      favorite_timezone: timezone,
      country_code: countryCode,
      source: 'whatsapp'
    });

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.upsertUserController',
      message: 'Error in tools.upsertUserController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al crear/actualizar el usuario',
      data: {
        tool_response: 'Error al crear/actualizar el usuario'
      }
    });
  }
};

export const transferMoneyBetweenAccountsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, transfers } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await transferMoneyBetweenAccounts({
      userPhoneNumber: phoneNumber,
      transfers,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.transferMoneyBetweenAccountsController',
      message: 'Error in tools.transferMoneyBetweenAccountsController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al transferir dinero entre cuentas',
      data: {
        tool_response: 'Error al transferir dinero entre cuentas'
      }
    });
  }
};

export const getTransfersController = async (req: Request, res: Response) => {
  try {
    const {
      phoneNumber,
      fromAccountKey,
      toAccountKey,
      amountFrom,
      amountTo,
      dateFrom,
      dateTo
    } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getTransfers({
      userPhoneNumber: phoneNumber,
      fromAccountKey,
      toAccountKey,
      amountFrom,
      amountTo,
      dateFrom,
      dateTo,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getTransfersController',
      message: 'Error in tools.getTransfersController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener las transferencias',
      data: {
        tool_response: 'Error al obtener las transferencias'
      }
    });
  }
};

export const findTransfersController = async (req: Request, res: Response) => {
  try {
    const {
      phoneNumber,
      fromAccountKey,
      toAccountKey,
      amountFrom,
      amountTo,
      dateFrom,
      dateTo
    } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await findTransfers({
      userPhoneNumber: phoneNumber,
      fromAccountKey,
      toAccountKey,
      amountFrom,
      amountTo,
      dateFrom,
      dateTo,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.findTransfersController',
      message: 'Error in tools.findTransfersController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener las transferencias',
      data: {
        tool_response: 'Error al obtener las transferencias'
      }
    });
  }
};

export const getAccountBalanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, accountKey } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getAccountBalance({
      userPhoneNumber: phoneNumber,
      accountKey,
      encryptionKey: encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getAccountBalanceController',
      message: 'Error in tools.getAccountBalanceController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener el saldo de la cuenta',
      data: {
        tool_response: 'Error al obtener el saldo de la cuenta'
      }
    });
  }
};

export const createTransactionTagsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, tags } = req.body;

    const result = await createTransactionTags({ phoneNumber, tags });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.createTransactionTagsController',
      message: 'Error in tools.createTransactionTagsController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al crear las etiquetas de transacción',
      data: {
        tool_response: 'Error al crear las etiquetas de transacción'
      }
    });
  }
};

export const setBudgetController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, year, currencyCode, month } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await setBudget({
      phoneNumber,
      amount,
      year,
      currencyCode,
      month,
      encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.setBudgetController',
      message: 'Error in tools.setBudgetController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al establecer el presupuesto',
      data: {
        tool_response: 'Error al establecer el presupuesto'
      }
    });
  }
};

export const getBudgetController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, year, month, currencyCode } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getBudget({
      phoneNumber,
      year,
      month,
      currencyCode,
      encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getBudgetController',
      message: 'Error in tools.getBudgetController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener el presupuesto',
      data: {
        tool_response: 'Error al obtener el presupuesto'
      }
    });
  }
};

export const setExpenseCategoryBudgetController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, categoryKey, amount, year, currencyCode, month } =
      req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await setExpenseCategoryBudget({
      phoneNumber,
      categoryKey,
      amount,
      year,
      currencyCode,
      month,
      encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.setExpenseCategoryBudgetController',
      message: 'Error in tools.setExpenseCategoryBudgetController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al establecer el presupuesto de la categoría de gasto',
      data: {
        tool_response:
          'Error al establecer el presupuesto de la categoría de gasto'
      }
    });
  }
};

export const getBudgetByCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, categoryKey, year, month, currencyCode } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getBudgetByCategory({
      phoneNumber,
      categoryKey,
      year,
      month,
      currencyCode,
      encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getBudgetByCategoryController',
      message: 'Error in tools.getBudgetByCategoryController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener el presupuesto de la categoría de gasto',
      data: {
        tool_response:
          'Error al obtener el presupuesto de la categoría de gasto'
      }
    });
  }
};

export const getSavingsController = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, savingsAccountsKeys } = req.body;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        encryption_key: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: {
          tool_response: 'Usuario no encontrado'
        }
      });
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const result = await getSavings({
      phoneNumber,
      savingsAccountsKeys,
      encryptionKey
    });

    return res.status(200).json({
      success: true,
      data: {
        tool_response: result
      }
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.body.phoneNumber,
      endpoint: 'tools.getSavingsController',
      message: 'Error in tools.getSavingsController'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los ahorros',
      data: {
        tool_response: 'Error al obtener los ahorros'
      }
    });
  }
};
