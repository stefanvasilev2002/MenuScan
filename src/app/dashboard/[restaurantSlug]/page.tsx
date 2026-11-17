import RestaurantDashboardOverview from '@/components/dashboard/RestaurantDashboardOverview';
import { requireOwnedRestaurantPage } from '@/lib/page-auth';
import { getMenuCounts } from '@/lib/stats';

interface Props {
    params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantDashboardPage({ params }: Props) {
    const { restaurantSlug } = await params;
    const { restaurant } = await requireOwnedRestaurantPage(restaurantSlug);
    const counts = await getMenuCounts(restaurant._id);

    return <RestaurantDashboardOverview restaurantSlug={restaurant.slug} restaurantName={restaurant.name} counts={counts} />;
}
