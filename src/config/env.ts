// src/config/env.ts

/**
 * Environment configuration
 * 
 * IMPORTANT: apiUrl should NOT end with /api
 * The services (authService, gameService, etc.) will add /api/ to their paths
 */

export const config = {
  // API Base URL - NO /api suffix!
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Other config options (add as needed)
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
} as const;

export default config;