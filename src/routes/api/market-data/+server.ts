// src/routes/api/market-data/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { analyzePricing } from '$lib/api/marketcheck';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { vin, zipCode, mileage } = body;

        if (!vin || !zipCode || !mileage) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`Analyzing pricing for VIN: ${vin}, ZIP: ${zipCode}, Mileage: ${mileage}`);
        const priceAnalysis = await analyzePricing(vin, zipCode, mileage);
        return json(priceAnalysis);
    } catch (error) {
        console.error('Error in market data:', error);
        return new Response(JSON.stringify({
            error: 'Failed to get market data',
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};