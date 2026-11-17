import RestaurantSettingsForm from '@/components/dashboard/RestaurantSettingsForm';
import { requireOwnedRestaurantPage } from '@/lib/page-auth';
import { toRestaurantData } from '@/lib/serializers';

interface Props {
    params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantSettingsPage({ params }: Props) {
    const { restaurantSlug } = await params;
    const { restaurant } = await requireOwnedRestaurantPage(restaurantSlug);
    return <RestaurantSettingsForm restaurant={toRestaurantData(restaurant)} />;
}
