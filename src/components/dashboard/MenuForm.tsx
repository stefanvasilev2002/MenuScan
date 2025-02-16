// components/dashboard/MenuForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuFormProps {
    initialData?: {
        _id?: string;
        name: string;
        theme: string;
        settings: {
            showPrices: boolean;
            showDescriptions: boolean;
            showAllergens: boolean;
            showSpicyLevel: boolean;
            showDietaryInfo: boolean;
        };
    };
    isEditing?: boolean;
}

export function MenuForm({ initialData, isEditing = false }: MenuFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        theme: 'default',
        settings: {
            showPrices: true,
            showDescriptions: true,
            showAllergens: true,
            showSpicyLevel: true,
            showDietaryInfo: true
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                theme: initialData.theme,
                settings: {
                    ...initialData.settings
                }
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const url = isEditing
                ? `/api/menus/${initialData?._id}`
                : '/api/menus';

            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Navigate only after successful submission
            router.push('/dashboard/menus');
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to save menu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (name.startsWith('settings.')) {
            const settingName = name.replace('settings.', '');
            setFormData(prev => ({
                ...prev,
                settings: {
                    ...prev.settings,
                    [settingName]: type === 'checkbox'
                        ? (e.target as HTMLInputElement).checked
                        : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : value
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Menu Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="theme"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Theme
                    </label>
                    <select
                        id="theme"
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="default">Default</option>
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-medium">Settings</h3>
                    <div className="space-y-2">
                        {Object.entries(formData.settings).map(([key, value]) => (
                            <div key={key} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={key}
                                    name={`settings.${key}`}
                                    checked={value}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <label
                                    htmlFor={key}
                                    className="ml-2 text-sm text-gray-700"
                                >
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex items-center space-x-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : isEditing ? 'Update Menu' : 'Create Menu'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}