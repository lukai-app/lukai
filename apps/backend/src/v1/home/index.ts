import { Router } from 'express';

import { getHome } from './controllers';
import { verifyUserToken } from '../middlewares';

const homeRouter = Router();

homeRouter.get('/', verifyUserToken, getHome);

export default homeRouter;
