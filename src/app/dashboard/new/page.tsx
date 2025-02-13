'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewItemPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nameMK: '',
        nameEN: '',
        price: '',
        category: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Submitting data:', formData); // Debug log

            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price)
                }),
            });

            const data = await response.json();
            console.log('Response:', data); // Debug log

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'Failed to create menu item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Додади Нов Продукт</h1>

            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Цена (денари)
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                            <option value="hot-drinks">Топли Пијалоци</option>
                            <option value="cold-drinks">Ладни Пијалоци</option>
                            <option value="food">Храна</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${
                                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white py-2 px-4 rounded-lg flex items-center justify-center`}
                        >
                            {loading ? 'Се зачувува...' : 'Зачувај Продукт'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}