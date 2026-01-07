import { createClient } from '@libsql/client/web';

// Turso database configuration
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

// Create Turso client
export const turso = tursoUrl && tursoAuthToken
  ? createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  : null;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return turso !== null;
}

// Log configuration status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[TURSO] Configuration:', {
    url: tursoUrl ? 'Set' : 'Not set',
    token: tursoAuthToken ? 'Set' : 'Not set',
    available: isDatabaseAvailable(),
  });
}
