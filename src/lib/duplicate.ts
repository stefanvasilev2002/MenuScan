export const MAX_ITEM_NAME_LENGTH = 100;

const COPY_SUFFIX = /\s\(copy(?:\s(\d+))?\)$/i;

export function copyName(name: string, existingNames: string[]): string {
    const base = name.replace(COPY_SUFFIX, '').trim();
    const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));

    for (let n = 1; ; n++) {
        const suffix = n === 1 ? ' (copy)' : ` (copy ${n})`;
        const candidate = `${base.slice(0, MAX_ITEM_NAME_LENGTH - suffix.length).trimEnd()}${suffix}`;
        if (!taken.has(candidate.toLowerCase())) {
            return candidate;
        }
    }
}
