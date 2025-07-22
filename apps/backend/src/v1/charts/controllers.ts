import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../env';
import prisma from '../../lib/prisma';
import { handleError } from '../../utils/handleError';
import { getCategoryBudgetResponse } from '../home/helpers';
import { decryptPermanentKey } from '../../utils/encryption';

interface GetCategoryBudgetResponse {
  success: boolean;
  data: {
    expenseCategoryId: string;
    totalSpent: number;
    monthlyAverage: number;
    monthlyData: Array<{
      month: number;
      amount: number;
      budgetTotal: number;
    }>;
  };
  message?: string;
}

export const getCategoryBudget = async (req: Request, res: Response) => {
  const { expenseCategoryId, year, currency } = req.query;

  const auth = req.headers['authorization'] ?? ''; // Bearer token
  const token = auth.split(' ')[1];

  try {
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    let userId: string;

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET as string) as {
        id: string;
      };
      userId = decoded.id;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    if (!expenseCategoryId || !year || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parametros'
      });
    }

    // Convert query parameters to correct types
    if (
      typeof expenseCategoryId !== 'string' ||
      typeof year !== 'string' ||
      typeof currency !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Parametros invalidos'
      });
    }

    const user = await prisma.contact.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Convert base64 string to Uint8Array
    const encryptionKeyBytes = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const categoryBudgetAnalysis = await getCategoryBudgetResponse({
      expenseCategoryId,
      year: Number(year),
      currency,
      userId,
      encryptionKey: encryptionKeyBytes
    });

    return res.json({
      success: true,
      data: categoryBudgetAnalysis
    } as GetCategoryBudgetResponse);
  } catch (error) {
    handleError({
      error,
      userId: req.query.encryptionKey as string,
      endpoint: 'charts.category-budget-analysis',
      message: 'Error in charts.category-budget-analysis'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener los datos'
    });
  }
};
