import { describe, expect, it } from 'vitest';
import { GET as listCategories, POST as createCategory } from '@/app/api/restaurant/[restaurantSlug]/categories/route';
import {
    DELETE as deleteCategory,
    PUT as updateCategory,
} from '@/app/api/restaurant/[restaurantSlug]/categories/[categoryId]/route';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory as seedCategory, createItem, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

describe('category CRUD', () => {
    it('creates, lists, updates and deletes a category', async () => {
        const { token, slug } = await ownerWithRestaurant();

        const created = await call(createCategory, 'POST', { token, params: { restaurantSlug: slug }, body: { name: 'Starters' } });
        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({ name: 'Starters', parentId: null, order: 1 });

        const listed = await call(listCategories, 'GET', { token, params: { restaurantSlug: slug } });
        expect(listed.body.map((c: { name: string }) => c.name)).toEqual(['Starters']);

        const params = { restaurantSlug: slug, categoryId: created.body._id };
        const updated = await call(updateCategory, 'PUT', { token, params, body: { name: 'Appetizers', isVisible: false } });
        expect(updated.status).toBe(200);
        expect(updated.body).toMatchObject({ name: 'Appetizers', isVisible: false });

        const deleted = await call(deleteCategory, 'DELETE', { token, params });
        expect(deleted.status).toBe(200);
        expect(await Category.countDocuments()).toBe(0);
    });

    it('rejects duplicate names case-insensitively', async () => {
        const { token, slug } = await ownerWithRestaurant();
        await call(createCategory, 'POST', { token, params: { restaurantSlug: slug }, body: { name: 'Desserts' } });
        const dup = await call(createCategory, 'POST', { token, params: { restaurantSlug: slug }, body: { name: 'DESSERTS' } });
        expect(dup.status).toBe(409);
    });

    it('treats regex characters in names literally', async () => {
        const { token, slug } = await ownerWithRestaurant();
        await call(createCategory, 'POST', { token, params: { restaurantSlug: slug }, body: { name: 'Drinks' } });
        const res = await call(createCategory, 'POST', { token, params: { restaurantSlug: slug }, body: { name: '.*' } });
        expect(res.status).toBe(201);
    });

    it('returns 400 with field errors for invalid input', async () => {
        const { token, slug } = await ownerWithRestaurant();
        const res = await call(createCategory, 'POST', {
            token,
            params: { restaurantSlug: slug },
            body: { name: '', color: 'blue' },
        });
        expect(res.status).toBe(400);
        expect(res.body.details).toHaveProperty('name');
        expect(res.body.details).toHaveProperty('color');
    });

    it('returns 404 for a malformed category id', async () => {
        const { token, slug } = await ownerWithRestaurant();
        const res = await call(updateCategory, 'PUT', {
            token,
            params: { restaurantSlug: slug, categoryId: 'not-an-id' },
            body: { name: 'X' },
        });
        expect(res.status).toBe(404);
    });
});

describe('category authorization', () => {
    it('returns 401 without a session', async () => {
        const { slug } = await ownerWithRestaurant();
        expect((await call(listCategories, 'GET', { params: { restaurantSlug: slug } })).status).toBe(401);
    });

    it("hides another owner's restaurant behind a 404", async () => {
        const owner = await ownerWithRestaurant();
        const intruder = await ownerWithRestaurant();

        const list = await call(listCategories, 'GET', { token: intruder.token, params: { restaurantSlug: owner.slug } });
        expect(list.status).toBe(404);

        const create = await call(createCategory, 'POST', {
            token: intruder.token,
            params: { restaurantSlug: owner.slug },
            body: { name: 'Hacked' },
        });
        expect(create.status).toBe(404);
    });

    it("cannot edit or delete another owner's category through their own restaurant slug", async () => {
        const owner = await ownerWithRestaurant();
        const intruder = await ownerWithRestaurant();
        const category = await seedCategory(owner.restaurant._id, { name: 'Private' });
        const params = { restaurantSlug: intruder.slug, categoryId: String(category._id) };

        expect((await call(updateCategory, 'PUT', { token: intruder.token, params, body: { name: 'Mine' } })).status).toBe(404);
        expect((await call(deleteCategory, 'DELETE', { token: intruder.token, params })).status).toBe(404);
        expect(await Category.exists({ _id: category._id, name: 'Private' })).not.toBeNull();
    });
});

describe('category nesting', () => {
    it('creates subcategories and orders them among siblings', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const drinks = await seedCategory(restaurant._id, { name: 'Drinks' });
        const params = { restaurantSlug: slug };

        const hot = await call(createCategory, 'POST', { token, params, body: { name: 'Hot', parentId: String(drinks._id) } });
        const cold = await call(createCategory, 'POST', { token, params, body: { name: 'Cold', parentId: String(drinks._id) } });

        expect(hot.status).toBe(201);
        expect(hot.body.parentId).toBe(String(drinks._id));
        expect([hot.body.order, cold.body.order]).toEqual([1, 2]);
    });

    it("rejects a parent from another restaurant", async () => {
        const owner = await ownerWithRestaurant();
        const other = await ownerWithRestaurant();
        const foreign = await seedCategory(other.restaurant._id);

        const res = await call(createCategory, 'POST', {
            token: owner.token,
            params: { restaurantSlug: owner.slug },
            body: { name: 'Sneaky', parentId: String(foreign._id) },
        });
        expect(res.status).toBe(400);
        expect(res.body.details.parentId).toMatch(/not found/i);
    });

    it('rejects cycles when moving a category under its own descendant', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const drinks = await seedCategory(restaurant._id, { name: 'Drinks' });
        const hot = await seedCategory(restaurant._id, { name: 'Hot', parentId: drinks._id });

        const res = await call(updateCategory, 'PUT', {
            token,
            params: { restaurantSlug: slug, categoryId: String(drinks._id) },
            body: { parentId: String(hot._id) },
        });
        expect(res.status).toBe(400);
        expect(res.body.details).toHaveProperty('parentId');
    });

    it('rejects nesting deeper than three levels', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const a = await seedCategory(restaurant._id, { name: 'A' });
        const b = await seedCategory(restaurant._id, { name: 'B', parentId: a._id });
        const c = await seedCategory(restaurant._id, { name: 'C', parentId: b._id });

        const res = await call(createCategory, 'POST', {
            token,
            params: { restaurantSlug: slug },
            body: { name: 'D', parentId: String(c._id) },
        });
        expect(res.status).toBe(400);
    });

    it('moves a subcategory back to the top level', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const parent = await seedCategory(restaurant._id);
        const child = await seedCategory(restaurant._id, { parentId: parent._id });

        const res = await call(updateCategory, 'PUT', {
            token,
            params: { restaurantSlug: slug, categoryId: String(child._id) },
            body: { parentId: null },
        });
        expect(res.status).toBe(200);
        expect(res.body.parentId).toBeNull();
    });

    it('deletes subcategories and their items with the parent, leaving siblings alone', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const drinks = await seedCategory(restaurant._id, { name: 'Drinks' });
        const hot = await seedCategory(restaurant._id, { name: 'Hot', parentId: drinks._id });
        const coffee = await seedCategory(restaurant._id, { name: 'Coffee', parentId: hot._id });
        const food = await seedCategory(restaurant._id, { name: 'Food' });
        await createItem(restaurant._id, drinks._id);
        await createItem(restaurant._id, coffee._id);
        const keep = await createItem(restaurant._id, food._id);

        const res = await call(deleteCategory, 'DELETE', {
            token,
            params: { restaurantSlug: slug, categoryId: String(drinks._id) },
        });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ deletedCategories: 3, deletedItems: 2 });
        expect((await Category.find()).map((c) => c.name)).toEqual(['Food']);
        expect((await MenuItem.find()).map((i) => String(i._id))).toEqual([String(keep._id)]);
    });
});
