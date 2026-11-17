export const MAX_CATEGORY_DEPTH = 3;

export interface TreeCategory {
    _id: string;
    parentId?: string | null;
    order: number;
    name: string;
}

export type CategoryNode<T extends TreeCategory> = T & { children: CategoryNode<T>[] };

const byOrder = <T extends TreeCategory>(a: T, b: T) => a.order - b.order || a.name.localeCompare(b.name);

export function buildCategoryTree<T extends TreeCategory>(categories: T[]): CategoryNode<T>[] {
    const nodes = new Map<string, CategoryNode<T>>();
    for (const category of categories) {
        nodes.set(category._id, { ...category, children: [] });
    }

    const roots: CategoryNode<T>[] = [];
    for (const node of nodes.values()) {
        const parent = node.parentId ? nodes.get(node.parentId) : undefined;
        if (parent && parent._id !== node._id) {
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    }

    const sort = (list: CategoryNode<T>[]) => {
        list.sort(byOrder);
        list.forEach((n) => sort(n.children));
    };
    sort(roots);
    return roots;
}

export function flattenCategoryTree<T extends TreeCategory>(
    tree: CategoryNode<T>[],
    depth = 0,
): Array<{ category: CategoryNode<T>; depth: number }> {
    return tree.flatMap((node) => [{ category: node, depth }, ...flattenCategoryTree(node.children, depth + 1)]);
}

export function getDescendantIds(categories: TreeCategory[], rootId: string): string[] {
    const childrenOf = new Map<string, string[]>();
    for (const c of categories) {
        if (c.parentId) {
            childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c._id]);
        }
    }

    const result: string[] = [];
    const seen = new Set<string>([rootId]);
    const stack = [...(childrenOf.get(rootId) ?? [])];
    while (stack.length > 0) {
        const id = stack.pop()!;
        if (seen.has(id)) {
            continue;
        }
        seen.add(id);
        result.push(id);
        stack.push(...(childrenOf.get(id) ?? []));
    }
    return result;
}

export function getDepth(categories: TreeCategory[], id: string | null | undefined): number {
    const byId = new Map(categories.map((c) => [c._id, c]));
    let depth = 0;
    const seen = new Set<string>();
    let current = id ? byId.get(id) : undefined;
    while (current && !seen.has(current._id)) {
        seen.add(current._id);
        depth++;
        current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return depth;
}

function subtreeHeight(categories: TreeCategory[], id: string): number {
    const children = categories.filter((c) => c.parentId === id);
    if (children.length === 0) {
        return 1;
    }
    return 1 + Math.max(...children.map((c) => subtreeHeight(categories, c._id)));
}

export function getVisibleCategoryIds<T extends TreeCategory & { isVisible: boolean }>(categories: T[]): Set<string> {
    const byId = new Map(categories.map((c) => [c._id, c]));
    const memo = new Map<string, boolean>();

    const isVisible = (id: string, seen: Set<string>): boolean => {
        const cached = memo.get(id);
        if (cached !== undefined) {
            return cached;
        }
        const category = byId.get(id);
        if (!category || !category.isVisible || seen.has(id)) {
            memo.set(id, false);
            return false;
        }
        seen.add(id);
        const parentVisible = category.parentId ? byId.has(category.parentId) && isVisible(category.parentId, seen) : true;
        memo.set(id, parentVisible);
        return parentVisible;
    };

    return new Set(categories.filter((c) => isVisible(c._id, new Set())).map((c) => c._id));
}

export type ParentValidation = { ok: true } | { ok: false; reason: string };

export function validateParent(
    categories: TreeCategory[],
    categoryId: string | null,
    parentId: string | null | undefined,
): ParentValidation {
    if (!parentId) {
        return { ok: true };
    }
    if (!categories.some((c) => c._id === parentId)) {
        return { ok: false, reason: 'Parent category not found' };
    }
    if (categoryId && parentId === categoryId) {
        return { ok: false, reason: 'A category cannot be its own parent' };
    }
    if (categoryId && getDescendantIds(categories, categoryId).includes(parentId)) {
        return { ok: false, reason: 'A category cannot be moved inside one of its subcategories' };
    }

    const height = categoryId ? subtreeHeight(categories, categoryId) : 1;
    if (getDepth(categories, parentId) + height > MAX_CATEGORY_DEPTH) {
        return { ok: false, reason: `Categories can be nested at most ${MAX_CATEGORY_DEPTH} levels deep` };
    }
    return { ok: true };
}
