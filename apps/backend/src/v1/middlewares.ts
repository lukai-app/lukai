import { NextFunction, Request, response, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { subscription_status } from '@prisma/client';
import prisma from '../lib/prisma';
import { handleError } from '../utils/handleError';
import { decryptPermanentKey } from '../utils/encryption';
import { env } from '../env';

interface AppUser {
  id: string;
  name?: string;
  phone_number: string;
  favorite_language?: string;
  favorite_currency_code?: string;
  favorite_locale?: string;
  favorite_timezone?: string;
  country_code?: string;
  subscription?: {
    status: subscription_status;
  };
  expense_categories: {
    value: string;
    label: string;
    image_url?: string;
  }[];
  income_categories: {
    value: string;
    label: string;
    image_url?: string;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
  encryption_key?: string;
  permanent_key?: string;
  expenses_count: number;
  used_currencies: string[];
}

export interface AuthRequest extends Request {
  user?: AppUser & { jwt: string }; // Modify this based on your JWT payload type
}

export async function verifyUserToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(403).json({
      message: 'No token provided',
      success: false
    });

  try {
    // Verify token with the secret from .env
    const tokenWithoutBearer = token?.split(' ')[1];

    const decoded = jwt.verify(
      tokenWithoutBearer,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.contact.findUnique({
      where: {
        id: decoded.id as string
      },
      include: {
        subscription: {
          select: {
            status: true
          }
        },
        expense_categories: {
          select: {
            id: true,
            name: true,
            image: {
              select: {
                url: true
              }
            }
          }
        },
        income_categories: {
          select: {
            id: true,
            name: true,
            image: {
              select: {
                url: true
              }
            }
          }
        },
        _count: {
          select: {
            expenses: true
          }
        },
        expenses: {
          distinct: ['currency_code'],
          where: {
            created_at: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)) // last 30 days
            }
          },
          select: {
            currency_code: true
          }
        },
        transaction_tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user)
      return res
        .status(404)
        .json({ message: 'User not found', success: false });

    const permanentKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const usedCurrencies = Array.from(
      new Set([...user.expenses.map((e) => e.currency_code)])
    ).sort();

    req.user = {
      id: user.id,
      phone_number: user.phone_number,
      name: user.name,
      favorite_language: user.favorite_language,
      favorite_currency_code: user.favorite_currency_code,
      favorite_locale: user.favorite_locale,
      favorite_timezone: user.favorite_timezone,
      country_code: user.country_code,
      subscription: user.subscription,
      expense_categories: user.expense_categories.map((category) => ({
        value: category.id,
        label: category.name,
        image_url: category.image?.url
      })),
      income_categories: user.income_categories.map((category) => ({
        value: category.id,
        label: category.name,
        image_url: category.image?.url
      })),
      tags: user.transaction_tags.map((tag) => ({
        id: tag.id,
        name: tag.name
      })),
      encryption_key: user.encryption_key,
      permanent_key: Buffer.from(permanentKey).toString('hex'),
      expenses_count: user._count.expenses,
      used_currencies: usedCurrencies,
      jwt: tokenWithoutBearer
    };
    return next();
  } catch (error: any) {
    // if jwt.verify fails, it throws an error but we don't want to use the handleError if it's a jwt error
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
        success: false,
        message: 'Failed to authenticate token'
      });
    }

    handleError({
      error,
      userId: token,
      endpoint: 'middleware.verifyUserToken',
      message: 'Error in middleware.verifyUserToken'
    });

    return res.status(500).send({
      message: 'Failed to authenticate token',
      success: false
    });
  }
}

export async function verifyAdminToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(403).json({
      message: 'No token provided',
      success: false
    });

  try {
    if (token !== env.ADMIN_TOKEN)
      return res.status(403).json({
        message: 'Invalid token',
        success: false
      });

    return next();
  } catch (error: any) {
    handleError({
      error,
      userId: token,
      endpoint: 'middleware.verifyAdminToken',
      message: 'Error in middleware.verifyAdminToken'
    });
  }
}

export async function verifyAgentServiceToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(403).json({
      message: 'No token provided',
      success: false
    });

  const tokenWithoutBearer = token?.split(' ')[1];

  if (tokenWithoutBearer !== env.AGENT_SERVICE_TOKEN)
    return res.status(403).json({
      message: 'Invalid token',
      success: false
    });

  return next();
}
