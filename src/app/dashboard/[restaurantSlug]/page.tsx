import RestaurantDashboardOverview from '@/components/dashboard/RestaurantDashboardOverview';

interface Props {
    params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantDashboardPage({ params }: Props) {
    const { restaurantSlug } = await params;
    return <RestaurantDashboardOverview restaurantSlug={restaurantSlug} />;
}
