import { describe, expect, it } from 'vitest';
import { availabilityOf, availabilityPatch, AVAILABILITY_STATUSES } from '@/lib/availability';

describe('availability', () => {
    it('derives the status from the stored flags', () => {
        expect(availabilityOf({ isAvailable: true, isHidden: false })).toBe('available');
        expect(availabilityOf({ isAvailable: false, isHidden: false })).toBe('sold_out');
        expect(availabilityOf({ isAvailable: false, isHidden: true })).toBe('hidden');
        expect(availabilityOf({})).toBe('available');
    });

    it('round-trips every status through the patch', () => {
        for (const status of AVAILABILITY_STATUSES) {
            expect(availabilityOf(availabilityPatch(status))).toBe(status);
        }
    });
});
