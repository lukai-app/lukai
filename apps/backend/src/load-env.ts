import { config } from 'dotenv';

// Load environment variables before any other imports
if (process.env.NODE_ENV !== 'production') {
  config({
    path: './.env',
  });
}
