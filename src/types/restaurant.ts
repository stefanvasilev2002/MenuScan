export interface RestaurantData {
    _id: string;
    name: string;
    slug: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
    currency: 'MKD' | 'EUR' | 'USD';
    createdAt: string;
}

export interface UserData {
    id: string;
    email: string;
    businessName: string;
}
