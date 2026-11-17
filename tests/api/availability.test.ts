import { describe, expect, it } from 'vitest';
import { PUT as updateItem } from '@/app/api/restaurant/[restaurantSlug]/menu-items/[itemId]/route';
import { GET as publicMenu } from '@/app/api/public/menu/[slug]/route';
import { availabilityPatch } from '@/lib/availability';
import { setupTestDatabase } from '../helpers/db';
import { call, createCategory, createItem, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

async function seed() {
    const owner = await ownerWithRestaurant();
    const category = await createCategory(owner.restaurant._id);
    const item = await createItem(owner.restaurant._id, category._id, { name: 'Burek' });
    const setStatus = (status: Parameters<typeof availabilityPatch>[0]) =>
        call(updateItem, 'PUT', {
            token: owner.token,
            params: { restaurantSlug: owner.slug, itemId: String(item._id) },
            body: availabilityPatch(status),
        });
    const menuItems = async () => (await call(publicMenu, 'GET', { params: { slug: owner.slug } })).body.items;
    return { setStatus, menuItems };
}

describe('item availability', () => {
    it('defaults new items to visible and available', async () => {
        const { menuItems } = await seed();
        expect(await menuItems()).toEqual([expect.objectContaining({ name: 'Burek', isAvailable: true })]);
    });

    it('keeps sold out items on the public menu, flagged as unavailable', async () => {
        const { setStatus, menuItems } = await seed();
        const res = await setStatus('sold_out');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ isAvailable: false, isHidden: false });
        expect(await menuItems()).toEqual([expect.objectContaining({ name: 'Burek', isAvailable: false })]);
    });

    it('removes hidden items from the public menu and restores them when made available', async () => {
        const { setStatus, menuItems } = await seed();

        await setStatus('hidden');
        expect(await menuItems()).toEqual([]);

        await setStatus('available');
        expect(await menuItems()).toEqual([expect.objectContaining({ name: 'Burek', isAvailable: true })]);
    });

    it('does not leak the hidden flag to guests', async () => {
        const { menuItems } = await seed();
        expect((await menuItems())[0]).not.toHaveProperty('isHidden');
    });
});
