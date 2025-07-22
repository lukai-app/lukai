import { Router } from 'express';
import { monthlySnapshot } from './controllers';

const cronsRouter = Router();

cronsRouter.post('/monthly-snapshot', monthlySnapshot);

export default cronsRouter;
