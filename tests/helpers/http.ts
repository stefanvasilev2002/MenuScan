import { NextRequest } from 'next/server';
import { signToken } from '@/lib/session';
import { User } from '@/models/User';
import { Restaurant } from '@/models/Restaurant';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';

type Handler<P> = (request: NextRequest, context: { params: Promise<P> }) => Promise<Response>;

interface CallOptions<P> {
    params?: P;
    body?: unknown;
    token?: string;
    url?: string;
}

export async function call<P = Record<string, never>>(
    handler: Handler<P>,
    method: string,
    { params, body, token, url = 'http://localhost/api/test' }: CallOptions<P> = {},
) {
    const headers = new Headers();
    if (body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }
    if (token) {
        headers.set('Cookie', `auth_token=${token}`);
    }
    const request = new NextRequest(url, {
        method,
        headers,
        body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const response = await handler(request, { params: Promise.resolve((params ?? {}) as P) });
    const text = await response.text();
    return {
        status: response.status,
        headers: response.headers,
        body: text ? JSON.parse(text) : null,
    };
}

let counter = 0;

export async function createUser(overrides: Partial<{ email: string; businessName: string }> = {}) {
    counter++;
    const user = await User.create({
        email: overrides.email ?? `owner${counter}@example.com`,
        password: 'Passw0rd!',
        businessName: overrides.businessName ?? `Business ${counter}`,
    });
    return { user, token: await signToken(String(user._id)) };
}

export async function createRestaurant(userId: unknown, overrides: Partial<{ name: string; slug: string; isActive: boolean }> = {}) {
    counter++;
    return Restaurant.create({
        name: overrides.name ?? `Restaurant ${counter}`,
        slug: overrides.slug ?? `restaurant-${counter}`,
        userId,
        isActive: overrides.isActive ?? true,
    });
}

export async function createCategory(
    restaurantId: unknown,
    overrides: Partial<{ name: string; parentId: unknown; isVisible: boolean; order: number }> = {},
) {
    counter++;
    return Category.create({
        restaurantId,
        name: overrides.name ?? `Category ${counter}`,
        parentId: overrides.parentId ?? null,
        isVisible: overrides.isVisible ?? true,
        order: overrides.order ?? counter,
    });
}

export async function createItem(
    restaurantId: unknown,
    categoryId: unknown,
    overrides: Partial<{ name: string; price: number; isAvailable: boolean; order: number }> = {},
) {
    counter++;
    return MenuItem.create({
        restaurantId,
        categoryId,
        name: overrides.name ?? `Item ${counter}`,
        price: overrides.price ?? 250,
        isAvailable: overrides.isAvailable ?? true,
        order: overrides.order ?? counter,
    });
}

export async function ownerWithRestaurant() {
    const { user, token } = await createUser();
    const restaurant = await createRestaurant(user._id);
    return { user, token, restaurant, slug: restaurant.slug };
}
