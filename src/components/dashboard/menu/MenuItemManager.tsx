'use client';

import { useState } from 'react';
import { Category, MenuItem } from '@/types/menu';
import { apiRequest, errorMessage } from '@/lib/client-api';
import type { MenuItemCreateInput } from '@/lib/validation';
import MenuItemForm from './MenuItemForm';
import MenuItemCard from './MenuItemCard';

interface MenuItemManagerProps {
    restaurantSlug: string;
    categories: Category[];
    menuItems: MenuItem[];
    selectedCategory: string | null;
    onMenuItemCreated: (item: MenuItem) => void;
    onMenuItemUpdated: (item: MenuItem) => void;
    onMenuItemDeleted: (itemId: string) => void;
}

export default function MenuItemManager({
    restaurantSlug,
    categories,
    menuItems,
    selectedCategory,
    onMenuItemCreated,
    onMenuItemUpdated,
    onMenuItemDeleted
}: MenuItemManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const baseUrl = `/api/restaurant/${restaurantSlug}/menu-items`;

    const run = async (action: () => Promise<void>) => {
        setError(null);
        try {
            await action();
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    const handleCreateMenuItem = (data: MenuItemCreateInput) => run(async () => {
        const newItem = await apiRequest<MenuItem>(baseUrl, { method: 'POST', body: JSON.stringify(data) });
        onMenuItemCreated(newItem);
        setIsCreating(false);
    });

    const handleUpdateMenuItem = (itemId: string, data: Partial<MenuItemCreateInput>) => run(async () => {
        const updatedItem = await apiRequest<MenuItem>(`${baseUrl}/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
        onMenuItemUpdated(updatedItem);
        setEditingItem(null);
    });

    const handleDeleteMenuItem = (itemId: string) => {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }
        return run(async () => {
            await apiRequest(`${baseUrl}/${itemId}`, { method: 'DELETE' });
            onMenuItemDeleted(itemId);
        });
    };

    const handleToggleAvailability = (itemId: string, isAvailable: boolean) => run(async () => {
        const updatedItem = await apiRequest<MenuItem>(`${baseUrl}/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ isAvailable }),
        });
        onMenuItemUpdated(updatedItem);
    });

    const selectedCategoryName = selectedCategory 
        ? categories.find(cat => cat._id === selectedCategory)?.name 
        : null;

    const sortedMenuItems = [...menuItems].sort((a, b) => a.order - b.order);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedCategoryName 
                                ? `Items in "${selectedCategoryName}"` 
                                : 'All menu items'
                            }
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        {selectedCategory && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Item
                            </button>
                        )}
                        {!selectedCategory && (
                            <div className="text-sm text-gray-500">
                                Select a category to add items
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {error && (
                    <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {isCreating && (
                    <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                        <MenuItemForm
                            categories={categories}
                            selectedCategoryId={selectedCategory}
                            onSubmit={handleCreateMenuItem}
                            onCancel={() => setIsCreating(false)}
                            submitLabel="Create Menu Item"
                        />
                    </div>
                )}

                {editingItem && (
                    <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <MenuItemForm
                            key={editingItem._id}
                            item={editingItem}
                            categories={categories}
                            onSubmit={(data) => handleUpdateMenuItem(editingItem._id, data)}
                            onCancel={() => setEditingItem(null)}
                            submitLabel="Update Menu Item"
                        />
                    </div>
                )}

                <div className="space-y-4">
                    {sortedMenuItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto h-20 w-20 text-gray-300 mb-6">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {selectedCategoryName 
                                    ? `No items in "${selectedCategoryName}"` 
                                    : 'No menu items yet'
                                }
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {selectedCategoryName 
                                    ? 'Start building your menu by adding items to this category.'
                                    : 'Create categories first, then add menu items to organize your menu.'
                                }
                            </p>
                            {selectedCategory && (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add First Item
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sortedMenuItems.map((item) => (
                                <MenuItemCard
                                    key={item._id}
                                    item={item}
                                    category={categories.find(cat => cat._id === item.categoryId)}
                                    onEdit={() => setEditingItem(item)}
                                    onDelete={() => handleDeleteMenuItem(item._id)}
                                    onToggleAvailability={() => handleToggleAvailability(item._id, !item.isAvailable)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 