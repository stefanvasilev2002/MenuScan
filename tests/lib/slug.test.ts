import { describe, expect, it } from 'vitest';
import { FALLBACK_SLUG, slugify, uniqueSlug } from '@/lib/slug';

describe('slugify', () => {
    it('lowercases and hyphenates latin names', () => {
        expect(slugify('  The Green   Garden!  ')).toBe('the-green-garden');
    });

    it('strips accents', () => {
        expect(slugify('Café Crème')).toBe('cafe-creme');
    });

    it('transliterates Macedonian Cyrillic', () => {
        expect(slugify('Ресторан Охрид')).toBe('restoran-ohrid');
        expect(slugify('Ѓаковица Ќебапчилница')).toBe('gjakovica-kjebapchilnica');
    });

    it('returns an empty string when nothing usable remains', () => {
        expect(slugify('!!!')).toBe('');
    });

    it('limits length without leaving a trailing hyphen', () => {
        const slug = slugify(`${'a'.repeat(59)} b`);
        expect(slug.length).toBeLessThanOrEqual(60);
        expect(slug.endsWith('-')).toBe(false);
    });
});

describe('uniqueSlug', () => {
    it('appends a counter until the slug is free', async () => {
        const taken = new Set(['pizza-place', 'pizza-place-2']);
        await expect(uniqueSlug('Pizza Place', async (s) => taken.has(s))).resolves.toBe('pizza-place-3');
    });

    it('falls back to a default when the name has no usable characters', async () => {
        await expect(uniqueSlug('🍕🍕', async () => false)).resolves.toBe(FALLBACK_SLUG);
    });
});
