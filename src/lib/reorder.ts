export type MoveDirection = 'up' | 'down';

export function moveId(ids: string[], id: string, direction: MoveDirection): string[] | null {
    const index = ids.indexOf(id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || target < 0 || target >= ids.length) {
        return null;
    }
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

export function sameMembers(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
        return false;
    }
    const set = new Set(a);
    return set.size === a.length && new Set(b).size === b.length && b.every((id) => set.has(id));
}

export function applyOrder<T extends { _id: string; order: number }>(records: T[], orderedIds: string[]): T[] {
    const position = new Map(orderedIds.map((id, index) => [id, index + 1]));
    return records.map((record) => (position.has(record._id) ? { ...record, order: position.get(record._id)! } : record));
}
