import type { ReactNode } from 'react';
import RestaurantDashboardLayout from '@/components/dashboard/RestaurantDashboardLayout';
import { requireOwnedRestaurantPage } from '@/lib/page-auth';
import { toRestaurantData } from '@/lib/serializers';

interface Props {
    children: ReactNode;
    params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantLayout({ children, params }: Props) {
    const { restaurantSlug } = await params;
    const { restaurant } = await requireOwnedRestaurantPage(restaurantSlug);

    return <RestaurantDashboardLayout restaurant={toRestaurantData(restaurant)}>{children}</RestaurantDashboardLayout>;
}
