import { describe, expect, it } from 'vitest';
import { GET as listItems, POST as createItemRoute } from '@/app/api/restaurant/[restaurantSlug]/menu-items/route';
import { DELETE as deleteItem, PUT as updateItem } from '@/app/api/restaurant/[restaurantSlug]/menu-items/[itemId]/route';
import { MenuItem } from '@/models/MenuItem';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory, createItem, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

describe('menu item CRUD', () => {
    it('creates an item with defaults and lists it', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const category = await createCategory(restaurant._id);

        const res = await call(createItemRoute, 'POST', {
            token,
            params: { restaurantSlug: slug },
            body: { name: 'Shopska salad', price: 180, categoryId: String(category._id), allergens: ['Dairy'] },
        });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ name: 'Shopska salad', price: 180, isAvailable: true, allergens: ['Dairy'], order: 1 });

        const list = await call(listItems, 'GET', { token, params: { restaurantSlug: slug } });
        expect(list.body).toHaveLength(1);
    });

    it('validates price and required fields', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const category = await createCategory(restaurant._id);

        const res = await call(createItemRoute, 'POST', {
            token,
            params: { restaurantSlug: slug },
            body: { name: '', price: -1, categoryId: String(category._id) },
        });
        expect(res.status).toBe(400);
        expect(res.body.details).toMatchObject({ name: expect.any(String), price: expect.any(String) });
    });

    it('rejects duplicate names within the same category', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const category = await createCategory(restaurant._id);
        await createItem(restaurant._id, category._id, { name: 'Ajvar' });

        const res = await call(createItemRoute, 'POST', {
            token,
            params: { restaurantSlug: slug },
            body: { name: 'ajvar', price: 90, categoryId: String(category._id) },
        });
        expect(res.status).toBe(409);
    });

    it('updates only the provided fields', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const category = await createCategory(restaurant._id);
        const item = await createItem(restaurant._id, category._id, { name: 'Tavche gravche', price: 200 });

        const res = await call(updateItem, 'PUT', {
            token,
            params: { restaurantSlug: slug, itemId: String(item._id) },
            body: { isAvailable: false },
        });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ name: 'Tavche gravche', price: 200, isAvailable: false });
    });

    it('deletes an item', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const item = await createItem(restaurant._id, (await createCategory(restaurant._id))._id);

        const res = await call(deleteItem, 'DELETE', { token, params: { restaurantSlug: slug, itemId: String(item._id) } });
        expect(res.status).toBe(200);
        expect(await MenuItem.countDocuments()).toBe(0);
    });
});

describe('menu item authorization', () => {
    it("rejects creating an item in another restaurant's category", async () => {
        const owner = await ownerWithRestaurant();
        const other = await ownerWithRestaurant();
        const foreignCategory = await createCategory(other.restaurant._id);

        const res = await call(createItemRoute, 'POST', {
            token: owner.token,
            params: { restaurantSlug: owner.slug },
            body: { name: 'Stolen', price: 1, categoryId: String(foreignCategory._id) },
        });
        expect(res.status).toBe(400);
        expect(res.body.details).toHaveProperty('categoryId');
    });

    it("rejects moving an item into another restaurant's category", async () => {
        const owner = await ownerWithRestaurant();
        const other = await ownerWithRestaurant();
        const item = await createItem(owner.restaurant._id, (await createCategory(owner.restaurant._id))._id);
        const foreignCategory = await createCategory(other.restaurant._id);

        const res = await call(updateItem, 'PUT', {
            token: owner.token,
            params: { restaurantSlug: owner.slug, itemId: String(item._id) },
            body: { categoryId: String(foreignCategory._id) },
        });
        expect(res.status).toBe(400);
        expect(String((await MenuItem.findById(item._id))?.categoryId)).not.toBe(String(foreignCategory._id));
    });

    it("cannot read, update or delete another owner's items", async () => {
        const owner = await ownerWithRestaurant();
        const intruder = await ownerWithRestaurant();
        const item = await createItem(owner.restaurant._id, (await createCategory(owner.restaurant._id))._id, { price: 100 });

        const list = await call(listItems, 'GET', { token: intruder.token, params: { restaurantSlug: owner.slug } });
        expect(list.status).toBe(404);

        const params = { restaurantSlug: intruder.slug, itemId: String(item._id) };
        expect((await call(updateItem, 'PUT', { token: intruder.token, params, body: { price: 1 } })).status).toBe(404);
        expect((await call(deleteItem, 'DELETE', { token: intruder.token, params })).status).toBe(404);
        expect((await MenuItem.findById(item._id))?.price).toBe(100);
    });

    it('rejects attempts to change ownership fields', async () => {
        const owner = await ownerWithRestaurant();
        const other = await ownerWithRestaurant();
        const item = await createItem(owner.restaurant._id, (await createCategory(owner.restaurant._id))._id);

        const res = await call(updateItem, 'PUT', {
            token: owner.token,
            params: { restaurantSlug: owner.slug, itemId: String(item._id) },
            body: { restaurantId: String(other.restaurant._id) },
        });
        expect(res.status).toBe(400);
    });
});
