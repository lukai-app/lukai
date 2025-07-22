import { Router } from 'express';

import {
  whatsappGetWebhook,
  whatsappPostWebhook
} from './whatsapp/controllers';
import { postLemonWebhook } from './lemon/controllers';

const webhooksRouter = Router();

webhooksRouter.post('/whatsapp', whatsappPostWebhook);
webhooksRouter.get('/whatsapp', whatsappGetWebhook);

webhooksRouter.post('/lemon', postLemonWebhook);

export default webhooksRouter;
