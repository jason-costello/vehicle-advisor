export interface VehicleInput {
    vin: string;
    zipCode: string;
    mileage: number;
}

export interface DecodedVIN {
    year: number;
    make: string;
    model: string;
    trim: string;
    engine: string;
    transmission: string;
    drivetrain: string;
    bodyType: string;
    fuelType: string;
    exteriorColor: string;
    interiorColor: string;
    styleId: string;
    msrp: number;
}