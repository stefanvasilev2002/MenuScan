'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    price: number;
    category: string;
}

export default function EditItemPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nameMK: '',
        nameEN: '',
        price: '',
        category: ''
    });

    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                const response = await fetch(`/api/menu/${params.id}`);
                const data = await response.json();
                setFormData({
                    nameMK: data.nameMK,
                    nameEN: data.nameEN,
                    price: data.price.toString(),
                    category: data.category
                });
            } catch (error) {
                console.error('Error fetching menu item:', error);
            }
        };

        fetchMenuItem();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/menu/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price)
                }),
            });

            if (response.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">Измени Продукт</h1>

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

                    <div className="pt-4 flex space-x-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                        >
                            Зачувај Промени
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
                        >
                            Откажи
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}