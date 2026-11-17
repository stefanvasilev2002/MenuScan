import { describe, expect, it } from 'vitest';
import { GET as publicMenu } from '@/app/api/public/menu/[slug]/route';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory, createItem, createRestaurant, createUser } from '../helpers/http';

setupTestDatabase();

describe('GET /api/public/menu/[slug]', () => {
    it('returns the menu without authentication', async () => {
        const { user } = await createUser();
        const restaurant = await createRestaurant(user._id, { name: 'Kafana', slug: 'kafana' });
        const drinks = await createCategory(restaurant._id, { name: 'Drinks' });
        const hot = await createCategory(restaurant._id, { name: 'Hot', parentId: drinks._id });
        await createItem(restaurant._id, hot._id, { name: 'Turkish coffee', isAvailable: false });

        const res = await call(publicMenu, 'GET', { params: { slug: 'kafana' } });

        expect(res.status).toBe(200);
        expect(res.body.restaurant).toEqual({ name: 'Kafana', slug: 'kafana', description: '', currency: 'MKD' });
        expect(res.body.categories.map((c: { name: string }) => c.name).sort()).toEqual(['Drinks', 'Hot']);
        expect(res.body.items).toEqual([expect.objectContaining({ name: 'Turkish coffee', isAvailable: false })]);
        expect(res.headers.get('cache-control')).toContain('s-maxage');
    });

    it('omits hidden categories, their subcategories and their items', async () => {
        const { user } = await createUser();
        const restaurant = await createRestaurant(user._id, { slug: 'hidden-test' });
        const secret = await createCategory(restaurant._id, { name: 'Secret', isVisible: false });
        const nested = await createCategory(restaurant._id, { name: 'Nested', parentId: secret._id });
        const visible = await createCategory(restaurant._id, { name: 'Visible' });
        await createItem(restaurant._id, nested._id, { name: 'Hidden dish' });
        await createItem(restaurant._id, visible._id, { name: 'Public dish' });

        const res = await call(publicMenu, 'GET', { params: { slug: 'hidden-test' } });

        expect(res.body.categories.map((c: { name: string }) => c.name)).toEqual(['Visible']);
        expect(res.body.items.map((i: { name: string }) => i.name)).toEqual(['Public dish']);
    });

    it('does not expose internal fields', async () => {
        const { user } = await createUser();
        const restaurant = await createRestaurant(user._id, { slug: 'private-fields' });
        await createItem(restaurant._id, (await createCategory(restaurant._id))._id);

        const res = await call(publicMenu, 'GET', { params: { slug: 'private-fields' } });
        const json = JSON.stringify(res.body);
        expect(json).not.toContain('userId');
        expect(json).not.toContain('restaurantId');
        expect(json).not.toContain(String(user._id));
    });

    it('returns 404 for unknown or inactive restaurants', async () => {
        const { user } = await createUser();
        await createRestaurant(user._id, { slug: 'closed', isActive: false });

        expect((await call(publicMenu, 'GET', { params: { slug: 'closed' } })).status).toBe(404);
        expect((await call(publicMenu, 'GET', { params: { slug: 'nope' } })).status).toBe(404);
    });
});
