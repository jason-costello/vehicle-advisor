import { json, type RequestHandler } from '@sveltejs/kit';
import {generateNegotiationStrategy} from '$lib/api/negotiation';

export const POST: RequestHandler = async ({request}) => {
    try {
        const body = await request.json();
        const {decodedVin, safetyData, priceAnalysis, mileage} = body;

        if (!decodedVin || !safetyData || !priceAnalysis || !mileage) {
            return new Response(JSON.stringify({error: 'All fields are required'}), {
                status: 400,
                headers: {'Content-Type': 'application/json'}
            });
        }

        const strategy = await generateNegotiationStrategy(decodedVin, safetyData, priceAnalysis, mileage);
        return json(strategy);
    } catch (error) {
        console.error('Error in negotiation:', error);
        return new Response(JSON.stringify({error: 'Failed to generate negotiation strategy'}), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
};
