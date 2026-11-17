'use client';

import type { RestaurantData } from '@/types/restaurant';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest, errorMessage } from '@/lib/client-api';
import { getDescendantIds } from '@/lib/category-tree';
import CategoryManager from './menu/CategoryManager';
import MenuItemManager from './menu/MenuItemManager';
import { Category, MenuItem } from '@/types/menu';


interface MenuBuilderProps {
    restaurant: RestaurantData;
}

export default function MenuBuilder({ restaurant }: MenuBuilderProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenuData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [categoriesData, itemsData] = await Promise.all([
                apiRequest<Category[]>(`/api/restaurant/${restaurant.slug}/categories`),
                apiRequest<MenuItem[]>(`/api/restaurant/${restaurant.slug}/menu-items`),
            ]);
            setCategories(categoriesData);
            setMenuItems(itemsData);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [restaurant.slug]);

    useEffect(() => {
        fetchMenuData();
    }, [fetchMenuData]);

    const handleCategoryCreated = (newCategory: Category) => {
        setCategories(prev => [...prev, newCategory]);
    };

    const handleCategoryUpdated = (updatedCategory: Category) => {
        setCategories(prev => prev.map(cat =>
            cat._id === updatedCategory._id ? updatedCategory : cat
        ));
    };

    const handleCategoryDeleted = (categoryId: string) => {
        const removed = new Set([categoryId, ...getDescendantIds(categories, categoryId)]);
        setCategories(prev => prev.filter(cat => !removed.has(cat._id)));
        setMenuItems(prev => prev.filter(item => !removed.has(item.categoryId)));
        if (selectedCategory && removed.has(selectedCategory)) {
            setSelectedCategory(null);
        }
    };

    const handleMenuItemCreated = (newItem: MenuItem) => {
        setMenuItems(prev => [...prev, newItem]);
    };

    const handleMenuItemUpdated = (updatedItem: MenuItem) => {
        setMenuItems(prev => prev.map(item =>
            item._id === updatedItem._id ? updatedItem : item
        ));
    };

    const handleCategoriesReordered = (updated: Category[]) => {
        setCategories(updated);
    };

    const handleMenuItemsChanged = (updated: MenuItem[]) => {
        const byId = new Map(updated.map(item => [item._id, item]));
        setMenuItems(prev => {
            const known = new Set(prev.map(item => item._id));
            return [...prev.map(item => byId.get(item._id) ?? item), ...updated.filter(item => !known.has(item._id))];
        });
    };

    const handleMenuItemDeleted = (itemId: string) => {
        setMenuItems(prev => prev.filter(item => item._id !== itemId));
    };

    const filteredMenuItems = selectedCategory
        ? menuItems.filter(item => item.categoryId === selectedCategory)
        : menuItems;

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Menu Builder</h3>
                    <p className="text-gray-600">Setting up your menu management tools...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="mx-auto h-16 w-16 text-red-400 mb-6">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Menu Data</h3>
                    <p className="text-sm text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchMenuData}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Menu Builder</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Organize your menu with categories and items for {restaurant.name}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span>{categories.length} Categories</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                <span>{menuItems.length} Menu Items</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-80 flex-shrink-0">
                    <CategoryManager
                        restaurantSlug={restaurant.slug}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                        onCategoryCreated={handleCategoryCreated}
                        onCategoryUpdated={handleCategoryUpdated}
                        onCategoryDeleted={handleCategoryDeleted}
                        onCategoriesReordered={handleCategoriesReordered}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <MenuItemManager
                        restaurantSlug={restaurant.slug}
                        currency={restaurant.currency}
                        categories={categories}
                        menuItems={filteredMenuItems}
                        selectedCategory={selectedCategory}
                        onMenuItemCreated={handleMenuItemCreated}
                        onMenuItemUpdated={handleMenuItemUpdated}
                        onMenuItemDeleted={handleMenuItemDeleted}
                        onMenuItemsChanged={handleMenuItemsChanged}
                    />
                </div>
            </div>
        </div>
    );
}