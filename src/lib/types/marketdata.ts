export interface ComparableVehicle {
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    mileage: number;
    price: number;
    dealerName?: string;
    location: {
        city: string;
        state: string;
        zip: string;
        distance: number;
    };
    daysOnMarket: number;
    exteriorColor: string;
    interiorColor: string;
    oneOwner: boolean;
    accidentFree: boolean;
    link: string;
}

export interface PriceAnalysis {
    avgMarketPrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    subjectVehiclePrice: number;
    priceDifference: number;
    percentageDifference: number;
    isPriceGood: boolean;
    similarVehicles: ComparableVehicle[];
    priceFactors: {
        factor: string;
        impact: number;
        description: string;
    }[];
}

export interface NegotiationStrategy {
    summary: string;
    targetPrice: number;
    startingOffer: number;
    keyPoints: string[];
    advantages: string[];
    concerns: string[];
    scripts: {
        opening: string;
        counterOffer: string;
        closing: string;
    };
    additionalTips: string[];
}