'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MenuFormData {
    name: string;
    theme: string;
    settings: {
        showPrices: boolean;
        showDescriptions: boolean;
        showAllergens: boolean;
        showSpicyLevel: boolean;
        showDietaryInfo: boolean;
    };
}

export default function CreateMenuPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<MenuFormData>({
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSettingChange = (setting: keyof MenuFormData['settings']) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [setting]: !prev.settings[setting]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/menus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create menu');
            }

            const menu = await response.json();
            router.push(`/dashboard/menu/${menu._id}/items`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-semibold">Create New Menu</h1>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Menu Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter menu name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                                Theme
                            </label>
                            <select
                                id="theme"
                                name="theme"
                                value={formData.theme}
                                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="default">Default</option>
                                <option value="dark">Dark</option>
                                <option value="elegant">Elegant</option>
                                <option value="modern">Modern</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Menu Settings</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="showPrices" className="text-sm font-medium text-gray-700">
                                        Show Prices
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="showPrices"
                                            checked={formData.settings.showPrices}
                                            onChange={() => handleSettingChange('showPrices')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label htmlFor="showDescriptions" className="text-sm font-medium text-gray-700">
                                        Show Descriptions
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="showDescriptions"
                                            checked={formData.settings.showDescriptions}
                                            onChange={() => handleSettingChange('showDescriptions')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label htmlFor="showAllergens" className="text-sm font-medium text-gray-700">
                                        Show Allergens
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="showAllergens"
                                            checked={formData.settings.showAllergens}
                                            onChange={() => handleSettingChange('showAllergens')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label htmlFor="showSpicyLevel" className="text-sm font-medium text-gray-700">
                                        Show Spicy Level
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="showSpicyLevel"
                                            checked={formData.settings.showSpicyLevel}
                                            onChange={() => handleSettingChange('showSpicyLevel')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label htmlFor="showDietaryInfo" className="text-sm font-medium text-gray-700">
                                        Show Dietary Information
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="showDietaryInfo"
                                            checked={formData.settings.showDietaryInfo}
                                            onChange={() => handleSettingChange('showDietaryInfo')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating...' : 'Create Menu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}