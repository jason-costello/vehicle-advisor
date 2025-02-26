// src/lib/utils/errorHandling.ts

/**
 * Standardized API error handler
 * @param error The error object
 * @param fallbackMessage Default message to display if error has no message
 * @returns Object with error details
 */
export function handleApiError(error: any, fallbackMessage = 'An unexpected error occurred'): {
	message: string;
	status?: number;
	details?: string;
} {
	console.error('API Error:', error);

	// If it's an HTTP error with response
	if (error.response) {
		return {
			message: error.response.data?.message || fallbackMessage,
			status: error.response.status,
			details: error.response.data?.details || error.message
		};
	}

	// Network error
	if (error.request) {
		return {
			message: 'Network error. Please check your connection.',
			details: error.message
		};
	}

	// Regular Error object
	if (error instanceof Error) {
		return {
			message: error.message || fallbackMessage,
			details: error.stack
		};
	}

	// Fallback for unknown error types
	return {
		message: typeof error === 'string' ? error : fallbackMessage
	};
}

/**
 * Toast message types
 */
export enum ToastType {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
}

/**
 * Show a toast notification
 * This is a placeholder - implement with your preferred toast library
 */
export function showToast(message: string, type: ToastType = ToastType.INFO, duration = 5000): void {
	// Placeholder for toast implementation
	// In a real app, you'd use a toast library or custom implementation
	console.log(`TOAST [${type}]: ${message}`);

	// Example implementation with browser alert for immediate testing
	if (type === ToastType.ERROR) {
		alert(`Error: ${message}`);
	}
}