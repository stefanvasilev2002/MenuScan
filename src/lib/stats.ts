import type { Types } from 'mongoose';
import { Category } from '@/models/Category';
import { MenuItem } from '@/models/MenuItem';
import { Restaurant } from '@/models/Restaurant';

export interface MenuCounts {
    categories: number;
    topLevelCategories: number;
    subcategories: number;
    hiddenCategories: number;
    items: number;
    availableItems: number;
    soldOutItems: number;
    hiddenItems: number;
    itemsWithoutImage: number;
}

export interface OwnerCounts {
    restaurants: number;
    activeRestaurants: number;
    categories: number;
    items: number;
    perRestaurant: Record<string, { categories: number; items: number }>;
}

export async function getMenuCounts(restaurantId: Types.ObjectId): Promise<MenuCounts> {
    const [categoryStats, itemStats] = await Promise.all([
        Category.aggregate<{ total: number; topLevel: number; hidden: number }>([
            { $match: { restaurantId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    topLevel: { $sum: { $cond: [{ $eq: [{ $ifNull: ['$parentId', null] }, null] }, 1, 0] } },
                    hidden: { $sum: { $cond: [{ $eq: ['$isVisible', false] }, 1, 0] } },
                },
            },
        ]),
        MenuItem.aggregate<{ total: number; hidden: number; soldOut: number; noImage: number }>([
            { $match: { restaurantId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    hidden: { $sum: { $cond: [{ $eq: ['$isHidden', true] }, 1, 0] } },
                    soldOut: {
                        $sum: {
                            $cond: [{ $and: [{ $ne: ['$isHidden', true] }, { $eq: ['$isAvailable', false] }] }, 1, 0],
                        },
                    },
                    noImage: { $sum: { $cond: [{ $in: [{ $ifNull: ['$imageUrl', ''] }, ['']] }, 1, 0] } },
                },
            },
        ]),
    ]);

    const c = categoryStats[0] ?? { total: 0, topLevel: 0, hidden: 0 };
    const i = itemStats[0] ?? { total: 0, hidden: 0, soldOut: 0, noImage: 0 };

    return {
        categories: c.total,
        topLevelCategories: c.topLevel,
        subcategories: c.total - c.topLevel,
        hiddenCategories: c.hidden,
        items: i.total,
        availableItems: i.total - i.hidden - i.soldOut,
        soldOutItems: i.soldOut,
        hiddenItems: i.hidden,
        itemsWithoutImage: i.noImage,
    };
}

export async function getOwnerCounts(userId: Types.ObjectId | string): Promise<OwnerCounts> {
    const restaurants = await Restaurant.find({ userId }).select('_id isActive').lean();
    const ids = restaurants.map((r) => r._id);

    const [categoryCounts, itemCounts] = await Promise.all([
        Category.aggregate<{ _id: Types.ObjectId; count: number }>([
            { $match: { restaurantId: { $in: ids } } },
            { $group: { _id: '$restaurantId', count: { $sum: 1 } } },
        ]),
        MenuItem.aggregate<{ _id: Types.ObjectId; count: number }>([
            { $match: { restaurantId: { $in: ids } } },
            { $group: { _id: '$restaurantId', count: { $sum: 1 } } },
        ]),
    ]);

    const perRestaurant: OwnerCounts['perRestaurant'] = {};
    for (const r of restaurants) {
        perRestaurant[String(r._id)] = { categories: 0, items: 0 };
    }
    for (const { _id, count } of categoryCounts) {
        perRestaurant[String(_id)].categories = count;
    }
    for (const { _id, count } of itemCounts) {
        perRestaurant[String(_id)].items = count;
    }

    return {
        restaurants: restaurants.length,
        activeRestaurants: restaurants.filter((r) => r.isActive !== false).length,
        categories: categoryCounts.reduce((sum, c) => sum + c.count, 0),
        items: itemCounts.reduce((sum, c) => sum + c.count, 0),
        perRestaurant,
    };
}
