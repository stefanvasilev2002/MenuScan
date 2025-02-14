'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    slug: string;
}

interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    descriptionMK: string;
    descriptionEN: string;
    price: number;
    category: string;
    isAvailable: boolean;
    ingredients: string[];
    allergens: string[];
    spicyLevel: number;
    isVegetarian: boolean;
    isVegan: boolean;
    order: number;
}

export default function EditItemPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        nameMK: '',
        nameEN: '',
        descriptionMK: '',
        descriptionEN: '',
        price: '',
        category: '',
        isAvailable: true,
        ingredients: [''],
        allergens: [''],
        spicyLevel: 0,
        isVegetarian: false,
        isVegan: false,
        order: 0
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, menuItemRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch(`/api/menu/${params.id}`)
                ]);

                if (!categoriesRes.ok || !menuItemRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const categoriesData = await categoriesRes.json();
                const menuItemData = await menuItemRes.json();

                setCategories(categoriesData);
                setFormData({
                    nameMK: menuItemData.nameMK,
                    nameEN: menuItemData.nameEN,
                    descriptionMK: menuItemData.descriptionMK || '',
                    descriptionEN: menuItemData.descriptionEN || '',
                    price: menuItemData.price.toString(),
                    category: menuItemData.category,
                    isAvailable: menuItemData.isAvailable ?? true,
                    ingredients: menuItemData.ingredients?.length ? menuItemData.ingredients : [''],
                    allergens: menuItemData.allergens?.length ? menuItemData.allergens : [''],
                    spicyLevel: menuItemData.spicyLevel || 0,
                    isVegetarian: menuItemData.isVegetarian || false,
                    isVegan: menuItemData.isVegan || false,
                    order: menuItemData.order || 0
                });
            } catch (error) {
                setError('Failed to load data');
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    const handleArrayFieldChange = (field: 'ingredients' | 'allergens', index: number, value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayField = (field: 'ingredients' | 'allergens') => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayField = (field: 'ingredients' | 'allergens', index: number) => {
        if (formData[field].length > 1) {
            const newArray = formData[field].filter((_, i) => i !== index);
            setFormData({ ...formData, [field]: newArray });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`/api/menu/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    ingredients: formData.ingredients.filter(i => i.trim() !== ''),
                    allergens: formData.allergens.filter(a => a.trim() !== '')
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update menu item');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update menu item');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8">Измени Продукт</h1>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Име (Македонски)
                        </label>
                        <input
                            type="text"
                            value={formData.nameMK}
                            onChange={(e) => setFormData({ ...formData, nameMK: e.target.value })}
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
                            value={formData.nameEN}
                            onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Опис (Македонски)
                        </label>
                        <textarea
                            value={formData.descriptionMK}
                            onChange={(e) => setFormData({ ...formData, descriptionMK: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (English)
                        </label>
                        <textarea
                            value={formData.descriptionEN}
                            onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Цена (денари)
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Категорија
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">Избери категорија</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category.slug}>
                                    {category.nameMK}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dietary Information */}
                <div className="space-y-4">
                    <h3 className="font-medium">Додатни Информации</h3>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isVegetarian}
                                onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                                className="rounded"
                            />
                            Вегетаријанско
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isVegan}
                                onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                                className="rounded"
                            />
                            Веганско
                        </label>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Ниво на лутост:
                            </label>
                            <select
                                value={formData.spicyLevel}
                                onChange={(e) => setFormData({ ...formData, spicyLevel: Number(e.target.value) })}
                                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="0">Не е луто</option>
                                <option value="1">Малку луто</option>
                                <option value="2">Средно луто</option>
                                <option value="3">Многу луто</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Состојки</label>
                        <button
                            type="button"
                            onClick={() => addArrayField('ingredients')}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                            + Додади состојка
                        </button>
                    </div>
                    {formData.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={ingredient}
                                onChange={(e) => handleArrayFieldChange('ingredients', index, e.target.value)}
                                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Внеси состојка"
                            />
                            <button
                                type="button"
                                onClick={() => removeArrayField('ingredients', index)}
                                className="text-red-500 hover:text-red-600 px-2"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {/* Allergens */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Алергени</label>
                        <button
                            type="button"
                            onClick={() => addArrayField('allergens')}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                            + Додади алерген
                        </button>
                    </div>
                    {formData.allergens.map((allergen, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={allergen}
                                onChange={(e) => handleArrayFieldChange('allergens', index, e.target.value)}
                                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Внеси алерген"
                            />
                            <button
                                type="button"
                                onClick={() => removeArrayField('allergens', index)}
                                className="text-red-500 hover:text-red-600 px-2"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {/* Availability */}
                <div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                            className="rounded"
                        />
                        Достапно
                    </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 ${
                            loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white py-2 px-4 rounded-lg`}
                    >
                        {loading ? 'Се зачувува...' : 'Зачувај Промени'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
                    >
                        Откажи
                    </button>
                </div>
            </form>

            {/* Delete Button */}
            <div className="mt-6">
                <button
                    type="button"
                    onClick={async () => {
                        if (confirm('Дали сте сигурни дека сакате да го избришете овој продукт?')) {
                            try {
                                setLoading(true);
                                const response = await fetch(`/api/menu/${params.id}`, {
                                    method: 'DELETE',
                                });

                                if (!response.ok) {
                                    throw new Error('Failed to delete item');
                                }

                                router.push('/dashboard');
                                router.refresh();
                            } catch (error) {
                                setError('Failed to delete item');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                >
                    Избриши Продукт
                </button>
            </div>
        </div>
    );
}