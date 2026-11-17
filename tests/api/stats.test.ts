import { describe, expect, it } from 'vitest';
import { GET as stats } from '@/app/api/restaurant/[restaurantSlug]/stats/route';
import { getOwnerCounts } from '@/lib/stats';
import { MenuItem } from '@/models/MenuItem';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory, createItem, createRestaurant, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

describe('GET /api/restaurant/[slug]/stats', () => {
    it('returns zeros for an empty menu', async () => {
        const { token, slug } = await ownerWithRestaurant();
        const res = await call(stats, 'GET', { token, params: { restaurantSlug: slug } });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            categories: 0,
            topLevelCategories: 0,
            subcategories: 0,
            hiddenCategories: 0,
            items: 0,
            availableItems: 0,
            soldOutItems: 0,
            hiddenItems: 0,
            itemsWithoutImage: 0,
        });
    });

    it('counts categories, nesting and item availability', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        const drinks = await createCategory(restaurant._id, { name: 'Drinks' });
        const hot = await createCategory(restaurant._id, { name: 'Hot', parentId: drinks._id, isVisible: false });
        await createCategory(restaurant._id, { name: 'Food' });

        await createItem(restaurant._id, drinks._id, { name: 'Water' });
        await createItem(restaurant._id, hot._id, { name: 'Tea', isAvailable: false });
        const hidden = await createItem(restaurant._id, hot._id, { name: 'Secret', isAvailable: false });
        await MenuItem.updateOne({ _id: hidden._id }, { isHidden: true, imageUrl: 'https://res.cloudinary.com/x/y.jpg' });

        const res = await call(stats, 'GET', { token, params: { restaurantSlug: slug } });

        expect(res.body).toEqual({
            categories: 3,
            topLevelCategories: 2,
            subcategories: 1,
            hiddenCategories: 1,
            items: 3,
            availableItems: 1,
            soldOutItems: 1,
            hiddenItems: 1,
            itemsWithoutImage: 2,
        });
    });

    it("does not count other restaurants' data and hides them from other owners", async () => {
        const owner = await ownerWithRestaurant();
        const other = await ownerWithRestaurant();
        await createItem(other.restaurant._id, (await createCategory(other.restaurant._id))._id);

        const own = await call(stats, 'GET', { token: owner.token, params: { restaurantSlug: owner.slug } });
        const foreign = await call(stats, 'GET', { token: owner.token, params: { restaurantSlug: other.slug } });

        expect(own.body.items).toBe(0);
        expect(foreign.status).toBe(404);
    });
});

describe('getOwnerCounts', () => {
    it('totals menus, categories and items across all restaurants of one owner', async () => {
        const { user, restaurant } = await ownerWithRestaurant();
        const second = await createRestaurant(user._id, { isActive: false });
        const empty = await createRestaurant(user._id);
        const stranger = await ownerWithRestaurant();

        const c1 = await createCategory(restaurant._id);
        const c2 = await createCategory(second._id);
        await createCategory(second._id);
        await createItem(restaurant._id, c1._id);
        await createItem(restaurant._id, c1._id);
        await createItem(second._id, c2._id);
        await createItem(stranger.restaurant._id, (await createCategory(stranger.restaurant._id))._id);

        const counts = await getOwnerCounts(String(user._id));

        expect(counts).toMatchObject({ restaurants: 3, activeRestaurants: 2, categories: 3, items: 3 });
        expect(counts.perRestaurant[String(restaurant._id)]).toEqual({ categories: 1, items: 2 });
        expect(counts.perRestaurant[String(second._id)]).toEqual({ categories: 2, items: 1 });
        expect(counts.perRestaurant[String(empty._id)]).toEqual({ categories: 0, items: 0 });
    });
});
