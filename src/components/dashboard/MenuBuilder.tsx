'use client';

import { useState, useEffect } from 'react';
import CategoryManager from './menu/CategoryManager';
import MenuItemManager from './menu/MenuItemManager';
import { Category, MenuItem } from '@/types/menu';

interface RestaurantData {
    _id: string;
    name: string;
    slug: string;
    userId: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    isActive: boolean;
    settings: {
        currency: string;
        timezone: string;
        orderNumberPrefix: string;
        autoAcceptOrders: boolean;
        takeoutEnabled: boolean;
        deliveryEnabled: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

interface MenuBuilderProps {
    restaurant: RestaurantData;
}

export default function MenuBuilder({ restaurant }: MenuBuilderProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMenuData();
    }, [restaurant._id]);

    const fetchMenuData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch categories
            const categoriesResponse = await fetch(`/api/restaurant/${restaurant.slug}/categories`);
            if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
            const categoriesData = await categoriesResponse.json();

            // Fetch menu items
            const itemsResponse = await fetch(`/api/restaurant/${restaurant.slug}/menu-items`);
            if (!itemsResponse.ok) throw new Error('Failed to fetch menu items');
            const itemsData = await itemsResponse.json();

            setCategories(categoriesData);
            setMenuItems(itemsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryCreated = (newCategory: Category) => {
        setCategories(prev => [...prev, newCategory]);
    };

    const handleCategoryUpdated = (updatedCategory: Category) => {
        setCategories(prev => prev.map(cat => 
            cat._id === updatedCategory._id ? updatedCategory : cat
        ));
    };

    const handleCategoryDeleted = (categoryId: string) => {
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));
        setMenuItems(prev => prev.filter(item => item.categoryId !== categoryId));
        if (selectedCategory === categoryId) {
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-red-800">Error loading menu data</h3>
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchMenuData}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Categories Panel */}
                <div className="xl:col-span-1">
                    <CategoryManager
                        restaurantSlug={restaurant.slug}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategorySelect={setSelectedCategory}
                        onCategoryCreated={handleCategoryCreated}
                        onCategoryUpdated={handleCategoryUpdated}
                        onCategoryDeleted={handleCategoryDeleted}
                    />
                </div>

                {/* Menu Items Panel */}
                <div className="xl:col-span-3">
                    <MenuItemManager
                        restaurantSlug={restaurant.slug}
                        categories={categories}
                        menuItems={filteredMenuItems}
                        selectedCategory={selectedCategory}
                        onMenuItemCreated={handleMenuItemCreated}
                        onMenuItemUpdated={handleMenuItemUpdated}
                        onMenuItemDeleted={handleMenuItemDeleted}
                    />
                </div>
            </div>
        </div>
    );
} 