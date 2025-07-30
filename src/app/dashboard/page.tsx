import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { connectToDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';
import RestaurantsList from '@/components/dashboard/RestaurantsList';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
        redirect('/login');
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
        redirect('/login');
    }
    
    await connectToDatabase();
    
    // Get user's restaurants
    const restaurants = await Restaurant.find({ userId: user._id }).sort({ createdAt: -1 });
    
    return <RestaurantsList restaurants={restaurants} user={user} />;
}