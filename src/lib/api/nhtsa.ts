import type { Recall, Complaint, SafetyRating, SafetyData } from '$lib/types/safety';

// Use a constant instead of importing to avoid dependency issues
const NHTSA_BASE_URL = 'https://api.nhtsa.gov/SafetyRatings';

export async function getVehicleRecalls(vin: string): Promise<Recall[]> {
    try {
        const url = `https://api.nhtsa.gov/recalls/vehicle/${vin}?format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch recalls: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) {
            return [];
        }

        return data.results.map((recall: any) => ({
            campaignNumber: recall.campaignNumber || '',
            component: recall.component || '',
            summary: recall.summary || '',
            consequence: recall.consequence || '',
            remedy: recall.remedy || '',
            notes: recall.notes || '',
            reportDate: recall.reportDate || ''
        }));
    } catch (error) {
        console.error('Error fetching vehicle recalls:', error);
        return [];
    }
}

export async function getVehicleComplaints(make: string, model: string, year: number): Promise<Complaint[]> {
    try {
        const url = `https://api.nhtsa.gov/complaints/vehicle/${make}/${model}/${year}?format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch complaints: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) {
            return [];
        }

        return data.results.map((complaint: any) => ({
            id: complaint.id || 0,
            component: complaint.component || '',
            summary: complaint.summary || '',
            date: complaint.incidentDate || '',
            mileage: complaint.odiNumber || 0,
            crashInvolved: complaint.crashInvolved || false,
            injuriesReported: complaint.numberOfInjuries || 0
        }));
    } catch (error) {
        console.error('Error fetching vehicle complaints:', error);
        return [];
    }
}

export async function getSafetyRatings(make: string, model: string, year: number): Promise<SafetyRating[]> {
    try {
        const url = `${NHTSA_BASE_URL}/vehicle/${make}/${model}/${year}?format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch safety ratings: ${response.statusText}`);
        }

        const data = await response.json();
        const ratings: SafetyRating[] = [];

        if (data.results && data.results.length > 0) {
            const result = data.results[0];

            if (result.OverallRating) {
                ratings.push({
                    category: 'Overall',
                    rating: parseInt(result.OverallRating),
                    maxRating: 5,
                    description: 'Overall vehicle safety rating'
                });
            }

            if (result.FrontCrashRating) {
                ratings.push({
                    category: 'Front Crash',
                    rating: parseInt(result.FrontCrashRating),
                    maxRating: 5,
                    description: 'Protection in a frontal crash'
                });
            }

            if (result.SideCrashRating) {
                ratings.push({
                    category: 'Side Crash',
                    rating: parseInt(result.SideCrashRating),
                    maxRating: 5,
                    description: 'Protection in a side impact crash'
                });
            }

            if (result.RolloverRating) {
                ratings.push({
                    category: 'Rollover',
                    rating: parseInt(result.RolloverRating),
                    maxRating: 5,
                    description: 'Resistance to rollover'
                });
            }
        }

        return ratings;
    } catch (error) {
        console.error('Error fetching safety ratings:', error);
        return [];
    }
}

export async function getCompleteSafetyData(vin: string, make: string, model: string, year: number): Promise<SafetyData> {
    try {
        // Use Promise.allSettled to prevent one failure from failing all requests
        const [recallsResult, complaintsResult, ratingsResult] = await Promise.allSettled([
            getVehicleRecalls(vin),
            getVehicleComplaints(make, model, year),
            getSafetyRatings(make, model, year)
        ]);

        const recalls = recallsResult.status === 'fulfilled' ? recallsResult.value : [];
        const complaints = complaintsResult.status === 'fulfilled' ? complaintsResult.value : [];
        const categoryRatings = ratingsResult.status === 'fulfilled' ? ratingsResult.value : [];

        const overallRating = categoryRatings.find(r => r.category === 'Overall')?.rating || 0;

        return {
            overallRating,
            categoryRatings,
            recalls,
            complaints
        };
    } catch (error) {
        console.error('Error getting complete safety data:', error);
        return {
            overallRating: 0,
            categoryRatings: [],
            recalls: [],
            complaints: []
        };
    }
}