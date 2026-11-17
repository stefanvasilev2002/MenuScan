import { describe, expect, it } from 'vitest';
import {
    buildCategoryTree,
    flattenCategoryTree,
    getDepth,
    getDescendantIds,
    getVisibleCategoryIds,
    MAX_CATEGORY_DEPTH,
    validateParent,
} from '@/lib/category-tree';

const cat = (id: string, parentId: string | null = null, order = 0, isVisible = true) => ({
    _id: id,
    parentId,
    order,
    name: id,
    isVisible,
});

const drinks = [
    cat('drinks', null, 2),
    cat('food', null, 1),
    cat('hot', 'drinks', 2),
    cat('cold', 'drinks', 1),
    cat('coffee', 'hot', 1),
];

describe('buildCategoryTree', () => {
    it('nests children under their parents and sorts every level by order', () => {
        const tree = buildCategoryTree(drinks);
        expect(tree.map((n) => n._id)).toEqual(['food', 'drinks']);
        expect(tree[1].children.map((n) => n._id)).toEqual(['cold', 'hot']);
        expect(tree[1].children[1].children.map((n) => n._id)).toEqual(['coffee']);
    });

    it('treats categories with a missing parent as roots instead of dropping them', () => {
        const tree = buildCategoryTree([cat('orphan', 'deleted-parent'), cat('root')]);
        expect(tree.map((n) => n._id).sort()).toEqual(['orphan', 'root']);
    });

    it('does not mutate the input', () => {
        const input = [cat('a'), cat('b', 'a')];
        buildCategoryTree(input);
        expect(input[0]).not.toHaveProperty('children');
    });
});

describe('flattenCategoryTree', () => {
    it('returns depth-first order with depth information', () => {
        const flat = flattenCategoryTree(buildCategoryTree(drinks));
        expect(flat.map(({ category, depth }) => `${depth}:${category._id}`)).toEqual([
            '0:food',
            '0:drinks',
            '1:cold',
            '1:hot',
            '2:coffee',
        ]);
    });
});

describe('getDescendantIds', () => {
    it('collects all nested descendants', () => {
        expect(getDescendantIds(drinks, 'drinks').sort()).toEqual(['coffee', 'cold', 'hot']);
        expect(getDescendantIds(drinks, 'coffee')).toEqual([]);
    });

    it('terminates on corrupted cyclic data', () => {
        const cyclic = [cat('a', 'b'), cat('b', 'a')];
        expect(getDescendantIds(cyclic, 'a')).toEqual(['b']);
    });
});

describe('getDepth', () => {
    it('counts the levels from the root', () => {
        expect(getDepth(drinks, 'drinks')).toBe(1);
        expect(getDepth(drinks, 'coffee')).toBe(3);
        expect(getDepth(drinks, null)).toBe(0);
    });
});

describe('validateParent', () => {
    it('accepts top-level categories and valid parents', () => {
        expect(validateParent(drinks, null, null)).toEqual({ ok: true });
        expect(validateParent(drinks, null, 'drinks')).toEqual({ ok: true });
        expect(validateParent(drinks, 'cold', 'food')).toEqual({ ok: true });
    });

    it('rejects unknown parents', () => {
        expect(validateParent(drinks, null, 'missing')).toMatchObject({ ok: false, reason: 'Parent category not found' });
    });

    it('rejects making a category its own parent', () => {
        expect(validateParent(drinks, 'hot', 'hot')).toMatchObject({ ok: false });
    });

    it('rejects moving a category inside its own subtree', () => {
        expect(validateParent(drinks, 'drinks', 'coffee')).toMatchObject({
            ok: false,
            reason: expect.stringContaining('subcategories'),
        });
    });

    it(`rejects nesting deeper than ${MAX_CATEGORY_DEPTH} levels`, () => {
        expect(validateParent(drinks, null, 'coffee')).toMatchObject({ ok: false, reason: expect.stringContaining('3 levels') });
        expect(validateParent(drinks, 'hot', 'cold')).toMatchObject({ ok: false });
        expect(validateParent(drinks, 'coffee', 'cold')).toEqual({ ok: true });
    });
});

describe('getVisibleCategoryIds', () => {
    it('hides categories whose ancestor is hidden', () => {
        const categories = [cat('drinks', null, 1, false), cat('hot', 'drinks'), cat('food'), cat('salads', 'food')];
        expect([...getVisibleCategoryIds(categories)].sort()).toEqual(['food', 'salads']);
    });

    it('hides categories whose parent no longer exists', () => {
        expect([...getVisibleCategoryIds([cat('orphan', 'gone')])]).toEqual([]);
    });
});
