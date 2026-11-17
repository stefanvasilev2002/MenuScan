import { NextResponse } from 'next/server';
import { notFound, requireOwnedRestaurant, route } from '@/lib/api';
import { copyName } from '@/lib/duplicate';
import { objectIdSchema } from '@/lib/validation';
import { MenuItem } from '@/models/MenuItem';

type Params = { restaurantSlug: string; itemId: string };

export const POST = route<Params>(async (request, { restaurantSlug, itemId }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    if (!objectIdSchema.safeParse(itemId).success) {
        throw notFound('Menu item not found');
    }
    const original = await MenuItem.findOne({ _id: itemId, restaurantId: restaurant._id }).lean();
    if (!original) {
        throw notFound('Menu item not found');
    }

    const scope = { restaurantId: restaurant._id, categoryId: original.categoryId };
    const siblings = await MenuItem.find(scope).select('name').lean();

    await MenuItem.updateMany({ ...scope, order: { $gt: original.order } }, { $inc: { order: 1 } });

    const copy = await MenuItem.create({
        restaurantId: restaurant._id,
        categoryId: original.categoryId,
        name: copyName(original.name, siblings.map((s) => s.name)),
        description: original.description,
        price: original.price,
        isAvailable: original.isAvailable,
        isHidden: true,
        ingredients: original.ingredients,
        allergens: original.allergens,
        isSpicy: original.isSpicy,
        isVegetarian: original.isVegetarian,
        isVegan: original.isVegan,
        preparationTime: original.preparationTime,
        order: original.order + 1,
        imageUrl: '',
        imagePublicId: '',
    });

    const items = await MenuItem.find(scope).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ item: copy, items }, { status: 201 });
});
