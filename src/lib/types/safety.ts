export interface Recall {
    campaignNumber: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
    notes: string;
    reportDate: string;
}

export interface Complaint {
    id: number;
    component: string;
    summary: string;
    date: string;
    mileage: number;
    crashInvolved: boolean;
    injuriesReported: number;
}


export interface SafetyRating {
    category: string;
    rating: number;
    maxRating: number;
    description: string;
}

export interface SafetyData {
    overallRating: number;
    categoryRatings: SafetyRating[];
    recalls: Recall[];
    complaints: Complaint[];
}

