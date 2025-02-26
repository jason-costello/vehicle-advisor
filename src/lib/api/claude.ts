// src/lib/api/claude.ts
/**
 * Claude AI API client for Vehicle Advisor
 *
 * This module provides an interface to Anthropic's Claude API for generating
 * negotiation strategies and other AI-driven content.
 */
import type { DecodedVIN } from '$lib/types/vehicle';
import type { SafetyData } from '$lib/types/safety';
import type { PriceAnalysis, NegotiationStrategy } from '$lib/types/marketdata';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';
const CLAUDE_API_URL = import.meta.env.VITE_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

interface ClaudeMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface ClaudeResponse {
	content: Array<{
		type: string;
		text: string;
	}>;
}

/**
 * Send a request to the Claude API
 */
async function sendToClaudeAPI(messages: ClaudeMessage[]): Promise<string> {
	try {
		if (!CLAUDE_API_KEY) {
			throw new Error('Claude API key is not configured');
		}

		const response = await fetch(CLAUDE_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': CLAUDE_API_KEY,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-3-haiku-20240307',
				max_tokens: 4000,
				messages: messages
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Claude API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
		}

		const data = await response.json() as ClaudeResponse;
		return data.content[0]?.text || '';
	} catch (error) {
		console.error('Error calling Claude API:', error);
		throw error;
	}
}

/**
 * Generate a negotiation strategy using Claude
 */
export async function generateNegotiationStrategy(
	decodedVin: DecodedVIN,
	safetyData: SafetyData,
	priceAnalysis: PriceAnalysis,
	mileage: number
): Promise<NegotiationStrategy> {
	try {
		// Format vehicle details for prompt
		const vehicle = `${decodedVin.year} ${decodedVin.make} ${decodedVin.model} ${decodedVin.trim}`;
		const safetyInfo = safetyData.overallRating ?
			`Safety Rating: ${safetyData.overallRating}/5` :
			'No safety rating available';
		const recalls = safetyData.recalls.length ?
			`${safetyData.recalls.length} recalls found` :
			'No recalls found';

		// Build the prompt for Claude
		const prompt = `
I need you to create a car buying negotiation strategy.

Vehicle Information:
- ${vehicle}
- Mileage: ${mileage.toLocaleString()} miles
- ${safetyInfo}
- ${recalls}
- Current listing price: $${priceAnalysis.subjectVehiclePrice.toLocaleString()}
- Average market price: $${priceAnalysis.avgMarketPrice.toLocaleString()}
- Price difference: ${priceAnalysis.percentageDifference > 0 ? '+' : ''}${priceAnalysis.percentageDifference.toFixed(1)}%

Price factors:
${priceAnalysis.priceFactors.map(factor => `- ${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(1)}%)`).join('\n')}

Based on this information, please create a detailed negotiation strategy with the following JSON structure:
{
  "summary": "Brief summary of the strategy",
  "targetPrice": number (a reasonable target price to aim for),
  "startingOffer": number (a lower starting offer price),
  "keyPoints": ["list", "of", "key", "negotiation", "points"],
  "advantages": ["list", "of", "vehicle", "advantages"],
  "concerns": ["list", "of", "concerns", "about", "the", "vehicle"],
  "scripts": {
    "opening": "Script for opening the negotiation",
    "counterOffer": "Script for counter offer",
    "closing": "Script for closing the deal"
  },
  "additionalTips": ["list", "of", "additional", "negotiation", "tips"]
}

IMPORTANT: Respond ONLY with the JSON. No explanations or other text.
`;

		// Send prompt to Claude API
		const messages: ClaudeMessage[] = [
			{ role: 'user', content: prompt }
		];

		const claudeResponse = await sendToClaudeAPI(messages);

		// Parse the JSON response
		// First, we need to extract just the JSON part (in case Claude added any text)
		const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('Failed to extract JSON from Claude response');
		}

		// Parse the JSON string
		const strategy = JSON.parse(jsonMatch[0]) as NegotiationStrategy;

		return strategy;
	} catch (error) {
		console.error('Error generating negotiation strategy with Claude:', error);

		// Fallback strategy if Claude API fails
		return fallbackNegotiationStrategy(decodedVin, safetyData, priceAnalysis, mileage);
	}
}

/**
 * Fallback function to generate a strategy if Claude API fails
 */
function fallbackNegotiationStrategy(
	decodedVin: DecodedVIN,
	safetyData: SafetyData,
	priceAnalysis: PriceAnalysis,
	mileage: number
): NegotiationStrategy {
	const vehicle = `${decodedVin.year} ${decodedVin.make} ${decodedVin.model} ${decodedVin.trim}`;
	const avgPrice = priceAnalysis.avgMarketPrice;

	// Default discount percentages
	const discountPercent = priceAnalysis.isPriceGood ? 3 : 10;
	const targetPrice = Math.round(avgPrice * (1 - discountPercent / 100));
	const startingOffer = Math.round(targetPrice * 0.9);

	// Basic concerns and advantages
	const concerns: string[] = [];
	const advantages: string[] = [];

	// Safety issues
	if (safetyData.recalls.length > 0) {
		concerns.push(`Vehicle has ${safetyData.recalls.length} open recalls that should be addressed`);
	}

	// Price positioning
	if (priceAnalysis.priceDifference > 0) {
		concerns.push(`Vehicle is priced ${priceAnalysis.percentageDifference.toFixed(1)}% above market average`);
	} else {
		advantages.push(`Vehicle is priced ${Math.abs(priceAnalysis.percentageDifference).toFixed(1)}% below market average`);
	}

	// Build fallback strategy
	return {
		summary: `Negotiation strategy for ${vehicle} priced at $${priceAnalysis.subjectVehiclePrice.toLocaleString()}`,
		targetPrice,
		startingOffer,
		keyPoints: [
			`Similar vehicles in the area sell for an average of $${avgPrice.toLocaleString()}`,
			"Get a pre-purchase inspection before finalizing the purchase"
		],
		advantages,
		concerns,
		scripts: {
			opening: `"I've done some research on this ${vehicle} and I'd like to make an offer of $${startingOffer.toLocaleString()} based on my research of the local market."`,
			counterOffer: `"I understand your position, but considering the market value for similar vehicles, my best offer would be $${targetPrice.toLocaleString()}."`,
			closing: `"If we can agree on $${targetPrice.toLocaleString()}, I'm prepared to move forward today."`
		},
		additionalTips: [
			"Get a pre-purchase inspection from a trusted mechanic",
			"Check the vehicle history report for accidents or damage",
			"Verify if the warranty is transferable",
			"Be prepared to walk away if the price doesn't meet your target"
		]
	};
}