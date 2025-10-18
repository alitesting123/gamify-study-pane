// src/config/env.ts

/**
 * Application configuration
 * Values are loaded from environment variables defined in .env files
 */
export const config = {
    /**
     * API base URL
     * Default: http://localhost:3000/api
     */
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
    /**
     * Application environment
     * Values: 'development' | 'production' | 'staging' | 'test'
     */
    environment: import.meta.env.VITE_APP_ENV || 'development',
  
    /**
     * Is development environment
     */
    isDevelopment: import.meta.env.DEV,
  
    /**
     * Is production environment
     */
    isProduction: import.meta.env.PROD,
  
    /**
     * Application version
     */
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
    /**
     * Enable debug mode
     */
    debug: import.meta.env.VITE_DEBUG === 'true',
  
    /**
     * Analytics tracking ID (for future use)
     */
    analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  } as const;
  
  /**
   * Type-safe environment variable access
   */
  export type Environment = typeof config;
  
  /**
   * Validate that required environment variables are present
   */
  export const validateEnv = (): void => {
    const requiredVars: (keyof typeof config)[] = ['apiUrl'];
    
    const missing = requiredVars.filter(key => !config[key]);
    
    if (missing.length > 0) {
      console.warn(
        `Missing environment variables: ${missing.join(', ')}\n` +
        'Using default values. Check your .env file.'
      );
    }
  };
  
  // Run validation in development
  if (config.isDevelopment) {
    validateEnv();
  }