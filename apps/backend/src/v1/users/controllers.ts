import { Response } from 'express';
import clm from 'country-locale-map';
import prisma from '../../lib/prisma';
import { handleError } from '../../utils/handleError';
import { AuthRequest } from '../middlewares';
import {
  // countryCodeToCurrencyCode,
  countryCodeToLanguageCode
  // countryCodeToTimezone
} from '../../lib/helpers/currency';
import { sendTemplate } from '../../lib/tools/whatsapp';
import { submitAgentMessage } from '../webhooks/whatsapp/submitAgentMessage';

/**
 * Update the user's country code and related preferences
 */
export async function updateCountry(req: AuthRequest, res: Response) {
  try {
    const { country_code } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!country_code) {
      return res.status(400).json({
        success: false,
        message: 'Country code is required'
      });
    }

    // Validate country code exists
    const countryExists = clm
      .getAllCountries()
      .some((country) => country.alpha2 === country_code);

    if (!countryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid country code'
      });
    }

    // Get related preferences based on country code
    const language = countryCodeToLanguageCode(country_code) || 'es';
    /*     const currencyCode = countryCodeToCurrencyCode(country_code) || 'USD';
    const locale = clm.getLocaleByAlpha2(country_code) || 'es';
    const timezone = countryCodeToTimezone(country_code) || 'America/Lima'; */

    // Update user in database
    const updatedUser = await prisma.contact.update({
      where: { id: userId },
      data: {
        country_code,
        favorite_language: language
        /* favorite_currency_code: currencyCode,
        favorite_locale: locale,
        favorite_timezone: timezone */
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Country updated successfully',
      data: {
        country_code: updatedUser.country_code
      }
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.update-country.patch',
      message: 'Error updating user country'
    });

    return res.status(500).json({
      success: false,
      message: 'Error updating country'
    });
  }
}

/**
 * Update the user's preferred language
 */
export async function updateLanguage(req: AuthRequest, res: Response) {
  try {
    const { language_code } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!language_code) {
      return res.status(400).json({
        success: false,
        message: 'Language code is required'
      });
    }

    // Update user in database
    const updatedUser = await prisma.contact.update({
      where: { id: userId },
      data: {
        favorite_language: language_code
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Language updated successfully',
      data: {
        favorite_language: updatedUser.favorite_language
      }
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.update-language.patch',
      message: 'Error updating user language'
    });

    return res.status(500).json({
      success: false,
      message: 'Error updating language'
    });
  }
}

/**
 * Update the user's preferred currency
 */
export async function updateCurrency(req: AuthRequest, res: Response) {
  try {
    const { currency_code } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!currency_code) {
      return res.status(400).json({
        success: false,
        message: 'Currency code is required'
      });
    }

    // Update user in database
    const updatedUser = await prisma.contact.update({
      where: { id: userId },
      data: {
        favorite_currency_code: currency_code
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      data: {
        favorite_currency_code: updatedUser.favorite_currency_code
      }
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.update-currency.patch',
      message: 'Error updating user currency'
    });

    return res.status(500).json({
      success: false,
      message: 'Error updating currency'
    });
  }
}

/**
 * Update the user's preferred locale
 */
export async function updateLocale(req: AuthRequest, res: Response) {
  try {
    const { locale } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!locale) {
      return res.status(400).json({
        success: false,
        message: 'Locale is required'
      });
    }

    // Update user in database
    const updatedUser = await prisma.contact.update({
      where: { id: userId },
      data: {
        favorite_locale: locale
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Locale updated successfully',
      data: {
        favorite_locale: updatedUser.favorite_locale
      }
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.update-locale.patch',
      message: 'Error updating user locale'
    });

    return res.status(500).json({
      success: false,
      message: 'Error updating locale'
    });
  }
}

/**
 * Update the user's preferred timezone
 */
export async function updateTimezone(req: AuthRequest, res: Response) {
  try {
    const { timezone } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!timezone) {
      return res.status(400).json({
        success: false,
        message: 'Timezone is required'
      });
    }

    // Update user in database
    const updatedUser = await prisma.contact.update({
      where: { id: userId },
      data: {
        favorite_timezone: timezone
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Timezone updated successfully',
      data: {
        favorite_timezone: updatedUser.favorite_timezone
      }
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.update-timezone.patch',
      message: 'Error updating user timezone'
    });

    return res.status(500).json({
      success: false,
      message: 'Error updating timezone'
    });
  }
}

export async function sendCampaignToUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const { templateId, params } = req.body as {
      templateId: string;
      params: string[];
    };

    const user = await prisma.contact.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await sendTemplate({
      templateName: templateId,
      params: params,
      to: user.phone_number
    });

    await submitAgentMessage({
      chatId: user.chatId,
      content: `Hola ${params[0] ?? ''} 👋🏼

¡Bienvenido/a al programa Power Users de Apolo! 🎉  
Tu acceso premium ya está activo.

✅ Usa todas las funciones sin límite  
🗓️ Registra tus gastos activamente
💬 te haremos preguntas sobre tu experiencia y des comentarios y/o valoraciones

👉 Empieza ahora mismo: envíame tu primer gasto
y comprueba cómo Apolo lleva tu control financiero al instante.

¡Gracias por ayudarnos a mejorar! 🚀`,
      user: user
    });

    return res.status(200).json({
      success: true,
      message: 'Campaign sent successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.send-campaign-to-user.post',
      message: 'Error sending campaign to user'
    });

    return res.status(500).json({
      success: false,
      message: 'Error sending campaign to user'
    });
  }
}

/**
 * Update a category name
 */
export async function updateCategoryName(req: AuthRequest, res: Response) {
  try {
    const { category_id, name, type } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!category_id || !name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Category ID, name, and type are required'
      });
    }

    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "expense" or "income"'
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name cannot be empty'
      });
    }

    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Category name cannot exceed 50 characters'
      });
    }

    // Update the appropriate category table
    let updatedCategory;
    if (type === 'expense') {
      // Verify the category belongs to the user
      const existingCategory = await prisma.expense_category.findFirst({
        where: {
          id: category_id,
          contact_id: userId
        }
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Expense category not found'
        });
      }

      updatedCategory = await prisma.expense_category.update({
        where: { id: category_id },
        data: { name: trimmedName }
      });
    } else {
      // Verify the category belongs to the user
      const existingCategory = await prisma.income_category.findFirst({
        where: {
          id: category_id,
          contact_id: userId
        }
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Income category not found'
        });
      }

      updatedCategory = await prisma.income_category.update({
        where: { id: category_id },
        data: { name: trimmedName }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category name updated successfully',
      data: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        type
      }
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.id || '',
      endpoint: 'users.update-category-name.patch',
      message: 'Error updating category name'
    });

    return res.status(500).json({
      success: false,
      message: 'Error updating category name'
    });
  }
}
