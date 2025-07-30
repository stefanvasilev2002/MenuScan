import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { connectToDatabase } from '@/lib/db';
import MenuBuilder from '@/components/dashboard/MenuBuilder';

interface Props {
    params: {
        restaurantSlug: string;
    };
}

export default async function MenuBuilderPage({ params }: Props) {
    const { restaurantSlug } = params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
        return notFound();
    }

    const user = await getCurrentUser(token);
    if (!user) {
        return notFound();
    }

    await connectToDatabase();

    // Verify restaurant ownership
    const restaurant = await Restaurant.findOne({ 
        slug: restaurantSlug, 
        userId: user._id 
    });

    if (!restaurant) {
        return notFound();
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

    return <MenuBuilder restaurant={restaurantData} />;
} 