import { Router } from 'express';

import webhooksRouter from './webhooks';
import authRouter from './auth';
import homeRouter from './home';
import chartsRouter from './charts';
import transactionsRouter from './transactions';
import subscriptionRouter from './subscriptions';
import accountingRouter from './accounting';
import cronsRouter from './crons';
import usersRouter from './users';
import toolsRouter from './tools';
import adminRouter from './admin';
import { googleSheetsRouter } from './google-sheets';

const v1Router = Router();

// Health check
v1Router.get('/health', (req, res) => res.send('OK'));

v1Router.use('/auth', authRouter);
v1Router.use('/home', homeRouter);
v1Router.use('/charts', chartsRouter);
v1Router.use('/transactions', transactionsRouter);
v1Router.use('/webhooks', webhooksRouter);
v1Router.use('/subscriptions', subscriptionRouter);
v1Router.use('/accounting', accountingRouter);
v1Router.use('/crons', cronsRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/tools', toolsRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/google-sheets', googleSheetsRouter);

export default v1Router;
