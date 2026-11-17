import { describe, expect, it } from 'vitest';
import { copyName, MAX_ITEM_NAME_LENGTH } from '@/lib/duplicate';

describe('copyName', () => {
    it('appends (copy) when free', () => {
        expect(copyName('Burek', ['Burek'])).toBe('Burek (copy)');
    });

    it('numbers further copies, case-insensitively', () => {
        expect(copyName('Burek', ['Burek', 'burek (COPY)'])).toBe('Burek (copy 2)');
        expect(copyName('Burek', ['Burek', 'Burek (copy)', 'Burek (copy 2)'])).toBe('Burek (copy 3)');
    });

    it('does not stack suffixes when copying a copy', () => {
        expect(copyName('Burek (copy)', ['Burek', 'Burek (copy)'])).toBe('Burek (copy 2)');
        expect(copyName('Burek (copy 2)', ['Burek', 'Burek (copy)', 'Burek (copy 2)'])).toBe('Burek (copy 3)');
    });

    it('stays within the maximum name length', () => {
        const long = 'x'.repeat(MAX_ITEM_NAME_LENGTH);
        const result = copyName(long, [long]);
        expect(result.length).toBeLessThanOrEqual(MAX_ITEM_NAME_LENGTH);
        expect(result.endsWith(' (copy)')).toBe(true);
    });
});
