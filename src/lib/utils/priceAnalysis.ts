/**
 * Calculates what percentage of cars are priced above the given price
 *
 * @param price The price to compare
 * @param allPrices Array of all comparable prices
 * @returns Percentage of cars priced above the given price
 */
export function calculatePricePercentile(price: number, allPrices: number[]): number {
    if (!allPrices.length) return 0;

    const sortedPrices = [...allPrices].sort((a, b) => a - b);
    const position = sortedPrices.findIndex(p => p >= price);

    if (position === -1) return 100; // Price is higher than all others

    return (position / sortedPrices.length) * 100;
}

/**
 * Determines if a price is considered a "good deal" based on market data
 *
 * @param price The price to evaluate
 * @param avgPrice The average market price
 * @param otherFactors Additional factors that might affect the evaluation
 * @returns Object containing deal evaluation
 */
export function evaluateDeal(
    price: number,
    avgPrice: number,
    otherFactors: { factor: string; impact: number }[] = []
): {
    isGoodDeal: boolean;
    percentDiff: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    explanation: string;
} {
    const percentDiff = ((price - avgPrice) / avgPrice) * 100;

    // Calculate the impact of other factors
    const totalImpact = otherFactors.reduce((sum, factor) => sum + factor.impact, 0);
    const adjustedPercentDiff = percentDiff - totalImpact;

    let rating: 'excellent' | 'good' | 'fair' | 'poor';
    let explanation = '';

    if (adjustedPercentDiff <= -10) {
        rating = 'excellent';
        explanation = 'This is an excellent deal, significantly below market average.';
    } else if (adjustedPercentDiff <= -5) {
        rating = 'good';
        explanation = 'This is a good deal, below market average.';
    } else if (adjustedPercentDiff <= 5) {
        rating = 'fair';
        explanation = 'This is a fair deal, close to market average.';
    } else {
        rating = 'poor';
        explanation = 'This is overpriced compared to market average.';
    }

    // Add explanation for significant factors
    const significantFactors = otherFactors.filter(f => Math.abs(f.impact) >= 2);
    if (significantFactors.length) {
        explanation += ' Factoring in: ' + significantFactors
            .map(f => `${f.factor} (${f.impact > 0 ? '+' : ''}${f.impact.toFixed(1)}%)`)
            .join(', ');
    }

    return {
        isGoodDeal: adjustedPercentDiff <= 0,
        percentDiff: adjustedPercentDiff,
        rating,
        explanation
    };
}
