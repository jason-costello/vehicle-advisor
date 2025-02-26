// src/lib/api/marketcheck-auth.ts
import { writable } from 'svelte/store';
import { ENV } from '$lib/config/environment';

interface AuthToken {
	access_token: string;
	token_type: string;
	expires_in: number;
	expires_at: number; // Timestamp when token expires
}

// Create a store to hold the token
export const authToken = writable<AuthToken | null>(null);

// Environment variables for OAuth2
const CLIENT_ID = ENV.MARKETCHECK_CLIENT_ID;
const CLIENT_SECRET = ENV.MARKETCHECK_CLIENT_SECRET;
const TOKEN_URL = ENV.MARKETCHECK_TOKEN_URL;
const API_KEY = ENV.MARKETCHECK_API_KEY;

// Helper function to safely access localStorage (browser) or return null (server)
const safeStorage = {
	getItem: (key: string): string | null => {
		if (typeof localStorage !== 'undefined') {
			return localStorage.getItem(key);
		}
		return null;
	},
	setItem: (key: string, value: string): void => {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(key, value);
		}
	}
};

// Helper to check if code is running in browser
const isBrowser = typeof window !== 'undefined';

/**
 * Request a new OAuth2 token
 */
export async function getNewToken(): Promise<AuthToken> {
	try {
		const formData = new URLSearchParams();
		formData.append('grant_type', 'client_credentials');
		formData.append('client_id', CLIENT_ID);
		formData.append('client_secret', CLIENT_SECRET);

		console.log('Requesting new token from', TOKEN_URL);
		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Token response not OK:', response.status, errorText);
			throw new Error(`Failed to get token: ${response.statusText}`);
		}

		const tokenData = await response.json();
		console.log('Received token data (expires_in):', tokenData.expires_in);

		// Add expiration timestamp
		const expiresAt = Date.now() + (tokenData.expires_in * 1000);
		const token: AuthToken = {
			...tokenData,
			expires_at: expiresAt
		};

		// Update the store
		authToken.set(token);

		// Save to localStorage if in browser environment
		if (isBrowser) {
			safeStorage.setItem('marketcheck_token', JSON.stringify(token));
		}

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

	// Subscribe to get the current value (and unsubscribe immediately)
	const unsubscribe = authToken.subscribe(value => {
		token = value;
	});
	unsubscribe();

	// If no token in store, check localStorage if in browser
	if (!token && isBrowser) {
		const savedToken = safeStorage.getItem('marketcheck_token');
		if (savedToken) {
			try {
				token = JSON.parse(savedToken);
				authToken.set(token);
			} catch (e) {
				console.error('Error parsing saved token:', e);
			}
		}
	}

	// If token exists but is expired or close to expiry, get a new one
	if (token && token.expires_at < Date.now() + 60000) { // 1 minute buffer
		console.log('Token expired or close to expiry, getting new token');
		try {
			token = await getNewToken();
		} catch (error) {
			console.error('Error refreshing token:', error);
			throw error;
		}
	}

	// If we still don't have a token, get a new one
	if (!token) {
		console.log('No token found, getting new token');
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
 * Create an authorized fetch function that adds the token and API key
 */
export async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
	try {
		// Get a valid token
		const authHeader = await getValidToken();

		// Add API key to URL if not already present
		const urlObj = new URL(url);
		if (!urlObj.searchParams.has('api_key') && API_KEY) {
			urlObj.searchParams.append('api_key', API_KEY);
		}

		// Merge the authorization header with existing headers
		const headers = {
			...options.headers,
			'Authorization': authHeader
		};

		// Make the request with the authorization header
		return fetch(urlObj.toString(), {
			...options,
			headers
		});
	} catch (error) {
		console.error('Error making authorized request:', error);
		throw error;
	}
}

/**
 * Check if authentication is configured properly
 */
export function isAuthConfigured(): boolean {
	return Boolean(CLIENT_ID) && Boolean(CLIENT_SECRET) && Boolean(TOKEN_URL);
}