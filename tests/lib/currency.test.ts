import { describe, expect, it } from 'vitest';
import { convertPrice, formatConverted, formatPrice } from '@/lib/currency';

describe('convertPrice', () => {
    it('returns the same amount for the same currency', () => {
        expect(convertPrice(120, 'EUR', 'EUR')).toBe(120);
    });

    it('converts from MKD using the configured rates', () => {
        expect(convertPrice(1000, 'MKD', 'EUR')).toBeCloseTo(16);
    });

    it('converts from a non-MKD base currency', () => {
        expect(convertPrice(16, 'EUR', 'MKD')).toBeCloseTo(1000);
        expect(convertPrice(16, 'EUR', 'USD')).toBeCloseTo(18);
    });
});

describe('formatPrice', () => {
    it('formats MKD without decimals and with a trailing symbol', () => {
        expect(formatPrice(349.6, 'MKD')).toBe('350 ден.');
    });

    it('formats EUR and USD with two decimals and a leading symbol', () => {
        expect(formatPrice(5.5, 'EUR')).toBe('€5.50');
        expect(formatPrice(5, 'USD')).toBe('$5.00');
    });

    it('renders a dash for invalid amounts', () => {
        expect(formatPrice(Number.NaN, 'EUR')).toBe('—');
        expect(formatPrice(-1, 'EUR')).toBe('—');
    });
});

describe('formatConverted', () => {
    it('converts and formats in one step', () => {
        expect(formatConverted(500, 'MKD', 'EUR')).toBe('€8.00');
    });
});
