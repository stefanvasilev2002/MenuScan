import { describe, expect, it } from 'vitest';
import { PUT as reorderCategories } from '@/app/api/restaurant/[restaurantSlug]/categories/reorder/route';
import { PUT as reorderItems } from '@/app/api/restaurant/[restaurantSlug]/menu-items/reorder/route';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory, createItem, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

const namesInOrder = async (model: typeof Category | typeof MenuItem, filter: Record<string, unknown>) =>
    (await (model as typeof Category).find(filter).sort({ order: 1 })).map((d) => d.name);

describe('PUT /categories/reorder', () => {
    it('reorders top-level categories', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const a = await createCategory(restaurant._id, { name: 'A', order: 1 });
        const b = await createCategory(restaurant._id, { name: 'B', order: 2 });
        const c = await createCategory(restaurant._id, { name: 'C', order: 3 });

        const res = await call(reorderCategories, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { parentId: null, orderedIds: [String(c._id), String(a._id), String(b._id)] },
        });

        expect(res.status).toBe(200);
        expect(await namesInOrder(Category, { restaurantId: restaurant._id })).toEqual(['C', 'A', 'B']);
    });

    it('reorders subcategories without touching other levels', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const drinks = await createCategory(restaurant._id, { name: 'Drinks', order: 1 });
        const hot = await createCategory(restaurant._id, { name: 'Hot', parentId: drinks._id, order: 1 });
        const cold = await createCategory(restaurant._id, { name: 'Cold', parentId: drinks._id, order: 2 });

        const res = await call(reorderCategories, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { parentId: String(drinks._id), orderedIds: [String(cold._id), String(hot._id)] },
        });

        expect(res.status).toBe(200);
        expect(await namesInOrder(Category, { parentId: drinks._id })).toEqual(['Cold', 'Hot']);
        expect((await Category.findById(drinks._id))?.order).toBe(1);
    });

    it('rejects partial lists and ids from another parent', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const a = await createCategory(restaurant._id, { order: 1 });
        const b = await createCategory(restaurant._id, { order: 2 });
        const child = await createCategory(restaurant._id, { parentId: a._id });

        const partial = await call(reorderCategories, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { parentId: null, orderedIds: [String(b._id)] },
        });
        const mixed = await call(reorderCategories, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { parentId: null, orderedIds: [String(b._id), String(child._id)] },
        });

        expect(partial.status).toBe(400);
        expect(mixed.status).toBe(400);
    });

    it("cannot reorder another owner's categories", async () => {
        const owner = await ownerWithRestaurant();
        const intruder = await ownerWithRestaurant();
        const a = await createCategory(owner.restaurant._id, { name: 'A', order: 1 });
        const b = await createCategory(owner.restaurant._id, { name: 'B', order: 2 });
        const body = { parentId: null, orderedIds: [String(b._id), String(a._id)] };

        const viaOwnerSlug = await call(reorderCategories, 'PUT', { token: intruder.token, params: { restaurantSlug: owner.slug }, body });
        const viaOwnSlug = await call(reorderCategories, 'PUT', { token: intruder.token, params: { restaurantSlug: intruder.slug }, body });

        expect(viaOwnerSlug.status).toBe(404);
        expect(viaOwnSlug.status).toBe(400);
        expect(await namesInOrder(Category, { restaurantId: owner.restaurant._id })).toEqual(['A', 'B']);
    });

    it('rejects duplicate ids', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const a = await createCategory(restaurant._id);
        const res = await call(reorderCategories, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { parentId: null, orderedIds: [String(a._id), String(a._id)] },
        });
        expect(res.status).toBe(400);
    });
});

describe('PUT /menu-items/reorder', () => {
    it('reorders items within a category', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const category = await createCategory(restaurant._id);
        const x = await createItem(restaurant._id, category._id, { name: 'X', order: 1 });
        const y = await createItem(restaurant._id, category._id, { name: 'Y', order: 2 });

        const res = await call(reorderItems, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { categoryId: String(category._id), orderedIds: [String(y._id), String(x._id)] },
        });

        expect(res.status).toBe(200);
        expect(res.body.map((i: { name: string }) => i.name)).toEqual(['Y', 'X']);
        expect(await namesInOrder(MenuItem, { categoryId: category._id })).toEqual(['Y', 'X']);
    });

    it('rejects items from a different category', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const first = await createCategory(restaurant._id);
        const second = await createCategory(restaurant._id);
        const x = await createItem(restaurant._id, first._id);
        const y = await createItem(restaurant._id, second._id);

        const res = await call(reorderItems, 'PUT', {
            token,
            params: { restaurantSlug: slug },
            body: { categoryId: String(first._id), orderedIds: [String(x._id), String(y._id)] },
        });
        expect(res.status).toBe(400);
    });
});
