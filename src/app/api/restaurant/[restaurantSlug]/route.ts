import { NextResponse } from 'next/server';
import { parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { toRestaurantData } from '@/lib/serializers';
import { restaurantUpdateSchema } from '@/lib/validation';

type Params = { restaurantSlug: string };

export const GET = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    return NextResponse.json(toRestaurantData(restaurant));
});

export const PATCH = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const { currency, ...fields } = await parseJson(request, restaurantUpdateSchema);

    restaurant.set(fields);
    if (currency) {
        restaurant.set('settings.currency', currency);
    }
    await restaurant.save();

    return NextResponse.json(toRestaurantData(restaurant));
});
