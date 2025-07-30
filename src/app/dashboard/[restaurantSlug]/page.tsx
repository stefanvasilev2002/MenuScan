import { Restaurant } from '@/models/Restaurant';
import RestaurantDashboardOverview from '@/components/dashboard/RestaurantDashboardOverview';

interface RestaurantDashboardPageProps {
    params: {
        restaurantSlug: string;
    };
}

export default function RestaurantDashboardPage({ params }: RestaurantDashboardPageProps) {
    return <RestaurantDashboardOverview restaurantSlug={params.restaurantSlug} />;
} 