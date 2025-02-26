/**
 * Formats a price value as a currency string
 *
 * @param price The price to format
 * @param currency The currency code (default: 'USD')
 * @returns Formatted price string
 */
export function formatCurrency(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Formats a number with thousands separators
 *
 * @param value The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats a percentage value
 *
 * @param value The percentage value (e.g., 10.5 for 10.5%)
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a date string to a more readable format
 *
 * @param dateString The date string to format
 * @param format The format style (default: 'medium')
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string,
    format: 'short' | 'medium' | 'long' = 'medium'
): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString; // Return original if parsing fails
        }

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
        return dateString; // Return original if any error occurs
    }
}