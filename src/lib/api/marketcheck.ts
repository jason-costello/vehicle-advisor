import type { DecodedVIN } from '$lib/types/vehicle';
import type { ComparableVehicle, PriceAnalysis } from '$lib/types/marketdata';
import { authorizedFetch } from './marketcheck-auth';

// Use constants instead of importing env variables to avoid dependency issues
const MARKETCHECK_API_KEY = import.meta.env.VITE_MARKETCHECK_API_KEY || 'YOUR_MARKETCHECK_API_KEY';
const MARKETCHECK_BASE_URL = import.meta.env.VITE_MARKETCHECK_BASE_URL || 'https://api.marketcheck.com/v2';

export async function decodeVIN(vin: string): Promise<DecodedVIN> {
    try {
        const url = `${MARKETCHECK_BASE_URL}/decode/car/${vin}`;

        // Using the authorized fetch instead of regular fetch
        const response = await authorizedFetch(url);

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
    } catch (error) {
        console.error('Error decoding VIN:', error);
        // For demo purposes, return mock data when API fails
        return {
            year: 2020,
            make: 'Demo',
            model: 'Vehicle',
            trim: 'Standard',
            engine: '2.0L 4-Cylinder',
            transmission: 'Automatic',
            drivetrain: 'FWD',
            bodyType: 'Sedan',
            fuelType: 'Gasoline',
            exteriorColor: 'White',
            interiorColor: 'Black',
            styleId: 'DEMO123',
            msrp: 25000
        };
    }
}

export async function getComparableListings(
  vin: string,
  zipCode: string,
  radius: number = 100
): Promise<ComparableVehicle[]> {
    try {
        // First get the vehicle details to search for comparable vehicles
        const decodedVin = await decodeVIN(vin);

        // Search for similar vehicles in the area
        const url = `${MARKETCHECK_BASE_URL}/search/car?year=${decodedVin.year}&make=${decodedVin.make}&model=${decodedVin.model}&trim=${decodedVin.trim}&zip=${zipCode}&radius=${radius}&start=0&rows=20`;

        // Using the authorized fetch instead of regular fetch
        const response = await authorizedFetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch comparable listings: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.listings || !Array.isArray(data.listings)) {
            throw new Error('Invalid response format');
        }

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
    } catch (error) {
        console.error('Error getting comparable listings:', error);

        // For demo purposes, return mock data when API fails
        return generateMockComparables(vin, zipCode, 5);
    }
}

export async function analyzePricing(
  vin: string,
  zipCode: string,
  mileage: number
): Promise<PriceAnalysis> {
    try {
        const comparables = await getComparableListings(vin, zipCode);

        // Find the subject vehicle in the comparables
        const subjectVehicle = comparables.find(v => v.vin === vin) ||
          // If not found, create a mock subject vehicle
          {
              ...comparables[0],
              vin,
              price: comparables.reduce((sum, v) => sum + v.price, 0) / comparables.length,
              mileage
          };

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
    } catch (error) {
        console.error('Error analyzing pricing:', error);
        return generateMockPriceAnalysis(vin, mileage);
    }
}

// Helper function to generate mock data for demo/testing
function generateMockComparables(vin: string, zipCode: string, count: number = 5): ComparableVehicle[] {
    const basePrice = 25000 + Math.random() * 5000;
    const baseMileage = 35000 + Math.random() * 20000;
    const cities = ['Springfield', 'Riverdale', 'Oakwood', 'Pine Valley', 'Maplewood'];
    const states = ['NY', 'CA', 'TX', 'IL', 'FL'];
    const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray'];

    // Generate an array of mock vehicles
    return Array.from({ length: count }, (_, i) => {
        const mileageVariance = Math.random() * 10000 - 5000;
        const priceVariance = Math.random() * 3000 - 1500;
        const isSubject = i === 0; // Make first one similar to subject

        return {
            id: `mock-${i}`,
            vin: isSubject ? vin : `MOCK${Math.floor(Math.random() * 1000000000)}`,
            year: 2020,
            make: 'Demo',
            model: 'Vehicle',
            trim: 'Standard',
            mileage: Math.round(baseMileage + mileageVariance),
            price: Math.round(basePrice + priceVariance),
            dealerName: `Demo Dealer ${i + 1}`,
            location: {
                city: cities[i % cities.length],
                state: states[i % states.length],
                zip: zipCode,
                distance: Math.round(i * 5 + Math.random() * 10)
            },
            daysOnMarket: Math.round(10 + Math.random() * 40),
            exteriorColor: colors[Math.floor(Math.random() * colors.length)],
            interiorColor: 'Black',
            oneOwner: Math.random() > 0.5,
            accidentFree: Math.random() > 0.3,
            link: '#'
        };
    });
}

// Helper function to generate mock price analysis
function generateMockPriceAnalysis(vin: string, mileage: number): PriceAnalysis {
    const mockComparables = generateMockComparables(vin, '12345', 5);

    const prices = mockComparables.map(v => v.price);
    const avgMarketPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const subjectVehiclePrice = mockComparables[0].price;

    const priceDifference = subjectVehiclePrice - avgMarketPrice;
    const percentageDifference = (priceDifference / avgMarketPrice) * 100;

    return {
        avgMarketPrice,
        minPrice: sortedPrices[0],
        maxPrice: sortedPrices[sortedPrices.length - 1],
        medianPrice: sortedPrices[Math.floor(sortedPrices.length / 2)],
        subjectVehiclePrice,
        priceDifference,
        percentageDifference,
        isPriceGood: percentageDifference <= -5,
        similarVehicles: mockComparables,
        priceFactors: [
            {
                factor: 'Mileage',
                impact: -2.5,
                description: `Average mileage (${mileage.toLocaleString()} miles)`
            }
        ]
    };
}