import { getDescendantIds, type TreeCategory } from './category-tree';

export interface FilterableItem {
    name: string;
    description: string;
    ingredients: string[];
    categoryId: string;
    price: number;
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isSpicy: boolean;
}

export interface MenuFilters {
    query: string;
    categoryId: string | null;
    vegetarian: boolean;
    vegan: boolean;
    spicy: boolean;
    hideSoldOut: boolean;
    maxPrice: number | null;
}

export const EMPTY_FILTERS: MenuFilters = {
    query: '',
    categoryId: null,
    vegetarian: false,
    vegan: false,
    spicy: false,
    hideSoldOut: false,
    maxPrice: null,
};

export function normalizeSearchText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function hasActiveFilters(filters: MenuFilters): boolean {
    return (
        normalizeSearchText(filters.query) !== '' ||
        filters.categoryId !== null ||
        filters.vegetarian ||
        filters.vegan ||
        filters.spicy ||
        filters.hideSoldOut ||
        filters.maxPrice !== null
    );
}

export function filterMenuItems<T extends FilterableItem>(items: T[], categories: TreeCategory[], filters: MenuFilters): T[] {
    const terms = normalizeSearchText(filters.query).split(' ').filter(Boolean);
    const allowedCategories = filters.categoryId
        ? new Set([filters.categoryId, ...getDescendantIds(categories, filters.categoryId)])
        : null;

    return items.filter((item) => {
        if (allowedCategories && !allowedCategories.has(item.categoryId)) {
            return false;
        }
        if (filters.vegan && !item.isVegan) {
            return false;
        }
        if (filters.vegetarian && !(item.isVegetarian || item.isVegan)) {
            return false;
        }
        if (filters.spicy && !item.isSpicy) {
            return false;
        }
        if (filters.hideSoldOut && !item.isAvailable) {
            return false;
        }
        if (filters.maxPrice !== null && item.price > filters.maxPrice) {
            return false;
        }
        if (terms.length > 0) {
            const haystack = normalizeSearchText([item.name, item.description, ...item.ingredients].join(' '));
            return terms.every((term) => haystack.includes(term));
        }
        return true;
    });
}
