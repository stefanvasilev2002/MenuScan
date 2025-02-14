'use client';

import { useState } from 'react';
import Image from 'next/image';

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
    imageUrl?: string;
    imagePublicId?: string;
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

function DietaryIcon({ type, size = "normal", level = 1 }: { type: 'vegetarian' | 'vegan' | 'spicy', size?: "small" | "normal", level?: number }) {
    const iconClass = size === "small" ? "inline-flex items-center" : "inline-flex items-center";

    switch (type) {
        case 'vegetarian':
            return (
                <span className={`${iconClass} px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium`}
                      title="Вегетаријанско / Vegetarian">
                    <span className="mr-1">🥬</span>
                    Vegetarian
                </span>
            );
        case 'vegan':
            return (
                <span className={`${iconClass} px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium`}
                      title="Веганско / Vegan">
                    <span className="mr-1">🌱</span>
                    Vegan
                </span>
            );
        case 'spicy':
            return (
                <span className={`${iconClass} px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium`}
                      title={`Лутo / Spicy (Level ${level})`}>
                    <span className="mr-1">{'🌶️'.repeat(level)}</span>
                    {level === 1 ? 'Mild' : level === 2 ? 'Medium' : 'Hot'}
                </span>
            );
        default:
            return null;
    }
}

function MenuItemCard({ item, lang }: { item: MenuItem, lang: 'mk' | 'en' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
            {item.imageUrl && (
                <div className="relative w-full h-48 md:h-64">
                    <Image
                        src={item.imageUrl}
                        alt={lang === 'mk' ? item.nameMK : item.nameEN}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                        quality={75}
                    />
                </div>
            )}
            <div className="p-5">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-4 flex-1">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {lang === 'mk' ? item.nameMK : item.nameEN}
                            </h3>
                            {(item.descriptionMK || item.descriptionEN) && (
                                <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                    {lang === 'mk' ? item.descriptionMK : item.descriptionEN}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Dietary Icons */}
                            <div className="flex flex-wrap gap-2">
                                {item.isVegetarian && <DietaryIcon type="vegetarian" size="small" />}
                                {item.isVegan && <DietaryIcon type="vegan" size="small" />}
                                {item.spicyLevel > 0 && <DietaryIcon type="spicy" size="small" level={item.spicyLevel} />}
                            </div>

                            {/* Allergens */}
                            {item.allergens && item.allergens.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="font-medium">
                                        {lang === 'mk' ? 'Алергени: ' : 'Allergens: '}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {item.allergens.map((allergen, index) => (
                                            <span key={index}
                                                  className="px-2 py-1 bg-gray-100 rounded-full">
                                                {allergen}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {item.price} ден.
                    </div>
                </div>
            </div>
        </div>
    );
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
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-blue-600 to-blue-500 text-white">
                <div className="max-w-4xl mx-auto p-6 py-12">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold">
                            {getText('Нашето Мени', 'Our Menu')}
                        </h1>
                        <button
                            onClick={() => setLang(lang === 'mk' ? 'en' : 'mk')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                        >
                            {lang === 'mk' ? 'EN' : 'MK'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 -mt-6">
                {/* Search and Filters Card */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder={getText('Пребарувај...', 'Search...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FilterIcon />
                            {getText('Филтри', 'Filters')}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="space-y-6 border-t pt-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getText('Категорија', 'Category')}
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getText('Цена', 'Price')}: <span className="text-blue-600 font-semibold">{priceRange.min} - {priceRange.max} ден.</span>
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(...initialMenuItems.map(item => item.price))}
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                        className="flex-1 accent-blue-600"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(...initialMenuItems.map(item => item.price))}
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                        className="flex-1 accent-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Dietary Filters */}
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={dietaryFilters.vegetarian}
                                        onChange={(e) => setDietaryFilters(prev => ({ ...prev, vegetarian: e.target.checked }))}
                                        className="rounded text-blue-600"
                                    />
                                    <DietaryIcon type="vegetarian" />
                                    {getText('Вегетаријанско', 'Vegetarian')}
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={dietaryFilters.vegan}
                                        onChange={(e) => setDietaryFilters(prev => ({ ...prev, vegan: e.target.checked }))}
                                        className="rounded text-blue-600"
                                    />
                                    <DietaryIcon type="vegan" />
                                    {getText('Веганско', 'Vegan')}
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories and Menu Items */}
                <div className="space-y-12">
                    {categories
                        .sort((a, b) => a.order - b.order)
                        .map((category) => {
                            const categoryItems = filteredItems.filter(
                                item => item.category === category.slug
                            );

                            if (categoryItems.length === 0) return null;

                            return (
                                <div key={category._id}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {lang === 'mk' ? category.nameMK : category.nameEN}
                                        </h2>
                                        <div className="flex-1 border-b border-gray-200"></div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="grid gap-6">
                                            {categoryItems.map((item) => (
                                                <MenuItemCard key={item._id} item={item} lang={lang}/>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Empty state remains the same */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                        <p className="text-gray-500 text-lg">
                            {getText(
                                'Нема пронајдени продукти',
                                'No items found'
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}