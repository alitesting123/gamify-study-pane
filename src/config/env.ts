// src/config/env.ts

/**
 * Application configuration
 * Values are loaded from environment variables defined in .env files
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',  // ← FALLBACK ADDED
  environment: import.meta.env.VITE_APP_ENV || 'development',
  isDevelopment: import.meta.env.DEV ?? true,
  isProduction: import.meta.env.PROD ?? false,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  debug: import.meta.env.VITE_DEBUG === 'true',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
} as const;

// Debug logging
console.log('🔧 Config loaded:', {
  apiUrl: config.apiUrl,
  rawEnv: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE
});

export type Environment = typeof config;

export const validateEnv = (): void => {
  const requiredVars: (keyof typeof config)[] = ['apiUrl'];
  const missing = requiredVars.filter(key => !config[key]);
  
  if (missing.length > 0) {
      console.warn(
          `⚠️ Missing environment variables: ${missing.join(', ')}\n` +
          'Using default values. Check your .env file.'
      );
  }
};

if (config.isDevelopment) {
  validateEnv();
}