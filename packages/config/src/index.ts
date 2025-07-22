// Environment configuration
export const config = {
  // API URLs
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.lukai.com',
    timeout: 30000,
  },
  
  // App configuration
  app: {
    name: 'LukAI',
    version: '1.0.0',
    webUrl: 'https://lukai.com',
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    pooling: {
      min: 2,
      max: 10,
    },
  },
  
  // Authentication
  auth: {
    tokenKey: 'lukai-auth-token',
    expirationDays: 30,
  },
  
  // Feature flags
  features: {
    analytics: true,
    notifications: true,
    screenCapture: true,
  },
} as const;

// Environment helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Type exports for configuration
export type Config = typeof config; 