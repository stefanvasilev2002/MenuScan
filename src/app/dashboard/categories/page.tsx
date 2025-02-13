'use client';

import { useState, useEffect } from 'react';

interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState({
        nameMK: '',
        nameEN: '',
    });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (response.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const isEditing = !!editingCategory;
        const url = isEditing
            ? `/api/categories/${editingCategory._id}`
            : '/api/categories';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isEditing ? editingCategory : newCategory),
            });

            if (response.ok) {
                if (isEditing) {
                    setEditingCategory(null);
                } else {
                    setNewCategory({ nameMK: '', nameEN: '' });
                }
                fetchCategories();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to save category');
            }
        } catch (error) {
            setError('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Дали сте сигурни дека сакате да ја избришете оваа категорија?')) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchCategories();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete category');
            }
        } catch (error) {
            setError('Failed to delete category');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Управувај со Категории</h1>

            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow-sm max-w-2xl mb-8">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Име (Македонски)
                        </label>
                        <input
                            type="text"
                            value={editingCategory ? editingCategory.nameMK : newCategory.nameMK}
                            onChange={(e) => editingCategory
                                ? setEditingCategory({ ...editingCategory, nameMK: e.target.value })
                                : setNewCategory({ ...newCategory, nameMK: e.target.value })
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name (English)
                        </label>
                        <input
                            type="text"
                            value={editingCategory ? editingCategory.nameEN : newCategory.nameEN}
                            onChange={(e) => editingCategory
                                ? setEditingCategory({ ...editingCategory, nameEN: e.target.value })
                                : setNewCategory({ ...newCategory, nameEN: e.target.value })
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 ${
                                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white py-2 px-4 rounded-lg`}
                        >
                            {loading ? 'Се зачувува...' : editingCategory ? 'Зачувај Промени' : 'Додади Категорија'}
                        </button>

                        {editingCategory && (
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
                            >
                                Откажи
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Сите Категории</h2>

                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div>
                                    <h3 className="font-medium">{category.nameMK}</h3>
                                    <p className="text-sm text-gray-500">{category.nameEN}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingCategory(category)}
                                        className="text-blue-500 hover:text-blue-600 p-2"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="text-red-500 hover:text-red-600 p-2"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}

                        {categories.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Сѐ уште немате додадено категории
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}