import MenuBuilder from '@/components/dashboard/MenuBuilder';
import { requireOwnedRestaurantPage } from '@/lib/page-auth';
import { toRestaurantData } from '@/lib/serializers';

interface Props {
    params: Promise<{ restaurantSlug: string }>;
}

export default async function MenuBuilderPage({ params }: Props) {
    const { restaurantSlug } = await params;
    const { restaurant } = await requireOwnedRestaurantPage(restaurantSlug);
    return <MenuBuilder restaurant={toRestaurantData(restaurant)} />;
}
