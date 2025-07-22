import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import prisma from '../../lib/prisma';
import {
  getSubscription,
  lemonSqueezySetup
} from '@lemonsqueezy/lemonsqueezy.js';
import { env } from '../../env';

export const getBillingPortal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const customer = await prisma.contact.findUnique({
      where: {
        id: userId
      },
      include: {
        subscription: true
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    lemonSqueezySetup({ apiKey: env.LEMONSQUEEZY_API_KEY });
    const { data: subscription } = await getSubscription(
      customer.subscription.subscription_id
    );

    return res.json({
      success: true,
      data: {
        url: subscription.data.attributes.urls.customer_portal
      },
      message: 'Billing portal URL fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching billing portal:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
