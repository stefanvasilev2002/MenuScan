import { NextResponse } from 'next/server';
import { requireOwnedRestaurant, route } from '@/lib/api';
import { getMenuCounts } from '@/lib/stats';

type Params = { restaurantSlug: string };

export const GET = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    return NextResponse.json(await getMenuCounts(restaurant._id));
});
