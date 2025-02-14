'use client';
import { useState } from 'react';

interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    descriptionMK?: string;
    descriptionEN?: string;
    price: number;
    category: string;
    isAvailable: boolean;
    ingredients?: string[];
    allergens?: string[];
    spicyLevel?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
}

interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
}

interface MenuPageProps {
    initialMenuItems: MenuItem[];
    categories: Category[];
}

function FilterIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
    );
}

function DietaryIcon({ type }: { type: 'vegetarian' | 'vegan' | 'spicy' }) {
    const iconClass = "w-5 h-5";
    switch (type) {
        case 'vegetarian':
            return <span className={iconClass} title="Вегетаријанско / Vegetarian">🥬</span>;
        case 'vegan':
            return <span className={iconClass} title="Vegанско / Vegan">🌱</span>;
        case 'spicy':
            return <span className={iconClass} title="Лутo / Spicy">🌶️</span>;
        default:
            return null;
    }
}

export default function MenuPageClient({ initialMenuItems, categories }: MenuPageProps) {
    const [lang, setLang] = useState<'mk' | 'en'>('mk');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
        min: 0,
        max: Math.max(...initialMenuItems.map(item => item.price))
    });
    const [showFilters, setShowFilters] = useState(false);
    const [dietaryFilters, setDietaryFilters] = useState({
        vegetarian: false,
        vegan: false
    });

    // Filter items based on all criteria
    const filteredItems = initialMenuItems.filter(item => {
        const matchesSearch =
            (item[lang === 'mk' ? 'nameMK' : 'nameEN'].toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item[lang === 'mk' ? 'descriptionMK' : 'descriptionEN']?.toLowerCase().includes(searchQuery.toLowerCase())));
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;
        const matchesDietary =
            (!dietaryFilters.vegetarian || item.isVegetarian) &&
            (!dietaryFilters.vegan || item.isVegan);

        return item.isAvailable && matchesSearch && matchesCategory && matchesPrice && matchesDietary;
    });

    const getText = (mk: string, en: string) => lang === 'mk' ? mk : en;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header with Language Toggle */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    {getText('Нашето Мени', 'Our Menu')}
                </h1>
                <button
                    onClick={() => setLang(lang === 'mk' ? 'en' : 'mk')}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                >
                    {lang === 'mk' ? 'EN' : 'MK'}
                </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder={getText('Пребарувај...', 'Search...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                    >
                        <FilterIcon />
                        {getText('Филтри', 'Filters')}
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {getText('Категорија', 'Category')}
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="">{getText('Сите категории', 'All categories')}</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category.slug}>
                                        {lang === 'mk' ? category.nameMK : category.nameEN}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {getText('Цена', 'Price')} ({priceRange.min} - {priceRange.max} ден.)
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max={Math.max(...initialMenuItems.map(item => item.price))}
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    className="flex-1"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max={Math.max(...initialMenuItems.map(item => item.price))}
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Dietary Filters */}
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={dietaryFilters.vegetarian}
                                    onChange={(e) => setDietaryFilters(prev => ({ ...prev, vegetarian: e.target.checked }))}
                                    className="rounded"
                                />
                                <DietaryIcon type="vegetarian" />
                                {getText('Вегетаријанско', 'Vegetarian')}
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={dietaryFilters.vegan}
                                    onChange={(e) => setDietaryFilters(prev => ({ ...prev, vegan: e.target.checked }))}
                                    className="rounded"
                                />
                                <DietaryIcon type="vegan" />
                                {getText('Веганско', 'Vegan')}
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <div className="space-y-12">
                {categories
                    .sort((a, b) => a.order - b.order)
                    .map((category) => {
                        const categoryItems = filteredItems.filter(
                            item => item.category === category.slug
                        );

                        if (categoryItems.length === 0) return null;

                        return (
                            <div key={category._id} className="space-y-4">
                                <div className="border-b border-gray-200 pb-2">
                                    <h2 className="text-xl font-semibold">
                                        {lang === 'mk' ? category.nameMK : category.nameEN}
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {categoryItems.map((item) => (
                                        <div
                                            key={item._id}
                                            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">
                                                            {lang === 'mk' ? item.nameMK : item.nameEN}
                                                        </h3>
                                                        {(item.descriptionMK || item.descriptionEN) && (
                                                            <p className="text-sm text-gray-500">
                                                                {lang === 'mk' ? item.descriptionMK : item.descriptionEN}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {/* Dietary Icons */}
                                                    <div className="flex gap-2">
                                                        {item.isVegetarian && <DietaryIcon type="vegetarian" />}
                                                        {item.isVegan && <DietaryIcon type="vegan" />}
                                                        {item.spicyLevel && item.spicyLevel > 0 && <DietaryIcon type="spicy" />}
                                                    </div>
                                                    {/* Allergens */}
                                                    {item.allergens && item.allergens.length > 0 && (
                                                        <p className="text-xs text-gray-500">
                                                            {getText('Алергени: ', 'Allergens: ')}
                                                            {item.allergens.join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-lg font-bold text-gray-900 ml-4">
                                                    {item.price} ден.
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                    {getText(
                        'Нема пронајдени продукти',
                        'No items found'
                    )}
                </div>
            )}
        </div>
    );
}