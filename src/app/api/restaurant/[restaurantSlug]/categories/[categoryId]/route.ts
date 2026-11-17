import { NextResponse } from 'next/server';
import type { Types } from 'mongoose';
import { caseInsensitive, conflict, notFound, parseJson, requireOwnedRestaurant, route } from '@/lib/api';
import { assertValidParent, deleteCategoryCascade } from '@/lib/categories';
import { categoryUpdateSchema, objectIdSchema } from '@/lib/validation';
import { Category } from '@/models/Category';

type Params = { restaurantSlug: string; categoryId: string };

async function findOwnedCategory(restaurantId: Types.ObjectId, categoryId: string) {
    if (!objectIdSchema.safeParse(categoryId).success) {
        throw notFound('Category not found');
    }
    const category = await Category.findOne({ _id: categoryId, restaurantId });
    if (!category) {
        throw notFound('Category not found');
    }
    return category;
}

export const PUT = route<Params>(async (request, { restaurantSlug, categoryId }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    const category = await findOwnedCategory(restaurant._id, categoryId);
    const input = await parseJson(request, categoryUpdateSchema);

    if (input.name && input.name.toLowerCase() !== category.name.toLowerCase()) {
        const duplicate = await Category.findOne({
            restaurantId: restaurant._id,
            name: input.name,
            _id: { $ne: category._id },
        }).collation(caseInsensitive);
        if (duplicate) {
            throw conflict('A category with this name already exists');
        }
    }

    if (input.parentId !== undefined) {
        await assertValidParent(restaurant._id, categoryId, input.parentId);
    }

    category.set(input);
    await category.save();
    return NextResponse.json(category);
});

export const DELETE = route<Params>(async (request, { restaurantSlug, categoryId }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);
    await findOwnedCategory(restaurant._id, categoryId);
    const result = await deleteCategoryCascade(restaurant._id, categoryId);
    return NextResponse.json({ success: true, ...result });
});
