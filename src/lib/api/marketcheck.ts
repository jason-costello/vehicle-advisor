import type { DecodedVIN } from '$lib/types/vehicle';
import type { ComparableVehicle, PriceAnalysis } from '$lib/types/marketdata';
// mport type { MarketData } from '$lib/types/marketdata';

const MARKETCHECK_API_KEY = 'YOUR_MARKETCHECK_API_KEY'; // Replace with environment variable
const MARKETCHECK_BASE_URL = 'https://api.marketcheck.com/v2';

export async function decodeVIN(vin: string): Promise<DecodedVIN> {
    const url = `${MARKETCHECK_BASE_URL}/decode/car/${vin}?api_key=${MARKETCHECK_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to decode VIN: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        year: data.year || 0,
        make: data.make || '',
        model: data.model || '',
        trim: data.trim || '',
        engine: data.engine || '',
        transmission: data.transmission || '',
        drivetrain: data.drivetrain || '',
        bodyType: data.body_type || '',
        fuelType: data.fuel_type || '',
        exteriorColor: data.exterior_color || '',
        interiorColor: data.interior_color || '',
        styleId: data.style_id || '',
        msrp: data.msrp || 0
    };
}

export async function getComparableListings(
    vin: string,
    zipCode: string,
    radius: number = 100
): Promise<ComparableVehicle[]> {
    // First get the vehicle details to search for comparable vehicles
    const decodedVin = await decodeVIN(vin);

    // Search for similar vehicles in the area
    const url = `${MARKETCHECK_BASE_URL}/search/car?api_key=${MARKETCHECK_API_KEY}&year=${decodedVin.year}&make=${decodedVin.make}&model=${decodedVin.model}&trim=${decodedVin.trim}&zip=${zipCode}&radius=${radius}&start=0&rows=20`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch comparable listings: ${response.statusText}`);
    }

    const data = await response.json();

    return data.listings.map((listing: any) => ({
        id: listing.id || '',
        vin: listing.vin || '',
        year: listing.year || 0,
        make: listing.make || '',
        model: listing.model || '',
        trim: listing.trim || '',
        mileage: listing.miles || 0,
        price: listing.price || 0,
        dealerName: listing.dealer_name || '',
        location: {
            city: listing.city || '',
            state: listing.state || '',
            zip: listing.zip || '',
            distance: listing.distance || 0
        },
        daysOnMarket: listing.dom || 0,
        exteriorColor: listing.exterior_color || '',
        interiorColor: listing.interior_color || '',
        oneOwner: listing.one_owner || false,
        accidentFree: listing.clean_title || false,
        link: listing.vdp_url || ''
    }));
}

export async function analyzePricing(
    vin: string,
    zipCode: string,
    mileage: number
): Promise<PriceAnalysis> {
    const comparables = await getComparableListings(vin, zipCode);

    // Find the subject vehicle in the comparables
    const subjectVehicle = comparables.find(v => v.vin === vin);
    const subjectVehiclePrice = subjectVehicle?.price || 0;

    // Calculate price statistics
    const prices = comparables.map(v => v.price);
    const avgMarketPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const minPrice = sortedPrices[0] || 0;
    const maxPrice = sortedPrices[sortedPrices.length - 1] || 0;
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;

    // Calculate the price difference
    const priceDifference = subjectVehiclePrice - avgMarketPrice;
    const percentageDifference = (priceDifference / avgMarketPrice) * 100;

    // Determine if the price is good
    const isPriceGood = percentageDifference <= -5; // If at least 5% below average

    // Analyze factors affecting the price
    const priceFactors = [];

    // Mileage factor
    const avgMileage = comparables.reduce((sum, v) => sum + v.mileage, 0) / comparables.length;
    const mileageDiff = mileage - avgMileage;
    const mileageImpact = mileageDiff > 0 ? -(mileageDiff / 10000) * 5 : (Math.abs(mileageDiff) / 10000) * 5;

    priceFactors.push({
        factor: 'Mileage',
        impact: mileageImpact,
        description: mileageDiff > 0
            ? `Higher than average mileage (${mileage.toLocaleString()} vs. avg. ${avgMileage.toLocaleString()})`
            : `Lower than average mileage (${mileage.toLocaleString()} vs. avg. ${avgMileage.toLocaleString()})`
    });

    // Days on market factor
    if (subjectVehicle) {
        const avgDaysOnMarket = comparables.reduce((sum, v) => sum + v.daysOnMarket, 0) / comparables.length;
        const daysOnMarketDiff = subjectVehicle.daysOnMarket - avgDaysOnMarket;

        if (daysOnMarketDiff > 15) {
            priceFactors.push({
                factor: 'Time on Market',
                impact: -5,
                description: `Listed for ${subjectVehicle.daysOnMarket} days (${daysOnMarketDiff.toFixed(0)} days longer than average)`
            });
        }
    }

    return {
        avgMarketPrice,
        minPrice,
        maxPrice,
        medianPrice,
        subjectVehiclePrice,
        priceDifference,
        percentageDifference,
        isPriceGood,
        similarVehicles: comparables,
        priceFactors
    };
}
