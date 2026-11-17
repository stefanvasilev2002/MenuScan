import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, filterMenuItems, hasActiveFilters, normalizeSearchText, type FilterableItem } from '@/lib/menu-filter';

type Item = FilterableItem & { id: string };

const item = (id: string, overrides: Partial<Item> = {}): Item => ({
    id,
    name: id,
    description: '',
    ingredients: [],
    categoryId: 'food',
    price: 100,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    ...overrides,
});

const categories = [
    { _id: 'drinks', parentId: null, order: 1, name: 'Drinks' },
    { _id: 'hot', parentId: 'drinks', order: 1, name: 'Hot' },
    { _id: 'coffee', parentId: 'hot', order: 1, name: 'Coffee' },
    { _id: 'food', parentId: null, order: 2, name: 'Food' },
];

const items = [
    item('Espresso', { categoryId: 'coffee', price: 60, ingredients: ['Arabica'] }),
    item('Herbal tea', { categoryId: 'hot', price: 50, isVegan: true }),
    item('Lemonade', { categoryId: 'drinks', price: 90, isVegan: true, isAvailable: false }),
    item('Shopska salad', { description: 'Tomato, cucumber, sirenje', price: 180, isVegetarian: true }),
    item('Pastrmajlija', { description: 'Pork and egg flatbread', price: 350 }),
    item('Ljuti piperki', { price: 150, isSpicy: true, isVegan: true }),
    item('Ќебапи', { price: 250 }),
];

const ids = (list: Item[]) => list.map((i) => i.id);
const run = (patch: Partial<typeof EMPTY_FILTERS>) => ids(filterMenuItems(items, categories, { ...EMPTY_FILTERS, ...patch }));

describe('filterMenuItems', () => {
    it('returns everything with no filters', () => {
        expect(run({})).toHaveLength(items.length);
    });

    it('searches name, description and ingredients, ignoring case and accents', () => {
        expect(run({ query: 'SALAD' })).toEqual(['Shopska salad']);
        expect(run({ query: 'cucumber' })).toEqual(['Shopska salad']);
        expect(run({ query: 'arabica' })).toEqual(['Espresso']);
        expect(run({ query: 'cafe' })).toEqual([]);
        expect(run({ query: 'ÉSPRESSO' })).toEqual(['Espresso']);
    });

    it('matches every word of a multi-word query', () => {
        expect(run({ query: 'egg pork' })).toEqual(['Pastrmajlija']);
        expect(run({ query: 'egg tomato' })).toEqual([]);
    });

    it('searches Cyrillic names case-insensitively', () => {
        expect(run({ query: 'ќебап' })).toEqual(['Ќебапи']);
    });

    it('includes items from subcategories when filtering by a parent category', () => {
        expect(run({ categoryId: 'drinks' })).toEqual(['Espresso', 'Herbal tea', 'Lemonade']);
        expect(run({ categoryId: 'hot' })).toEqual(['Espresso', 'Herbal tea']);
        expect(run({ categoryId: 'coffee' })).toEqual(['Espresso']);
    });

    it('treats vegan items as vegetarian', () => {
        expect(run({ vegetarian: true })).toEqual(['Herbal tea', 'Lemonade', 'Shopska salad', 'Ljuti piperki']);
        expect(run({ vegan: true })).toEqual(['Herbal tea', 'Lemonade', 'Ljuti piperki']);
    });

    it('filters spicy, sold out and max price', () => {
        expect(run({ spicy: true })).toEqual(['Ljuti piperki']);
        expect(run({ hideSoldOut: true })).not.toContain('Lemonade');
        expect(run({ maxPrice: 60 })).toEqual(['Espresso', 'Herbal tea']);
    });

    it('combines filters', () => {
        expect(run({ categoryId: 'drinks', vegan: true, hideSoldOut: true })).toEqual(['Herbal tea']);
    });
});

describe('hasActiveFilters', () => {
    it('ignores whitespace-only queries', () => {
        expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '   ' })).toBe(false);
        expect(hasActiveFilters({ ...EMPTY_FILTERS, maxPrice: 0 })).toBe(true);
    });
});

describe('normalizeSearchText', () => {
    it('collapses whitespace and strips diacritics', () => {
        expect(normalizeSearchText('  Crème   Brûlée ')).toBe('creme brulee');
    });
});
