import { z } from 'zod';

// Environment validation schema for mobile app
const envSchema = z.object({
  // API Configuration
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_API_KEY: z.string().min(1),
  EXPO_PUBLIC_AGENT_URL: z.string().url(),
  EXPO_PUBLIC_MIXPANEL_TOKEN: z.string().min(1),
  
  // App Configuration
  EXPO_PUBLIC_APP_NAME: z.string().default('LukAI'),
  EXPO_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  
  // External Services (optional)
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_API_KEY: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid mobile environment variables:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      // In mobile, we don't exit, just log the error
      return envSchema.parse({
        EXPO_PUBLIC_API_URL: 'http://localhost:3001',
        EXPO_PUBLIC_API_KEY: 'dev-key',
        EXPO_PUBLIC_AGENT_URL: 'http://localhost:8000',
        EXPO_PUBLIC_MIXPANEL_TOKEN: 'dev-token',
        EXPO_PUBLIC_APP_NAME: 'LukAI',
        EXPO_PUBLIC_APP_VERSION: '1.0.0',
      });
    }
    throw error;
  }
};

export const env = parseEnv();

// Environment helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// API configuration
export const apiConfig = {
  baseUrl: env.EXPO_PUBLIC_API_URL,
  apiKey: env.EXPO_PUBLIC_API_KEY,
  agentUrl: env.EXPO_PUBLIC_AGENT_URL,
};

// App configuration
export const appConfig = {
  name: env.EXPO_PUBLIC_APP_NAME,
  version: env.EXPO_PUBLIC_APP_VERSION,
};

// Analytics configuration
export const analyticsConfig = {
  mixpanelToken: env.EXPO_PUBLIC_MIXPANEL_TOKEN,
};
