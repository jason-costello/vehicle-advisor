// src/lib/api/negotiation.ts
import type { NegotiationStrategy } from '$lib/types/marketdata';
import type { DecodedVIN } from '$lib/types/vehicle';
import type { SafetyData } from '$lib/types/safety';
import type { PriceAnalysis } from '$lib/types/marketdata';

// Import the Claude implementation
import { generateNegotiationStrategy as generateWithClaude } from './claude';

/**
 * Generate negotiation strategy using Claude AI
 */
export async function generateNegotiationStrategy(
  decodedVin: DecodedVIN,
  safetyData: SafetyData,
  priceAnalysis: PriceAnalysis,
  mileage: number
): Promise<NegotiationStrategy> {
    // Use Claude to generate the negotiation strategy
    return generateWithClaude(decodedVin, safetyData, priceAnalysis, mileage);
}