import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3001'),

  // Database
  POSTGRES_DATABASE: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().url(),
  POSTGRES_URL: z.string().url().optional(),
  POSTGRES_URL_NON_POOLING: z.string().url(),

  // Authentication & Security
  JWT_SECRET: z.string().min(32),
  API_KEY: z.string().min(1),
  ENCRYPTION_MASTER_KEY: z.string().min(32),

  // External APIs
  OPENAI_API_KEY: z.string().min(1),
  MISTRAL_API_KEY: z.string().min(1).optional(),

  // WhatsApp Integration
  WHATSAPP_ADMIN_NUMBER: z.string().optional(),
  WHATSAPP_WEBHOOK_TOKEN: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_SENDER_ID: z.string().optional(),

  // Google Services
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // Analytics & Monitoring
  MIXPANEL_TOKEN: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_PUBLIC_KEY: z.string().optional(),

  // File Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Redis & Caching
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Payment Processing
  LEMON_WEBHOOK_SIGNING_SECRET: z.string().optional(),
  LEMONSQUEEZY_API_KEY: z.string().optional(),

  // Task Queue
  QSTASH_URL: z.string().url().optional(),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),

  // Cron Jobs
  CRON_SECRET: z.string().optional(),

  // Admin & Service Tokens
  ADMIN_TOKEN: z.string().optional(),
  AGENT_SERVICE_TOKEN: z.string().optional(),

  // Client URLs
  CLIENT_BASE_URL: z.string().url().default('http://localhost:3000'),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment
export const env = parseEnv();

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Database configuration
export const databaseConfig = {
  url: env.POSTGRES_PRISMA_URL,
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DATABASE,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  prismaUrl: env.POSTGRES_PRISMA_URL,
  urlNonPooling: env.POSTGRES_URL_NON_POOLING,
};

// API configuration
export const apiConfig = {
  port: parseInt(env.PORT, 10),
  baseUrl: env.API_BASE_URL,
  clientBaseUrl: env.CLIENT_BASE_URL,
};

// Security configuration
export const securityConfig = {
  jwtSecret: env.JWT_SECRET,
  apiKey: env.API_KEY,
  encryptionMasterKey: env.ENCRYPTION_MASTER_KEY,
};

// External services configuration
export const externalServicesConfig = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  mistral: {
    apiKey: env.MISTRAL_API_KEY,
  },
  whatsapp: {
    adminNumber: env.WHATSAPP_ADMIN_NUMBER,
    webhookToken: env.WHATSAPP_WEBHOOK_TOKEN,
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    senderId: env.WHATSAPP_SENDER_ID,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  },
};
