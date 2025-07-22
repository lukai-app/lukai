import { Router } from 'express';

import { sendCode, login, getMe } from './controllers';
import { verifyUserToken } from '../middlewares';

const authRouter = Router();

authRouter.post('/send-code', sendCode);
authRouter.post('/login', login);
authRouter.get('/me', verifyUserToken, getMe);

export default authRouter;
