import { describe, expect, it } from 'vitest';
import { POST as duplicate } from '@/app/api/restaurant/[restaurantSlug]/menu-items/[itemId]/duplicate/route';
import { GET as publicMenu } from '@/app/api/public/menu/[slug]/route';
import { MenuItem } from '@/models/MenuItem';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory, createItem, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

describe('POST /menu-items/[itemId]/duplicate', () => {
    it('copies the item right after the original, hidden and without the image', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const category = await createCategory(restaurant._id);
        const first = await createItem(restaurant._id, category._id, { name: 'Pizza', order: 1, price: 400 });
        await createItem(restaurant._id, category._id, { name: 'Pasta', order: 2 });
        await MenuItem.updateOne(
            { _id: first._id },
            {
                allergens: ['Gluten'],
                isVegetarian: true,
                imageUrl: 'https://res.cloudinary.com/x/pizza.jpg',
                imagePublicId: 'menuscan/u/pizza',
            },
        );

        const res = await call(duplicate, 'POST', { token, params: { restaurantSlug: slug, itemId: String(first._id) } });

        expect(res.status).toBe(201);
        expect(res.body.item).toMatchObject({
            name: 'Pizza (copy)',
            price: 400,
            allergens: ['Gluten'],
            isVegetarian: true,
            isHidden: true,
            imageUrl: '',
            imagePublicId: '',
        });
        expect(res.body.items.map((i: { name: string }) => i.name)).toEqual(['Pizza', 'Pizza (copy)', 'Pasta']);
        expect(res.body.items.map((i: { order: number }) => i.order)).toEqual([1, 2, 3]);
    });

    it('keeps the copy off the public menu until it is made visible', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const item = await createItem(restaurant._id, (await createCategory(restaurant._id))._id, { name: 'Soup' });

        await call(duplicate, 'POST', { token, params: { restaurantSlug: slug, itemId: String(item._id) } });

        const menu = await call(publicMenu, 'GET', { params: { slug } });
        expect(menu.body.items.map((i: { name: string }) => i.name)).toEqual(['Soup']);
    });

    it('generates unique names for repeated copies', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const item = await createItem(restaurant._id, (await createCategory(restaurant._id))._id, { name: 'Soup' });
        const params = { restaurantSlug: slug, itemId: String(item._id) };

        await call(duplicate, 'POST', { token, params });
        const second = await call(duplicate, 'POST', { token, params });

        expect(second.body.item.name).toBe('Soup (copy 2)');
    });

    it("cannot duplicate another owner's item", async () => {
        const owner = await ownerWithRestaurant();
        const intruder = await ownerWithRestaurant();
        const item = await createItem(owner.restaurant._id, (await createCategory(owner.restaurant._id))._id);

        const res = await call(duplicate, 'POST', {
            token: intruder.token,
            params: { restaurantSlug: intruder.slug, itemId: String(item._id) },
        });

        expect(res.status).toBe(404);
        expect(await MenuItem.countDocuments()).toBe(1);
    });
});
