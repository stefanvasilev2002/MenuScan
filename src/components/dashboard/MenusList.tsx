// components/dashboard/MenusList.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Menu {
    _id: string;
    name: string;
    isActive: boolean;
    stats: {
        views: number;
        scans: number;
    };
    createdAt: string;
}

export function MenusList() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMenus = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/menus');
            if (!response.ok) {
                throw new Error('Failed to fetch menus');
            }
            const data = await response.json();
            setMenus(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch menus');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMenu = async (id: string) => {
        if (!confirm('Are you sure you want to delete this menu?')) {
            return;
        }

        try {
            const response = await fetch(`/api/menus/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete menu');
            }

            await fetchMenus();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete menu');
        }
    };

    const toggleMenuStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/menus/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update menu status');
            }

            await fetchMenus();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update menu status');
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Your Menus</h1>
                <Link
                    href="/dashboard/menus/new"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <span className="mr-2">+</span>
                    Create New Menu
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid gap-6">
                {menus.length > 0 ? (
                    menus.map((menu) => (
                        <div
                            key={menu._id}
                            className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
                        >
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{menu.name}</h3>
                                <div className="text-sm text-gray-500 space-x-4">
                                    <span>{menu.stats.views} views</span>
                                    <span>{menu.stats.scans} scans</span>
                                    <span>{new Date(menu.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => toggleMenuStatus(menu._id, menu.isActive)}
                                    className={`px-4 py-2 rounded-lg border ${
                                        menu.isActive
                                            ? 'border-gray-200 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {menu.isActive ? 'Active' : 'Inactive'}
                                </button>

                                <Link
                                    href={`/dashboard/menus/${menu._id}/items`}
                                    className="text-blue-500 hover:text-blue-600 p-2"
                                >
                                    View Items
                                </Link>

                                <Link
                                    href={`/dashboard/menus/${menu._id}/edit`}
                                    className="text-blue-500 hover:text-blue-600 p-2"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={menu._id ? `/dashboard/menu/${menu._id}/qr` : '/dashboard'}
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
                                    <span className="mr-2">📱</span>
                                    QR Код
                                </Link>
                                <button
                                    onClick={() => deleteMenu(menu._id)}
                                    className="text-red-500 hover:text-red-600 p-2"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">You haven't created any menus yet</p>
                        <Link
                            href="/dashboard/menus/new"
                            className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
                        >
                            Create your first menu
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}