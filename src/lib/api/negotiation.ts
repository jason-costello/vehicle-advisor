import type { NegotiationStrategy } from '$lib/types/marketdata';
import type { DecodedVIN } from '$lib/types/vehicle';
import type { SafetyData } from '$lib/types/safety';
import type { PriceAnalysis } from '$lib/types/marketdata';

export async function generateNegotiationStrategy(
    decodedVin: DecodedVIN,
    safetyData: SafetyData,
    priceAnalysis: PriceAnalysis,
    mileage: number
): Promise<NegotiationStrategy> {
    // In a real implementation, this would call an AI service API
    // For this example, we'll generate a strategy based on the data

    const vehicle = `${decodedVin.year} ${decodedVin.make} ${decodedVin.model} ${decodedVin.trim}`;
    const avgPrice = priceAnalysis.avgMarketPrice;
    const subjectPrice = priceAnalysis.subjectVehiclePrice;

    // Calculate target price (3-5% below market average if already good, or 10% below if overpriced)
    const discountPercent = priceAnalysis.isPriceGood ? 3 : 10;
    const targetPrice = avgPrice * (1 - discountPercent / 100);

    // Calculate starting offer (8-12% below target)
    const startingOffer = targetPrice * 0.9;

    // Generate key points based on data
    const keyPoints = [];
    const advantages = [];
    const concerns = [];

    // Safety concerns
    if (safetyData.recalls.length > 0) {
        concerns.push(`Vehicle has ${safetyData.recalls.length} open recalls that should be addressed`);
        keyPoints.push(`Request proof that all ${safetyData.recalls.length} recalls have been properly addressed`);
    }

    // Price analysis
    if (priceAnalysis.priceDifference > 0) {
        concerns.push(`Vehicle is priced ${priceAnalysis.percentageDifference.toFixed(1)}% (${priceAnalysis.priceDifference.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}) above market average`);
        keyPoints.push(`Similar vehicles in the area are selling for an average of ${avgPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}`);
    } else {
        advantages.push(`Vehicle is priced ${Math.abs(priceAnalysis.percentageDifference).toFixed(1)}% (${Math.abs(priceAnalysis.priceDifference).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}) below market average`);
    }

    // Mileage
    const mileageFactor = priceAnalysis.priceFactors.find(f => f.factor === 'Mileage');
    if (mileageFactor) {
        if (mileageFactor.impact < 0) {
            concerns.push(mileageFactor.description);
            keyPoints.push(`Higher mileage should result in a lower price`);
        } else {
            advantages.push(mileageFactor.description);
        }
    }

    // Days on market
    const domFactor = priceAnalysis.priceFactors.find(f => f.factor === 'Time on Market');
    if (domFactor && domFactor.impact < 0) {
        keyPoints.push(`Vehicle has been on the market for a while, suggesting room for negotiation`);
    }

    // Safety ratings
    if (safetyData.overallRating >= 4) {
        advantages.push(`Vehicle has excellent safety ratings (${safetyData.overallRating}/5 overall)`);
    } else if (safetyData.overallRating <= 2) {
        concerns.push(`Vehicle has below-average safety ratings (${safetyData.overallRating}/5 overall)`);
    }

    // Generate negotiation scripts
    const openingScript = `"I've done some research on this ${vehicle} and while I'm interested, I notice a few things. ${keyPoints.slice(0, 2).join(' ')} Based on my research, I'd be comfortable starting at ${startingOffer.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}.`;

    const counterOfferScript = `"I understand your position, but considering ${concerns.length > 0 ? concerns[0] : 'the current market conditions'}, my best offer would be ${targetPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}.`;

    const closingScript = `"If we can agree on ${targetPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}, I'm prepared to move forward today.`;

    // Generate additional tips
    const additionalTips = [
        "Get a pre-purchase inspection from a trusted mechanic",
        "Ask for service records to verify proper maintenance",
        "Check if warranty is transferable",
        "Be prepared to walk away if the price doesn't meet your target",
        "Consider negotiating for additional services like free oil changes or detailing"
    ];

    return {
        summary: `Negotiation strategy for ${vehicle} priced at ${subjectPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}`,
        targetPrice,
        startingOffer,
        keyPoints,
        advantages,
        concerns,
        scripts: {
            opening: openingScript,
            counterOffer: counterOfferScript,
            closing: closingScript
        },
        additionalTips
    };
}
