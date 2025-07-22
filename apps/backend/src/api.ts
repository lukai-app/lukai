import express from 'express';
import cors from 'cors';

import v1Router from './v1';
import { APP_VERSION } from './lib/constants/app';

export const app = express();

app.use(cors({ origin: true }));

app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send({ status: 'ok', version: APP_VERSION });
});

// Version the api
app.use('/v1', v1Router);
