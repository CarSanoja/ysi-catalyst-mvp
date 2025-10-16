/**
 * Environment Detection Utility
 *
 * Automatically detects the environment and provides the correct API URL
 * Works for local development, Vercel deployment, and manual configuration
 */

export interface EnvironmentConfig {
  name: 'development' | 'production';
  apiUrl: string;
  isLocal: boolean;
  isVercel: boolean;
}

/**
 * Detects if we're running in Vercel environment
 */
function isVercelEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    (
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('vercel.com') ||
      // Check for Vercel environment variables
      import.meta.env.VERCEL === '1' ||
      import.meta.env.VITE_VERCEL_ENV === 'production'
    )
  );
}

/**
 * Detects if we're running in local development
 */
function isLocalEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('local')
    )
  );
}

/**
 * Gets the appropriate API URL based on environment
 */
function getApiUrl(): string {
  // 1. Check if explicitly set via environment variable
  const explicitApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  // 2. Auto-detect based on environment
  if (isVercelEnvironment()) {
    // Production deployment on Vercel - use AWS HTTPS backend
    return 'https://52.90.163.197/api/v1';
  }

  if (isLocalEnvironment()) {
    // Local development - try local backend first, fallback to AWS
    return 'http://localhost:8080/api/v1';
  }

  // 3. Default fallback to AWS HTTPS backend
  return 'https://52.90.163.197/api/v1';
}

/**
 * Gets the complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isLocal = isLocalEnvironment();
  const isVercel = isVercelEnvironment();
  const apiUrl = getApiUrl();

  return {
    name: isLocal ? 'development' : 'production',
    apiUrl,
    isLocal,
    isVercel,
  };
}

/**
 * Check if local backend is available (for local development)
 */
export async function checkLocalBackend(): Promise<boolean> {
  if (!isLocalEnvironment()) {
    return false;
  }

  try {
    const response = await fetch('http://localhost:8080/health', {
      method: 'GET',
      timeout: 3000,
    } as RequestInit);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets the best available API URL for local development
 * Falls back to AWS backend if local backend is not available
 */
export async function getBestApiUrl(): Promise<string> {
  const config = getEnvironmentConfig();

  // If not local development, return configured URL
  if (!config.isLocal) {
    return config.apiUrl;
  }

  // If local development and explicitly configured, use that
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check if local backend is available
  const localBackendAvailable = await checkLocalBackend();

  if (localBackendAvailable) {
    console.info('🔗 Using local backend: http://localhost:8080/api/v1');
    return 'http://localhost:8080/api/v1';
  } else {
    console.info('🔗 Local backend not available, using AWS HTTPS backend: https://52.90.163.197/api/v1');
    return 'https://52.90.163.197/api/v1';
  }
}

/**
 * Log current environment information (for debugging)
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();

  console.group('🌍 Environment Configuration');
  console.info('Environment:', config.name);
  console.info('API URL:', config.apiUrl);
  console.info('Is Local:', config.isLocal);
  console.info('Is Vercel:', config.isVercel);
  console.info('Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
  console.info('Environment Variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    VERCEL: import.meta.env.VERCEL,
    VITE_VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
  });
  console.groupEnd();
}

// Export as default for convenience
export default {
  getEnvironmentConfig,
  getBestApiUrl,
  checkLocalBackend,
  logEnvironmentInfo,
  isLocal: isLocalEnvironment(),
  isVercel: isVercelEnvironment(),
};