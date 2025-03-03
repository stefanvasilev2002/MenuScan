// components/dashboard/MenuItemsManager.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    price: number;
    category: string;
    isAvailable: boolean;
    order: number;
}

interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    order: number;
}

interface MenuItemsManagerProps {
    menuId: string;
    menuName: string;
    userId: string;
}

export function MenuItemsManager({ menuId, menuName, userId }: MenuItemsManagerProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalItems: 0,
        views: 0,
        scans: 0
    });
    console.log('menuId from menu items manager:', menuId);
    const fetchMenuItems = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/menus/${menuId}/items`);

            if (!response.ok) {
                throw new Error('Failed to fetch menu items');
            }

            const data = await response.json();
            setMenuItems(data);
            setStats(prev => ({ ...prev, totalItems: data.length }));

            // Fetch menu stats
            try {
                const statsResponse = await fetch(`/api/menus/${menuId}/stats`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(prev => ({
                        ...prev,
                        views: statsData.views || 0,
                        scans: statsData.scans || 0
                    }));
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }

            // Fetch categories
            try {
                const categoriesResponse = await fetch(`/api/menus/${menuId}/categories`);
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch menu items');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMenuItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete menu item');
            }

            await fetchMenuItems();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete menu item');
        }
    };

    const toggleItemAvailability = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/menus/${menuId}/items/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAvailable: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update item availability');
            }

            await fetchMenuItems();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update item availability');
        }
    };

    useEffect(() => {
        if (menuId) {
            fetchMenuItems();
        }
    }, [menuId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/dashboard/menus" className="text-blue-500 hover:text-blue-600">
                    ← Back to Menus
                </Link>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{menuName}</h1>
                    <p className="text-gray-500">Manage your menu items and categories</p>
                </div>
                <div className="flex space-x-4">
                    <Link
                        href={menuId ? `/dashboard/menu/${menuId}/qr` : '/dashboard'}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                        <span className="mr-2">📱</span>
                        QR Код
                    </Link>
                    <Link
                        href={`/dashboard/menus/${menuId}/categories`}
                        className="bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg border"
                    >
                        Manage Categories
                    </Link>
                    <Link
                        href={`/dashboard/menus/${menuId}/items/new`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                        <span className="mr-2">+</span>
                        Add Item
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Today's Views</h3>
                    <p className="text-3xl font-bold mt-2">{stats.views}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Total Items</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalItems}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">QR Scans</h3>
                    <p className="text-3xl font-bold mt-2">{stats.scans}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Menu Items</h2>
                </div>

                <div className="p-6">
                    {menuItems.length > 0 ? (
                        <div className="space-y-4">
                            {menuItems.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">{item.nameMK}</h3>
                                        <p className="text-sm text-gray-500">{item.category}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold">{item.price} ден.</span>
                                        <button
                                            onClick={() => toggleItemAvailability(item._id, item.isAvailable)}
                                            className={`px-3 py-1 rounded text-sm ${
                                                item.isAvailable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </button>
                                        <Link
                                            href={`/dashboard/menus/${menuId}/items/${item._id}/edit`}
                                            className="text-blue-500 hover:text-blue-600 p-2"
                                        >
                                            ✏️
                                        </Link>
                                        <button
                                            onClick={() => deleteMenuItem(item._id)}
                                            className="text-red-500 hover:text-red-600 p-2"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">You haven't added any items to this menu yet</p>
                            <Link
                                href={`/dashboard/menus/${menuId}/items/new`}
                                className="text-blue-500 hover:text-blue-600"
                            >
                                Add your first item
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}