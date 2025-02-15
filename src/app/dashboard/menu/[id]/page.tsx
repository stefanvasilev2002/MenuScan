'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, QrCode, Settings } from 'lucide-react';
import Link from 'next/link';

interface Menu {
    _id: string;
    name: string;
    isActive: boolean;
    qrCodeUrl?: string;
    createdAt: string;
}

export default function MenuList() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMenuName, setNewMenuName] = useState('');

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await fetch('/api/menus');
            if (!response.ok) throw new Error('Failed to fetch menus');
            const data = await response.json();
            setMenus(data);
        } catch (error) {
            setError('Failed to load menus');
        } finally {
            setIsLoading(false);
        }
    };

    const createMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/menus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newMenuName }),
            });

            if (!response.ok) throw new Error('Failed to create menu');

            const newMenu = await response.json();
            setMenus([...menus, newMenu]);
            setShowCreateModal(false);
            setNewMenuName('');
        } catch (error) {
            setError('Failed to create menu');
        }
    };

    const deleteMenu = async (menuId: string) => {
        if (!confirm('Are you sure you want to delete this menu?')) return;

        try {
            const response = await fetch(`/api/menus/${menuId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete menu');
            setMenus(menus.filter(menu => menu._id !== menuId));
        } catch (error) {
            setError('Failed to delete menu');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Menus</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Create New Menu
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((menu) => (
                    <div key={menu._id} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{menu.name}</h3>
                                <p className="text-sm text-gray-500">
                                    Created: {new Date(menu.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard/menu/${menu._id}/edit`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => deleteMenu(menu._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href={`/dashboard/menu/${menu._id}/items`}
                                className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                                <Settings className="w-4 h-4" />
                                Manage Items
                            </Link>
                            <Link
                                href={`/dashboard/menu/${menu._id}/qr`}
                                className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                                <QrCode className="w-4 h-4" />
                                View QR Code
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Menu Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Menu</h2>
                        <form onSubmit={createMenu} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menu Name
                                </label>
                                <input
                                    type="text"
                                    value={newMenuName}
                                    onChange={(e) => setNewMenuName(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter menu name"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Menu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {menus.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't created any menus yet</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Create Your First Menu
                    </button>
                </div>
            )}
        </div>
    );
}