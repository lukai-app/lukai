import { generateId } from 'ai';
import {
  encryptField,
  generatePermanentKey,
  encryptPermanentKey,
  generateRecoveryKey,
  encryptRecoveryKey
} from './encryption';
import prisma from '../lib/prisma';
import {
  expenseCategories,
  incomeCategories
} from '../lib/constants/defaultCategories';
import { sendTemplate } from '../lib/tools/whatsapp';
import { env } from '../env';
import { mixpanelServer } from '../lib/tools/mixpanel';

interface GetUserParams {
  phoneNumber: string;
  name?: string;
  favorite_language?: string;
  favorite_currency_code?: string;
  favorite_locale?: string;
  favorite_timezone?: string;
  country_code?: string;
  source?: 'whatsapp' | 'web' | 'lemon';
}

export const upsertUser = async (params: GetUserParams) => {
  const {
    phoneNumber,
    name,
    favorite_language,
    favorite_currency_code,
    favorite_locale,
    favorite_timezone,
    country_code,
    source
  } = params;

  let dbUser = await prisma.contact.findUnique({
    where: {
      phone_number: phoneNumber
    },
    include: {
      subscription: true,
      expense_categories: true,
      income_categories: true,
      accounts: true,
      _count: {
        select: {
          expenses: true
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

  if (!dbUser) {
    // Generate encryption key
    const permanentKey = generatePermanentKey();
    const encryptedPermanentKey = encryptPermanentKey(
      permanentKey,
      env.ENCRYPTION_MASTER_KEY
    );

    // Generate recovery key
    const recoveryKey = generateRecoveryKey();
    const encryptedRecoveryKey = encryptRecoveryKey(recoveryKey, permanentKey);

    dbUser = await prisma.contact.create({
      data: {
        phone_number: phoneNumber,
        name: name ?? 'user',
        favorite_language: favorite_language,
        favorite_currency_code: favorite_currency_code,
        favorite_locale: favorite_locale,
        favorite_timezone: favorite_timezone,
        country_code: country_code,
        chatId: generateId(),
        accounts: {
          create: [
            {
              name: 'Personal',
              key: 'PERSONAL',
              account_type: 'REGULAR',
              currency_code: favorite_currency_code ?? 'USD',
              balance: encryptField('0', permanentKey)
            }
          ]
        },
        expense_categories: {
          createMany: {
            data: Object.values(expenseCategories).map((value) => ({
              name: favorite_language === 'es' ? value.es_name : value.en_name,
              key: value.type,
              color: value.color,
              image_id: value.image_id,
              description:
                favorite_language === 'es'
                  ? value.es_description
                  : value.en_description
            }))
          }
        },
        income_categories: {
          createMany: {
            data: Object.values(incomeCategories).map((value) => ({
              name: favorite_language === 'es' ? value.es_name : value.en_name,
              key: value.type,
              color: value.color,
              image_id: value.image_id,
              description:
                favorite_language === 'es'
                  ? value.es_description
                  : value.en_description
            }))
          }
        },
        encryption_key: encryptedPermanentKey,
        recovery_key: encryptedRecoveryKey
      },
      include: {
        subscription: true,
        expense_categories: true,
        income_categories: true,
        accounts: true,
        _count: {
          select: {
            expenses: true
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

    await sendTemplate({
      to: env.WHATSAPP_ADMIN_NUMBER,
      templateName: 'nuevo_usuario_creado',
      params: [dbUser.name ?? 'Desconocido', dbUser.phone_number]
    });

    mixpanelServer.people.set(dbUser.phone_number, {
      name: dbUser.name,
      phone_number: dbUser.phone_number,
      favorite_language: dbUser.favorite_language,
      favorite_currency_code: dbUser.favorite_currency_code,
      favorite_locale: dbUser.favorite_locale,
      favorite_timezone: dbUser.favorite_timezone,
      country_code: dbUser.country_code,
      source: source ?? 'desconocido',
      signup_date: new Date()
    });

    mixpanelServer.track('user_signed_up', {
      distinct_id: dbUser.phone_number,
      channel: source ?? 'desconocido',
      signup_date: new Date(),
      mp_country_code: dbUser.country_code,
      country_code: dbUser.country_code
    });
  }

  return {
    ...dbUser,
    expenses_count: dbUser._count.expenses
  };
};
