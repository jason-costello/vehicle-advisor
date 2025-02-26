// src/lib/api/marketcheck-auth.ts
import { writable } from 'svelte/store';

interface AuthToken {
	access_token: string;
	token_type: string;
	expires_in: number;
	expires_at: number; // Timestamp when token expires
}

// Create a store to hold the token
export const authToken = writable<AuthToken | null>(null);

// Environment variables for OAuth2
const CLIENT_ID = import.meta.env.VITE_MARKETCHECK_CLIENT_ID || '';
const CLIENT_SECRET = import.meta.env.VITE_MARKETCHECK_CLIENT_SECRET || '';
const TOKEN_URL = import.meta.env.VITE_MARKETCHECK_TOKEN_URL || 'https://api.marketcheck.com/oauth/token';

/**
 * Request a new OAuth2 token
 */
export async function getNewToken(): Promise<AuthToken> {
	try {
		const formData = new URLSearchParams();
		formData.append('grant_type', 'client_credentials');
		formData.append('client_id', CLIENT_ID);
		formData.append('client_secret', CLIENT_SECRET);

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData
		});

		if (!response.ok) {
			throw new Error(`Failed to get token: ${response.statusText}`);
		}

		const tokenData = await response.json();

		// Add expiration timestamp
		const expiresAt = Date.now() + (tokenData.expires_in * 1000);
		const token: AuthToken = {
			...tokenData,
			expires_at: expiresAt
		};

		// Update the store
		authToken.set(token);

		// Save to localStorage for persistence
		localStorage.setItem('marketcheck_token', JSON.stringify(token));

		return token;
	} catch (error) {
		console.error('Error obtaining OAuth token:', error);
		throw error;
	}
}

/**
 * Get a valid token, refreshing if necessary
 */
export async function getValidToken(): Promise<string> {
	// Check if we have a token in the store
	let token: AuthToken | null = null;

	// Subscribe to get the current value
	authToken.subscribe(value => {
		token = value;
	})();

	// If no token in store, check localStorage
	if (!token) {
		const savedToken = localStorage.getItem('marketcheck_token');
		if (savedToken) {
			try {
				token = JSON.parse(savedToken);
				authToken.set(token);
			} catch (e) {
				console.error('Error parsing saved token:', e);
			}
		}
	}

	// If token exists but is expired, get a new one
	if (token && token.expires_at < Date.now() + 60000) { // 1 minute buffer
		try {
			token = await getNewToken();
		} catch (error) {
			console.error('Error refreshing token:', error);
			throw error;
		}
	}

	// If we still don't have a token, get a new one
	if (!token) {
		try {
			token = await getNewToken();
		} catch (error) {
			console.error('Error getting new token:', error);
			throw error;
		}
	}

	return `${token.token_type} ${token.access_token}`;
}

/**
 * Create an authorized fetch function that adds the token
 */
export async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
	try {
		// Get a valid token
		const authHeader = await getValidToken();

		// Merge the authorization header with existing headers
		const headers = {
			...options.headers,
			'Authorization': authHeader
		};

		// Make the request with the authorization header
		return fetch(url, {
			...options,
			headers
		});
	} catch (error) {
		console.error('Error making authorized request:', error);
		throw error;
	}
}