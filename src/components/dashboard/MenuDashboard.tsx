'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    price: number;
    category: string;
}

export function MenuDashboard() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        views: 0,
        scans: 0
    });

    const fetchMenuItems = async () => {
        try {
            const response = await fetch('/api/menu');
            const data = await response.json();
            setMenuItems(data);
            setStats(prev => ({ ...prev, totalItems: data.length }));
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const deleteMenuItem = async (id: string) => {
        if (!confirm('Дали сте сигурни дека сакате да го избришете овој продукт?')) {
            return;
        }

        try {
            const response = await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMenuItems();
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Вашето Мени</h1>
                <Link
                    href="/dashboard/new"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <span className="mr-2">+</span>
                    Додади Продукт
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Денешни Прегледи</h3>
                    <p className="text-3xl font-bold mt-2">{stats.views}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Вкупно Продукти</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalItems}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">QR Скенирања</h3>
                    <p className="text-3xl font-bold mt-2">{stats.scans}</p>
                </div>

                <div className="col-span-full bg-white rounded-lg shadow-sm mt-6">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Мени Продукти</h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {menuItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold">{item.nameMK}</h3>
                                    <p className="text-sm text-gray-500">{item.category}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="font-bold">{item.price} ден.</span>
                                    <Link
                                        href={`/dashboard/edit/${item._id}`}
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

                        {menuItems.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Сѐ уште немате додадено продукти во менито
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}