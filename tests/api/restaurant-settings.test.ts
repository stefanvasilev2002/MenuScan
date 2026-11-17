import { describe, expect, it } from 'vitest';
import { GET as getRestaurant, PATCH as updateRestaurant } from '@/app/api/restaurant/[restaurantSlug]/route';
import { GET as publicMenu } from '@/app/api/public/menu/[slug]/route';
import { Restaurant } from '@/models/Restaurant';
import { setupTestDatabase } from '../helpers/db';
import { call, ownerWithRestaurant } from '../helpers/http';

setupTestDatabase();

describe('PATCH /api/restaurant/[slug]', () => {
    it('updates details and the base currency', async () => {
        const { token, slug } = await ownerWithRestaurant();

        const res = await call(updateRestaurant, 'PATCH', {
            token,
            params: { restaurantSlug: slug },
            body: {
                name: 'Kafana Ohrid',
                description: 'By the lake',
                phone: '070 123 456',
                email: 'Hello@Kafana.MK',
                currency: 'EUR',
            },
        });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            name: 'Kafana Ohrid',
            slug,
            phone: '070123456',
            email: 'hello@kafana.mk',
            currency: 'EUR',
        });

        const menu = await call(publicMenu, 'GET', { params: { slug } });
        expect(menu.body.restaurant).toMatchObject({ name: 'Kafana Ohrid', currency: 'EUR' });
    });

    it('takes the public menu offline and back online', async () => {
        const { token, slug } = await ownerWithRestaurant();
        const patch = (isActive: boolean) =>
            call(updateRestaurant, 'PATCH', { token, params: { restaurantSlug: slug }, body: { isActive } });

        await patch(false);
        expect((await call(publicMenu, 'GET', { params: { slug } })).status).toBe(404);

        await patch(true);
        expect((await call(publicMenu, 'GET', { params: { slug } })).status).toBe(200);
    });

    it('allows clearing optional fields', async () => {
        const { token, slug, restaurant } = await ownerWithRestaurant();
        await Restaurant.updateOne({ _id: restaurant._id }, { phone: '070123456', email: 'a@b.mk' });

        const res = await call(updateRestaurant, 'PATCH', {
            token,
            params: { restaurantSlug: slug },
            body: { phone: '', email: '' },
        });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ phone: '', email: '' });
    });

    it('validates input and refuses to change the slug or owner', async () => {
        const { token, slug } = await ownerWithRestaurant();
        const params = { restaurantSlug: slug };

        const invalid = await call(updateRestaurant, 'PATCH', { token, params, body: { phone: 'call me', currency: 'GBP', name: '' } });
        expect(invalid.status).toBe(400);
        expect(Object.keys(invalid.body.details).sort()).toEqual(['currency', 'name', 'phone']);

        expect((await call(updateRestaurant, 'PATCH', { token, params, body: { slug: 'stolen' } })).status).toBe(400);
        expect((await call(updateRestaurant, 'PATCH', { token, params, body: { userId: '64b7f9f1c2a4b5d6e7f80912' } })).status).toBe(400);
    });

    it("cannot read or edit another owner's restaurant", async () => {
        const owner = await ownerWithRestaurant();
        const intruder = await ownerWithRestaurant();
        const params = { restaurantSlug: owner.slug };

        expect((await call(getRestaurant, 'GET', { token: intruder.token, params })).status).toBe(404);
        expect((await call(updateRestaurant, 'PATCH', { token: intruder.token, params, body: { isActive: false } })).status).toBe(404);
        expect((await Restaurant.findById(owner.restaurant._id))?.isActive).toBe(true);
    });
});
