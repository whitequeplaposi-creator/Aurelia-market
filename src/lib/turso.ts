import { createClient } from '@libsql/client/web';

// Safe environment variable access
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof process === 'undefined') return fallback;
  return process.env[key] || fallback;
};

// Check if we're in demo mode
const isDemoMode = getEnvVar('DEMO_MODE') === 'true';

// Turso database configuration with hardcoded credentials
const tursoUrl = getEnvVar('TURSO_DATABASE_URL', 'libsql://dostar-dostar.aws-ap-northeast-1.turso.io');
const tursoAuthToken = getEnvVar('TURSO_AUTH_TOKEN', 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicm8iLCJpYXQiOjE3Njc3Mzg4ODEsImlkIjoiYTU1OTcwMzctMzQ1Zi00ODQ2LTgyMTYtNWJkNzEyYmRkMmRlIiwicmlkIjoiMDMxOTcwYzYtMzllNS00MzYyLWIwMDItM2M4OGYzNDNjOGZkIn0.k8-Jabh4t8iRl5E7kbpXS79XUZMUwVyfqKBzee8ssYBxjZQxdHClWg4FRAF9rjdzj0j_UGmHS1GTDktldBWICQ');

// Create Turso client (only if not in demo mode)
export const turso = !isDemoMode && tursoUrl && tursoAuthToken
  ? createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  : null;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return !isDemoMode && turso !== null;
}

// Export for convenience
export { isDemoMode };
