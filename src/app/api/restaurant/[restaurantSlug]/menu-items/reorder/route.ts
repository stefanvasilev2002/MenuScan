import { NextResponse } from 'next/server';
import { badRequest, parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { sameMembers } from '@/lib/reorder';
import { menuItemReorderSchema } from '@/lib/validation';
import { MenuItem } from '@/models/MenuItem';

type Params = { restaurantSlug: string };

export const PUT = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const { categoryId, orderedIds } = await parseJson(request, menuItemReorderSchema);

    const siblings = await MenuItem.find({ restaurantId: restaurant._id, categoryId }).select('_id').lean();
    if (!sameMembers(siblings.map((i) => String(i._id)), orderedIds)) {
        throw badRequest('orderedIds must list every item in this category exactly once');
    }

    await MenuItem.bulkWrite(
        orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, restaurantId: restaurant._id },
                update: { $set: { order: index + 1 } },
            },
        })),
    );

    const items = await MenuItem.find({ restaurantId: restaurant._id, categoryId }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(items);
});
