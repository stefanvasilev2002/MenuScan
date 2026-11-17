import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AUTH_COOKIE, getCurrentUser } from './auth';
import { connectToDatabase } from './db';
import { Restaurant } from '@/models/Restaurant';

export const requirePageUser = cache(async () => {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    const user = await getCurrentUser(token);
    if (!user) {
        redirect('/login');
    }
    return user;
});

export const requireOwnedRestaurantPage = cache(async (slug: string) => {
    const user = await requirePageUser();
    await connectToDatabase();
    const restaurant = await Restaurant.findOne({ slug, userId: user._id }).lean();
    if (!restaurant) {
        notFound();
    }
    return { user, restaurant };
});
