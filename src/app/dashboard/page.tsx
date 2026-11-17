import RestaurantsList from '@/components/dashboard/RestaurantsList';
import { connectToDatabase } from '@/lib/db';
import { requirePageUser } from '@/lib/page-auth';
import { toRestaurantData, toUserData } from '@/lib/serializers';
import { getOwnerCounts } from '@/lib/stats';
import { Restaurant } from '@/models/Restaurant';

export default async function DashboardPage() {
    const user = await requirePageUser();
    await connectToDatabase();
    const [restaurants, counts] = await Promise.all([
        Restaurant.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
        getOwnerCounts(String(user._id)),
    ]);

    return <RestaurantsList restaurants={restaurants.map(toRestaurantData)} user={toUserData(user)} counts={counts} />;
}
