import { NextResponse } from 'next/server';
import { badRequest, parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { sameMembers } from '@/lib/reorder';
import { categoryReorderSchema } from '@/lib/validation';
import { Category } from '@/models/Category';

type Params = { restaurantSlug: string };

export const PUT = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const { parentId, orderedIds } = await parseJson(request, categoryReorderSchema);

    const siblings = await Category.find({ restaurantId: restaurant._id, parentId }).select('_id').lean();
    if (!sameMembers(siblings.map((c) => String(c._id)), orderedIds)) {
        throw badRequest('orderedIds must list every category under this parent exactly once');
    }

    await Category.bulkWrite(
        orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, restaurantId: restaurant._id },
                update: { $set: { order: index + 1 } },
            },
        })),
    );

    const categories = await Category.find({ restaurantId: restaurant._id }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(categories);
});
