import { describe, expect, it } from 'vitest';
import { applyOrder, moveId, sameMembers } from '@/lib/reorder';

describe('moveId', () => {
    it('swaps with the neighbour in the given direction', () => {
        expect(moveId(['a', 'b', 'c'], 'b', 'up')).toEqual(['b', 'a', 'c']);
        expect(moveId(['a', 'b', 'c'], 'b', 'down')).toEqual(['a', 'c', 'b']);
    });

    it('returns null at the edges or for unknown ids', () => {
        expect(moveId(['a', 'b'], 'a', 'up')).toBeNull();
        expect(moveId(['a', 'b'], 'b', 'down')).toBeNull();
        expect(moveId(['a', 'b'], 'x', 'up')).toBeNull();
    });

    it('does not mutate the input', () => {
        const ids = ['a', 'b'];
        moveId(ids, 'b', 'up');
        expect(ids).toEqual(['a', 'b']);
    });
});

describe('sameMembers', () => {
    it('compares as sets of unique ids', () => {
        expect(sameMembers(['a', 'b'], ['b', 'a'])).toBe(true);
        expect(sameMembers(['a', 'b'], ['a', 'a'])).toBe(false);
        expect(sameMembers(['a', 'b'], ['a'])).toBe(false);
        expect(sameMembers(['a', 'b'], ['a', 'c'])).toBe(false);
    });
});

describe('applyOrder', () => {
    it('assigns 1-based positions to listed records only', () => {
        const records = [
            { _id: 'a', order: 1 },
            { _id: 'b', order: 2 },
            { _id: 'z', order: 9 },
        ];
        expect(applyOrder(records, ['b', 'a'])).toEqual([
            { _id: 'a', order: 2 },
            { _id: 'b', order: 1 },
            { _id: 'z', order: 9 },
        ]);
    });
});
