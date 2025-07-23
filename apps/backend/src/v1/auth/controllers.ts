import axios from 'axios';
import jwt from 'jsonwebtoken';
import clm from 'country-locale-map';
import { Request, Response } from 'express';
import parsePhoneNumber from 'libphonenumber-js';

import {
  countryCodeToCurrencyCode,
  countryCodeToLanguageCode,
  countryCodeToTimezone,
} from '../../lib/helpers/currency';
import prisma from '../../lib/prisma';
import { env } from '../../env';

import { handleError } from '../../utils/handleError';
import { upsertUser } from '../../utils/upsertUser';
import { AuthRequest } from '../middlewares';
import { decryptPermanentKey } from '../../utils/encryption';
import { mixpanelServer } from '../../lib/tools/mixpanel';

export async function sendCode(req: Request, response: Response) {
  const body = req.body;

  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== env.API_KEY) {
      return response
        .status(401)
        .json({ success: false, message: 'Unauthorized' });
    }

    const { phoneNumber } = body;

    if (!phoneNumber) {
      return response.json({
        success: false,
        message: 'Debes ingresar un número de teléfono',
      });
    }

    const parsedPhoneNumber = parsePhoneNumber(`${phoneNumber}`);

    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      return response.json({
        success: false,
        message: 'Ingresa un número de teléfono válido',
      });
    }

    const countryCode = parsedPhoneNumber.country;
    const language = countryCode
      ? countryCodeToLanguageCode(countryCode)
      : 'es';
    const currencyCode = countryCode
      ? (countryCodeToCurrencyCode(countryCode) ?? 'USD')
      : 'USD';
    const locale = countryCode
      ? (clm.getLocaleByAlpha2(countryCode) ?? 'es')
      : 'es';
    const timezone = countryCode
      ? (countryCodeToTimezone(countryCode) ?? 'America/Lima')
      : 'America/Lima';

    // Create or update user with encryption keys
    const user = await upsertUser({
      phoneNumber: parsedPhoneNumber.number,
      name: '',
      favorite_language: language,
      favorite_currency_code: currencyCode,
      favorite_locale: locale,
      favorite_timezone: timezone,
      country_code: countryCode,
      source: 'web',
    });

    // Create OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if OTP was created in the last 30 seconds
    const otpExists = await prisma.otp.findFirst({
      where: {
        contact_id: user.id,
        created_at: {
          gte: new Date(new Date().getTime() - 30 * 1000),
        },
      },
    });

    if (otpExists) {
      return response.json({
        success: false,
        message: 'Puedes solicitar un nuevo código en 30 segundos',
      });
    }

    // Store OTP
    await prisma.otp.upsert({
      where: {
        contact_id: user.id,
      },
      update: {
        code: otp,
      },
      create: {
        contact_id: user.id,
        code: otp,
      },
    });

    await axios.post(
      `https://graph.facebook.com/v21.0/${env.WHATSAPP_SENDER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `${parsedPhoneNumber.number}`,
        type: 'template',
        template: {
          name: 'otp',
          language: {
            code: 'es',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otp,
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: otp,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        },
      }
    );

    return response.json({
      success: true,
      message: 'Código enviado por WhatsApp',
    });
  } catch (error) {
    await handleError({
      error,
      userId: JSON.stringify(body),
      endpoint: 'auth.send-code.post',
      message: 'Error in send code',
    });

    return response.status(500).json({
      success: false,
      message: 'Error al enviar el código',
    });
  }
}

export async function login(req: Request, response: Response) {
  const body = req.body;

  try {
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return response.json({
        success: false,
        message: 'Debes ingresar un número de teléfono y código',
      });
    }

    const parsedPhoneNumber = parsePhoneNumber(`${phoneNumber}`);

    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      return response.json({
        success: false,
        message: 'Ingresa un número de teléfono válido',
      });
    }

    const user = await prisma.contact.findUnique({
      where: { phone_number: parsedPhoneNumber.number },
      include: {
        subscription: true,
        expense_categories: {
          select: {
            id: true,
            name: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
        income_categories: {
          select: {
            id: true,
            name: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
        expenses: {
          distinct: ['currency_code'],
          where: {
            created_at: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // last 30 days
            },
          },
          select: {
            currency_code: true,
          },
        },
        transaction_tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return response.json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const storedOtp = await prisma.otp.findUnique({
      where: { contact_id: user.id },
    });

    if (!storedOtp || storedOtp.code !== otp) {
      return response
        .status(400)
        .json({ success: false, message: 'El código ingresado es incorrecto' });
    } else {
      await prisma.otp.delete({
        where: { contact_id: user.id },
      });
    }

    // Get permanent key from encrypted storage
    const permanentKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const usedCurrencies = Array.from(
      new Set([...user.expenses.map((e) => e.currency_code)])
    ).sort();

    // Generate JWT with permanent key
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone_number,
      },
      env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    mixpanelServer.track('user_logged_in', {
      distinct_id: user.phone_number,
      channel: 'web',
      login_date: new Date(),
      mp_country_code: user.country_code,
    });

    return response.json({
      success: true,
      data: {
        token,
        user: {
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
            image_url: category.image?.url,
          })),
          income_categories: user.income_categories.map((category) => ({
            value: category.id,
            label: category.name,
            image_url: category.image?.url,
          })),
          tags: user.transaction_tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          })),
          expenses_count: user._count.expenses,
          used_currencies: usedCurrencies,
        },
        encryption_key: Buffer.from(permanentKey).toString('hex'),
      },
      message: 'Inicio de sesión exitoso',
    });
  } catch (error) {
    console.error('Error in login:', error);
    return response.json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
}

export const getMe = async (req: AuthRequest, res: Response) => {
  mixpanelServer.track('user_already_logged_in', {
    distinct_id: req.user.phone_number,
    channel: 'web',
    login_date: new Date(),
    mp_country_code: req.user.country_code,
    country_code: req.user.country_code,
  });

  return res.json({
    data: req.user,
    message: 'User data fetched successfully',
  });
};
