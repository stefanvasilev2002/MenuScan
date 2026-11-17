import RestaurantsList from '@/components/dashboard/RestaurantsList';
import { connectToDatabase } from '@/lib/db';
import { requirePageUser } from '@/lib/page-auth';
import { toRestaurantData, toUserData } from '@/lib/serializers';
import { Restaurant } from '@/models/Restaurant';

export default async function DashboardPage() {
    const user = await requirePageUser();
    await connectToDatabase();
    const restaurants = await Restaurant.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    return <RestaurantsList restaurants={restaurants.map(toRestaurantData)} user={toUserData(user)} />;
}
