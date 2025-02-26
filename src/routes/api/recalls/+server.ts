import { json, type RequestHandler } from '@sveltejs/kit';
import { getCompleteSafetyData } from '$lib/api/nhtsa';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { vin, make, model, year } = body;

        if (!vin || !make || !model || !year) {
            return new Response(JSON.stringify({ error: 'All fields are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const safetyData = await getCompleteSafetyData(vin, make, model, year);
        return json(safetyData);
    } catch (error) {
        console.error('Error in recalls:', error);
        return new Response(JSON.stringify({ error: 'Failed to get safety data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
