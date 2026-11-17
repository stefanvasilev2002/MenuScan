import type { RestaurantData, UserData } from '@/types/restaurant';

interface RestaurantLike {
    _id: unknown;
    name: string;
    slug: string;
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    isActive?: boolean;
    settings?: { currency?: string } | null;
    createdAt?: Date | string;
}

interface UserLike {
    _id: unknown;
    email: string;
    businessName: string;
}

const CURRENCIES = ['MKD', 'EUR', 'USD'] as const;

export function toRestaurantData(doc: RestaurantLike): RestaurantData {
    const currency = CURRENCIES.find((c) => c === doc.settings?.currency) ?? 'MKD';
    return {
        _id: String(doc._id),
        name: doc.name,
        slug: doc.slug,
        description: doc.description ?? '',
        address: doc.address ?? '',
        phone: doc.phone ?? '',
        email: doc.email ?? '',
        isActive: doc.isActive ?? true,
        currency,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date(0).toISOString(),
    };
}

export function toUserData(doc: UserLike): UserData {
    return {
        id: String(doc._id),
        email: doc.email,
        businessName: doc.businessName,
    };
}
