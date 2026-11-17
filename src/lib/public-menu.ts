import { connectToDatabase } from './db';
import { getVisibleCategoryIds } from './category-tree';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';
import { Restaurant } from '@/models/Restaurant';
import type { Currency } from '@/types/types';

export interface PublicCategory {
    _id: string;
    parentId: string | null;
    name: string;
    description: string;
    icon: string;
    color: string;
    order: number;
}

export interface PublicMenuItem {
    _id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isSpicy: boolean;
    allergens: string[];
    ingredients: string[];
    preparationTime: number | null;
    order: number;
}

export interface PublicMenu {
    restaurant: {
        name: string;
        slug: string;
        description: string;
        currency: Currency;
    };
    categories: PublicCategory[];
    items: PublicMenuItem[];
}

const CURRENCIES: Currency[] = ['MKD', 'EUR', 'USD'];

export async function getPublicMenu(slug: string): Promise<PublicMenu | null> {
    await connectToDatabase();
    const restaurant = await Restaurant.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
    if (!restaurant) {
        return null;
    }

    const [categoryDocs, itemDocs] = await Promise.all([
        Category.find({ restaurantId: restaurant._id }).sort({ order: 1, createdAt: 1 }).lean(),
        MenuItem.find({ restaurantId: restaurant._id }).sort({ order: 1, createdAt: 1 }).lean(),
    ]);

    const allCategories = categoryDocs.map((c) => ({
        _id: String(c._id),
        parentId: c.parentId ? String(c.parentId) : null,
        name: c.name,
        description: c.description ?? '',
        icon: c.icon ?? '',
        color: c.color ?? '#3B82F6',
        order: c.order ?? 0,
        isVisible: c.isVisible !== false,
    }));
    const visibleIds = getVisibleCategoryIds(allCategories);

    const categories: PublicCategory[] = allCategories
        .filter((c) => visibleIds.has(c._id))
        .map((c) => ({
            _id: c._id,
            parentId: c.parentId,
            name: c.name,
            description: c.description,
            icon: c.icon,
            color: c.color,
            order: c.order,
        }));

    const items: PublicMenuItem[] = itemDocs
        .filter((i) => visibleIds.has(String(i.categoryId)))
        .map((i) => ({
            _id: String(i._id),
            categoryId: String(i.categoryId),
            name: i.name,
            description: i.description ?? '',
            price: i.price,
            imageUrl: i.imageUrl ?? '',
            isAvailable: i.isAvailable !== false,
            isVegetarian: Boolean(i.isVegetarian),
            isVegan: Boolean(i.isVegan),
            isSpicy: Boolean(i.isSpicy),
            allergens: i.allergens ?? [],
            ingredients: i.ingredients ?? [],
            preparationTime: i.preparationTime ?? null,
            order: i.order ?? 0,
        }));

    const currency = CURRENCIES.find((c) => c === restaurant.settings?.currency) ?? 'MKD';

    return {
        restaurant: {
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description ?? '',
            currency,
        },
        categories,
        items,
    };
}
