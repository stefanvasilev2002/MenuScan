import { describe, expect, it } from 'vitest';
import { POST as createRestaurant } from '@/app/api/restaurant/route';
import { Restaurant } from '@/models/Restaurant';
import { setupTestDatabase } from '../helpers/db';
import { call, createUser } from '../helpers/http';

setupTestDatabase();

describe('POST /api/restaurant', () => {
    it('requires authentication', async () => {
        const res = await call(createRestaurant, 'POST', { body: { name: 'Bistro' } });
        expect(res.status).toBe(401);
    });

    it('creates a restaurant owned by the caller', async () => {
        const { user, token } = await createUser();
        const res = await call(createRestaurant, 'POST', { token, body: { name: 'Green Bistro', description: 'Fresh' } });

        expect(res.status).toBe(201);
        expect(res.body.restaurant).toMatchObject({ name: 'Green Bistro', slug: 'green-bistro' });
        const stored = await Restaurant.findOne({ slug: 'green-bistro' });
        expect(String(stored?.userId)).toBe(String(user._id));
    });

    it('gives different users globally unique slugs for the same name', async () => {
        const first = await createUser();
        const second = await createUser();
        const a = await call(createRestaurant, 'POST', { token: first.token, body: { name: 'Pizza Place' } });
        const b = await call(createRestaurant, 'POST', { token: second.token, body: { name: 'Pizza Place' } });

        expect(a.body.restaurant.slug).toBe('pizza-place');
        expect(b.body.restaurant.slug).toBe('pizza-place-2');
    });

    it('builds readable slugs from Cyrillic names', async () => {
        const { token } = await createUser();
        const res = await call(createRestaurant, 'POST', { token, body: { name: 'Кафе Скопје' } });
        expect(res.body.restaurant.slug).toBe('kafe-skopje');
    });

    it('validates the name', async () => {
        const { token } = await createUser();
        const res = await call(createRestaurant, 'POST', { token, body: { name: '  ' } });
        expect(res.status).toBe(400);
        expect(res.body.details).toHaveProperty('name');
    });
});
