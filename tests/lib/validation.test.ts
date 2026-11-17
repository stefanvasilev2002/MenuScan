import { describe, expect, it } from 'vitest';
import {
    categoryCreateSchema,
    categoryUpdateSchema,
    fieldErrors,
    menuItemCreateSchema,
    menuItemUpdateSchema,
    registerSchema,
} from '@/lib/validation';
import { makeTestPassword } from '../helpers/fixtures';

const validId = '64b7f9f1c2a4b5d6e7f80912';

describe('registerSchema', () => {
    it('normalises email and accepts a strong password', () => {
        const password = makeTestPassword();
        const result = registerSchema.parse({ email: ' Owner@Example.COM ', password, businessName: ' Cafe ' });
        expect(result).toEqual({ email: 'owner@example.com', password, businessName: 'Cafe' });
    });

    it.each([
        ['short', 'Ab1!'],
        ['no uppercase', 'weakpass1!'],
        ['no number', 'Weakpass!!'],
        ['no special character', 'Weakpass11'],
    ])('rejects a password with %s', (_label, password) => {
        const result = registerSchema.safeParse({ email: 'a@b.co', password, businessName: 'X' });
        expect(result.success).toBe(false);
    });

    it('rejects invalid emails with a field error', () => {
        const result = registerSchema.safeParse({ email: 'nope', password: makeTestPassword(), businessName: 'X' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(fieldErrors(result.error)).toHaveProperty('email');
        }
    });
});

describe('categoryCreateSchema', () => {
    it('applies defaults', () => {
        expect(categoryCreateSchema.parse({ name: 'Drinks' })).toEqual({
            name: 'Drinks',
            description: '',
            icon: '🍽️',
            color: '#3B82F6',
            isVisible: true,
            parentId: null,
        });
    });

    it('rejects invalid colours and parent ids', () => {
        expect(categoryCreateSchema.safeParse({ name: 'X', color: 'red' }).success).toBe(false);
        expect(categoryCreateSchema.safeParse({ name: 'X', parentId: 'not-an-id' }).success).toBe(false);
    });

    it('rejects blank and overly long names', () => {
        expect(categoryCreateSchema.safeParse({ name: '   ' }).success).toBe(false);
        expect(categoryCreateSchema.safeParse({ name: 'x'.repeat(51) }).success).toBe(false);
    });
});

describe('categoryUpdateSchema', () => {
    it('allows partial updates and moving to the top level', () => {
        expect(categoryUpdateSchema.parse({ parentId: null })).toEqual({ parentId: null });
    });

    it('rejects fields that cannot be changed', () => {
        expect(categoryUpdateSchema.safeParse({ restaurantId: validId }).success).toBe(false);
    });
});

describe('menuItemCreateSchema', () => {
    it('coerces numeric strings and applies defaults', () => {
        const result = menuItemCreateSchema.parse({ name: 'Burek', price: '120', categoryId: validId, preparationTime: '15' });
        expect(result).toMatchObject({
            name: 'Burek',
            price: 120,
            preparationTime: 15,
            isAvailable: true,
            allergens: [],
            imageUrl: '',
        });
    });

    it.each([0, -5, 'abc', 2_000_000])('rejects invalid price %s', (price) => {
        expect(menuItemCreateSchema.safeParse({ name: 'X', price, categoryId: validId }).success).toBe(false);
    });

    it('only accepts Cloudinary image URLs', () => {
        const base = { name: 'X', price: 1, categoryId: validId };
        expect(menuItemCreateSchema.safeParse({ ...base, imageUrl: 'https://evil.example.com/a.png' }).success).toBe(false);
        expect(
            menuItemCreateSchema.safeParse({ ...base, imageUrl: 'https://res.cloudinary.com/demo/image/upload/a.jpg' }).success,
        ).toBe(true);
    });
});

describe('menuItemUpdateSchema', () => {
    it('accepts a single field and rejects unknown ones', () => {
        expect(menuItemUpdateSchema.parse({ isAvailable: false })).toEqual({ isAvailable: false });
        expect(menuItemUpdateSchema.safeParse({ restaurantId: validId }).success).toBe(false);
    });
});
