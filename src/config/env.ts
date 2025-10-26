// src/config/env.ts
// ✅ ENHANCED: Added comprehensive environment configuration with validation

interface EnvironmentConfig {
  apiUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  apiTimeout: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  enableDebugMode: boolean;
  enableAnalytics: boolean;
  ragApiEndpoint?: string;
  websocketUrl?: string;
}

/**
 * ✅ Validate environment configuration
 */
function validateConfig(config: Partial<EnvironmentConfig>): void {
  if (!config.apiUrl) {
    console.warn('⚠️ API URL not configured. Using default: http://localhost:8000');
  }

  if (config.maxFileSize && config.maxFileSize > 100 * 1024 * 1024) {
    console.warn('⚠️ Max file size is very large:', config.maxFileSize / (1024 * 1024), 'MB');
  }
}

/**
 * ✅ Load configuration from environment variables
 */
function loadConfig(): EnvironmentConfig {
  const apiUrl = import.meta.env.VITE_API_URL || 
                 import.meta.env.VITE_APP_API_URL || 
                 'http://localhost:8000';

  const appEnv = (import.meta.env.VITE_ENV || 
                  import.meta.env.MODE || 
                  'development') as 'development' | 'staging' | 'production';

  const config: EnvironmentConfig = {
    // ✅ API Configuration
    apiUrl: apiUrl.replace(/\/$/, ''), // Remove trailing slash
    appEnv,
    apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),

    // ✅ File Upload Configuration
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB default
    allowedFileTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ],

    // ✅ Feature Flags
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || appEnv === 'development',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && appEnv === 'production',

    // ✅ Optional Advanced Features
    ragApiEndpoint: import.meta.env.VITE_RAG_API_ENDPOINT,
    websocketUrl: import.meta.env.VITE_WEBSOCKET_URL,
  };

  validateConfig(config);

  // ✅ Log configuration in development
  if (config.enableDebugMode) {
    console.log('🔧 Environment Configuration:', {
      ...config,
      // Don't log sensitive data in production
      apiUrl: config.apiUrl.replace(/:[^:]*@/, ':***@'), // Hide credentials in URL
    });
  }

  return config;
}

// ✅ Export configuration
export const config = loadConfig();

// ✅ Export helper functions
export const isDevelopment = () => config.appEnv === 'development';
export const isProduction = () => config.appEnv === 'production';
export const isStaging = () => config.appEnv === 'staging';

/**
 * ✅ Get full API endpoint URL
 */
export const getApiEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiUrl}${cleanPath}`;
};

/**
 * ✅ Check if file is allowed
 */
export const isFileAllowed = (file: File): boolean => {
  if (file.size > config.maxFileSize) {
    return false;
  }
  return config.allowedFileTypes.includes(file.type) || file.name.endsWith('.md');
};

/**
 * ✅ Get file size limit in MB
 */
export const getFileSizeLimitMB = (): number => {
  return config.maxFileSize / (1024 * 1024);
};

/**
 * ✅ Get allowed file extensions
 */
export const getAllowedExtensions = (): string[] => {
  return ['.pdf', '.doc', '.docx', '.txt', '.md'];
};

// ✅ Export constants
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login/',
  REGISTER: '/api/auth/register/',
  LOGOUT: '/api/auth/logout/',
  REFRESH_TOKEN: '/api/auth/token/refresh/',
  
  // Games
  GAMES: '/api/games',
  GAME_TEMPLATES: '/api/games/templates',
  CREATE_GAME: '/api/games/create',
  USER_GAMES: '/api/games/user',
  UPLOAD_MATERIAL: '/api/games/upload-material',
  
  // User
  USER_PROFILE: '/api/users/profile',
  USER_PROGRESS: '/api/users/progress',
} as const;

// ✅ Export request timeouts
export const TIMEOUTS = {
  SHORT: 5000,      // 5 seconds
  MEDIUM: 15000,    // 15 seconds
  LONG: 30000,      // 30 seconds
  UPLOAD: 60000,    // 60 seconds for file uploads
  RAG_PROCESSING: 120000, // 2 minutes for RAG processing
} as const;

// ✅ Export retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  BACKOFF_MULTIPLIER: 2,
} as const;