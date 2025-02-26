import { json, RequestHandler } from '@sveltejs/kit';
import { decodeVIN } from '$lib/api/marketcheck';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { vin } = body;

        if (!vin) {
            return new Response(JSON.stringify({ error: 'VIN is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const decodedVin = await decodeVIN(vin);
        return json(decodedVin);
    } catch (error) {
        console.error('Error in VIN lookup:', error);
        return new Response(JSON.stringify({ error: 'Failed to decode VIN' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
