// src/lib/config/environment.ts
// Centralized environment variable handling for both client and server contexts

// Helper to determine execution environment
const isServer = typeof window === 'undefined';

// Helper function to get environment variables in a SSR-safe way
const getEnv = (key: string, defaultValue: string = ''): string => {
	if (isServer) {
		// Server-side: use process.env
		return process.env[key] || defaultValue;
	} else {
		// Client-side: use import.meta.env
		return (import.meta.env?.[key] as string) || defaultValue;
	}
};

// Environment variables
export const ENV = {
	// MarketCheck API
	MARKETCHECK_API_KEY: getEnv('VITE_MARKETCHECK_API_KEY'),
	MARKETCHECK_BASE_URL: getEnv('VITE_MARKETCHECK_BASE_URL', 'https://mc-api.marketcheck.com/v2'),
	MARKETCHECK_CLIENT_ID: getEnv('VITE_MARKETCHECK_CLIENT_ID'),
	MARKETCHECK_CLIENT_SECRET: getEnv('VITE_MARKETCHECK_CLIENT_SECRET'),
	MARKETCHECK_TOKEN_URL: getEnv('VITE_MARKETCHECK_TOKEN_URL', 'https://api.marketcheck.com/oauth/token'),

	// Claude API
	CLAUDE_API_KEY: getEnv('VITE_CLAUDE_API_KEY'),
	CLAUDE_API_URL: getEnv('VITE_CLAUDE_API_URL', 'https://api.anthropic.com/v1/messages'),

	// Application settings
	NODE_ENV: getEnv('NODE_ENV', 'development'),
	IS_PRODUCTION: getEnv('NODE_ENV') === 'production'
};