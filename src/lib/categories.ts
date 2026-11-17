import type { Types } from 'mongoose';
import { badRequest } from './api';
import { getDescendantIds, validateParent, type TreeCategory } from './category-tree';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';

export async function loadCategoryRefs(restaurantId: Types.ObjectId): Promise<TreeCategory[]> {
    const categories = await Category.find({ restaurantId }).select('_id parentId order name').lean();
    return categories.map((c) => ({
        _id: String(c._id),
        parentId: c.parentId ? String(c.parentId) : null,
        order: c.order,
        name: c.name,
    }));
}

export async function assertValidParent(
    restaurantId: Types.ObjectId,
    categoryId: string | null,
    parentId: string | null | undefined,
) {
    if (!parentId) {
        return;
    }
    const result = validateParent(await loadCategoryRefs(restaurantId), categoryId, parentId);
    if (!result.ok) {
        throw badRequest('Validation failed', { parentId: result.reason });
    }
}

export async function deleteCategoryCascade(restaurantId: Types.ObjectId, categoryId: string) {
    const ids = [categoryId, ...getDescendantIds(await loadCategoryRefs(restaurantId), categoryId)];
    const { deletedCount: deletedItems } = await MenuItem.deleteMany({ restaurantId, categoryId: { $in: ids } });
    const { deletedCount: deletedCategories } = await Category.deleteMany({ restaurantId, _id: { $in: ids } });
    return { deletedCategories, deletedItems };
}
