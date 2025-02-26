// src/routes/api/vin-lookup/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { decodeVIN } from '$lib/api/marketcheck';
import { logEnvironmentConfig } from '$lib/config/environment';

export const POST: RequestHandler = async ({ request }) => {
    try {
        // Log environment config in debug mode
        logEnvironmentConfig();

        const body = await request.json();
        const { vin } = body;

        if (!vin) {
            return new Response(JSON.stringify({ error: 'VIN is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`Decoding VIN: ${vin}`);
        const decodedVin = await decodeVIN(vin);
        return json(decodedVin);
    } catch (error) {
        console.error('Error in VIN lookup:', error);
        return new Response(JSON.stringify({
            error: 'Failed to decode VIN',
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};