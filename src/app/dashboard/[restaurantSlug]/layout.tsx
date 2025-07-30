import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { connectToDatabase } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import RestaurantDashboardLayout from '@/components/dashboard/RestaurantDashboardLayout';

interface RestaurantLayoutProps {
    children: React.ReactNode;
    params: {
        restaurantSlug: string;
    };
}

export default async function RestaurantLayout({ children, params }: RestaurantLayoutProps) {
    const { restaurantSlug } = params;
    
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
    
    // Find restaurant by slug and verify ownership
    const restaurant = await Restaurant.findOne({ 
        slug: restaurantSlug,
        userId: user._id 
    });
    
    if (!restaurant) {
        notFound();
    }
    
    // Convert MongoDB object to plain object for client component
    const restaurantData = {
        _id: restaurant._id.toString(),
        name: restaurant.name,
        slug: restaurant.slug,
        userId: restaurant.userId.toString(),
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        logo: restaurant.logo,
        isActive: restaurant.isActive,
        settings: restaurant.settings,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt
    };
    
    return (
        <RestaurantDashboardLayout restaurant={restaurantData}>
            {children}
        </RestaurantDashboardLayout>
    );
} 