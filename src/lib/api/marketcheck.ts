// src/lib/api/marketcheck.ts
import type { DecodedVIN } from '$lib/types/vehicle';
import type { ComparableVehicle, PriceAnalysis } from '$lib/types/marketdata';
import { authorizedFetch } from './marketcheck-auth';
import { ENV } from '$lib/config/environment';

// Use ENV from centralized config
const MARKETCHECK_BASE_URL = ENV.MARKETCHECK_BASE_URL;

/**
 * Decodes a VIN to get vehicle details
 */
export async function decodeVIN(vin: string): Promise<DecodedVIN> {
    try {
        // Updated to use the specs endpoint for more detailed information
        const url = `${MARKETCHECK_BASE_URL}/decode/car/${vin}/specs`;

        // Using authorized fetch with OAuth token
        const response = await authorizedFetch(url);

        if (!response.ok) {
            throw new Error(`Failed to decode VIN: ${response.statusText}`);
        }

        const data = await response.json();
        const vehicleData = data.vehicle || data; // Handle different response structures

        return {
            year: vehicleData.year || 0,
            make: vehicleData.make || '',
            model: vehicleData.model || '',
            trim: vehicleData.trim || '',
            engine: vehicleData.engine || vehicleData.engine_description || '',
            transmission: vehicleData.transmission || '',
            drivetrain: vehicleData.drivetrain || vehicleData.drive_type || '',
            bodyType: vehicleData.body_type || vehicleData.body_style || '',
            fuelType: vehicleData.fuel_type || '',
            exteriorColor: vehicleData.exterior_color || '',
            interiorColor: vehicleData.interior_color || '',
            styleId: vehicleData.style_id || vehicleData.id || '',
            msrp: vehicleData.msrp || 0
        };
    } catch (error) {
        console.error('Error decoding VIN:', error);
        // For demo purposes, return mock data when API fails
        return generateMockVehicleData();
    }
}

/**
 * Gets comparable listings for a VIN in a specific area
 */
export async function getComparableListings(
  vin: string,
  zipCode: string,
  mileage: number,
  radius: number = 100
): Promise<ComparableVehicle[]> {
    try {
        // Using the comparables/decode endpoint as shown in your curl example
        const url = `${MARKETCHECK_BASE_URL}/predict/car/us/marketcheck_price/comparables/decode?vin=${vin}&zip=${zipCode}&miles=${mileage}&radius=${radius}`;

        // Using authorized fetch with OAuth token
        const response = await authorizedFetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch comparable listings: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle the specific response structure where listings are in comparables.listings
        if (!data.comparables || !data.comparables.listings || !Array.isArray(data.comparables.listings)) {
            throw new Error('Invalid response format for comparables');
        }

        return data.comparables.listings.map((listing: any) => mapListingToComparable(listing, vin));
    } catch (error) {
        console.error('Error getting comparable listings:', error);
        // For demo purposes, return mock data when API fails
        return generateMockComparables(vin, zipCode, 5);
    }
}

/**
 * Maps a raw listing from the API to our ComparableVehicle interface
 */
function mapListingToComparable(listing: any, subjectVin: string): ComparableVehicle {
    return {
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
    };
}

/**
 * Analyzes pricing based on comparables
 */
export async function analyzePricing(
  vin: string,
  zipCode: string,
  mileage: number
): Promise<PriceAnalysis> {
    try {
        const comparables = await getComparableListings(vin, zipCode, mileage);

        // Find the subject vehicle in the comparables
        let subjectVehicle = comparables.find(v => v.vin === vin);

        // If not found, use the decoded VIN to get vehicle details and create a subject vehicle
        if (!subjectVehicle) {
            const decodedVin = await decodeVIN(vin);

            // Get additional data for price analysis
            const url = `${MARKETCHECK_BASE_URL}/search/car/active?api_key=${ENV.MARKETCHECK_API_KEY}&year=${decodedVin.year}&make=${decodedVin.make}&model=${decodedVin.model}&trim=${decodedVin.trim}&zip=${zipCode}&radius=100&rows=1`;
            const response = await authorizedFetch(url);

            if (response.ok) {
                const data = await response.json();
                if (data.listings && data.listings.length > 0) {
                    const listing = data.listings[0];
                    subjectVehicle = mapListingToComparable(listing, vin);
                    subjectVehicle.mileage = mileage; // Override with user-provided mileage
                }
            }

            // If still not found, create a mock subject vehicle
            if (!subjectVehicle) {
                subjectVehicle = {
                    id: 'subject-vehicle',
                    vin: vin,
                    year: decodedVin.year,
                    make: decodedVin.make,
                    model: decodedVin.model,
                    trim: decodedVin.trim,
                    mileage: mileage,
                    price: estimatePriceFromComparables(comparables, mileage),
                    dealerName: '',
                    location: {
                        city: '',
                        state: '',
                        zip: zipCode,
                        distance: 0
                    },
                    daysOnMarket: 0,
                    exteriorColor: decodedVin.exteriorColor,
                    interiorColor: decodedVin.interiorColor,
                    oneOwner: false,
                    accidentFree: false,
                    link: ''
                };
            }
        }

        const subjectVehiclePrice = subjectVehicle?.price || 0;

        // Calculate price statistics
        const prices = comparables.map(v => v.price).filter(price => price > 0);
        const avgMarketPrice = prices.length > 0
          ? prices.reduce((sum, price) => sum + price, 0) / prices.length
          : subjectVehiclePrice;

        const sortedPrices = [...prices].sort((a, b) => a - b);
        const minPrice = sortedPrices[0] || 0;
        const maxPrice = sortedPrices[sortedPrices.length - 1] || 0;
        const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;

        // Calculate the price difference
        const priceDifference = subjectVehiclePrice - avgMarketPrice;
        const percentageDifference = avgMarketPrice > 0
          ? (priceDifference / avgMarketPrice) * 100
          : 0;

        // Determine if the price is good
        const isPriceGood = percentageDifference <= -5; // If at least 5% below average

        // Analyze factors affecting the price
        const priceFactors = analyzePriceFactors(subjectVehicle, comparables);

        // Create a list that includes the subject vehicle at the beginning
        const allVehicles = [subjectVehicle, ...comparables.filter(v => v.vin !== vin)];

        return {
            avgMarketPrice,
            minPrice,
            maxPrice,
            medianPrice,
            subjectVehiclePrice,
            priceDifference,
            percentageDifference,
            isPriceGood,
            similarVehicles: allVehicles,
            priceFactors
        };
    } catch (error) {
        console.error('Error analyzing pricing:', error);
        return generateMockPriceAnalysis(vin, mileage);
    }
}

/**
 * Analyzes factors that affect the price of a vehicle
 */
function analyzePriceFactors(subjectVehicle: ComparableVehicle, comparables: ComparableVehicle[]) {
    const priceFactors = [];

    // Mileage factor
    const avgMileage = comparables.reduce((sum, v) => sum + v.mileage, 0) / comparables.length;
    const mileageDiff = subjectVehicle.mileage - avgMileage;
    const mileageImpact = mileageDiff > 0
      ? -(mileageDiff / 10000) * 5
      : (Math.abs(mileageDiff) / 10000) * 5;

    priceFactors.push({
        factor: 'Mileage',
        impact: parseFloat(mileageImpact.toFixed(1)),
        description: mileageDiff > 0
          ? `Higher than average mileage (${subjectVehicle.mileage.toLocaleString()} vs. avg. ${Math.round(avgMileage).toLocaleString()})`
          : `Lower than average mileage (${subjectVehicle.mileage.toLocaleString()} vs. avg. ${Math.round(avgMileage).toLocaleString()})`
    });

    // Days on market factor
    if (subjectVehicle.daysOnMarket > 0) {
        const avgDaysOnMarket = comparables.reduce((sum, v) => sum + v.daysOnMarket, 0) / comparables.length;
        const daysOnMarketDiff = subjectVehicle.daysOnMarket - avgDaysOnMarket;

        if (daysOnMarketDiff > 15) {
            priceFactors.push({
                factor: 'Time on Market',
                impact: -5,
                description: `Listed for ${subjectVehicle.daysOnMarket} days (${Math.round(daysOnMarketDiff)} days longer than average)`
            });
        }
    }

    // Vehicle condition factors (if available)
    if (subjectVehicle.accidentFree) {
        priceFactors.push({
            factor: 'Clean Title',
            impact: 3,
            description: 'Vehicle has a clean title history'
        });
    }

    if (subjectVehicle.oneOwner) {
        priceFactors.push({
            factor: 'Ownership',
            impact: 2,
            description: 'Single owner vehicle'
        });
    }

    return priceFactors;
}

/**
 * Estimates a price based on comparable vehicles and mileage
 */
function estimatePriceFromComparables(comparables: ComparableVehicle[], mileage: number): number {
    if (comparables.length === 0) return 25000; // Default price if no comparables

    // Get prices and mileages from comparables
    const pricesAndMileages = comparables.map(v => ({ price: v.price, mileage: v.mileage }));

    // Calculate average price per mile decrease
    let totalPriceDiff = 0;
    let totalMileageDiff = 0;

    for (let i = 0; i < pricesAndMileages.length; i++) {
        for (let j = i + 1; j < pricesAndMileages.length; j++) {
            const priceDiff = pricesAndMileages[i].price - pricesAndMileages[j].price;
            const mileageDiff = pricesAndMileages[i].mileage - pricesAndMileages[j].mileage;

            if (mileageDiff !== 0) {
                totalPriceDiff += Math.abs(priceDiff);
                totalMileageDiff += Math.abs(mileageDiff);
            }
        }
    }

    // Calculate price per mile
    const pricePerMile = totalMileageDiff > 0 ? totalPriceDiff / totalMileageDiff : 0;

    // Get average price and mileage
    const avgPrice = pricesAndMileages.reduce((sum, item) => sum + item.price, 0) / pricesAndMileages.length;
    const avgMileage = pricesAndMileages.reduce((sum, item) => sum + item.mileage, 0) / pricesAndMileages.length;

    // Estimate price based on mileage difference from average
    const mileageDiff = mileage - avgMileage;
    const estimatedPrice = avgPrice - (mileageDiff * pricePerMile);

    return Math.round(Math.max(estimatedPrice, avgPrice * 0.7)); // Don't go below 70% of average price
}

// Helper function to generate mock data for vehicle details
function generateMockVehicleData(): DecodedVIN {
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

// Helper function to generate mock data for comparable vehicles
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