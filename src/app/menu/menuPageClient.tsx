'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PriceDisplay } from '@/components/currency/PriceDisplay';
import {Currency} from "@/types/types";
import {CurrencySwitcher} from "@/components/currency/CurrencySwitcher";

interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
    parentId?: string;
    icon?: string;
    color?: string;
    isVisible: boolean;
    children?: Category[];
}

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

interface MenuPageProps {
    initialMenuItems: MenuItem[];
    categories: Category[];
}
function buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First, create a map of all categories
    categories.forEach(category => {
        categoryMap.set(category._id, { ...category, children: [] });
    });

    // Then, build the tree structure
    categoryMap.forEach(category => {
        if (category.parentId && categoryMap.has(category.parentId)) {
            const parent = categoryMap.get(category.parentId)!;
            parent.children = parent.children || [];
            parent.children.push(category);
        } else {
            rootCategories.push(category);
        }
    });

    // Sort all levels by order
    const sortByOrder = (cats: Category[]) => {
        cats.sort((a, b) => a.order - b.order);
        cats.forEach(cat => {
            if (cat.children?.length) {
                sortByOrder(cat.children);
            }
        });
    };
    sortByOrder(rootCategories);

    return rootCategories;
}

function CategorySection({
                             category,
                             items,
                             lang,
                             currency,
                             level = 0
                         }: {
    category: Category;
    items: MenuItem[];
    lang: 'mk' | 'en';
    currency: Currency;
    level?: number;
}) {
    const categoryItems = items.filter(item => item.category === category.slug);
    const hasItems = categoryItems.length > 0;
    const hasVisibleContent = hasItems || (category.children?.some(child =>
        items.some(item => item.category === child.slug)) ?? false);

    if (!hasVisibleContent) return null;

    return (
        <div className={`space-y-8 ${level > 0 ? 'ml-6' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-3 ${level > 0 ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    <h2>{lang === 'mk' ? category.nameMK : category.nameEN}</h2>
                </div>
                <div className="flex-1 border-b-2 border-gray-200"></div>
            </div>

            {/* Display items in this category */}
            {hasItems && (
                <div className="grid md:grid-cols-2 gap-8">
                    {categoryItems.map((item) => (
                        <MenuItemCard key={item._id}
                                      item={item}
                                      lang={lang}
                                      currency={currency}
                                      showOtherCurrencies={true} />
                    ))}
                </div>
            )}

            {/* Display subcategories */}
            {category.children?.map(subcategory => (
                <CategorySection
                    key={subcategory._id}
                    category={subcategory}
                    items={items}
                    lang={lang}
                    level={level + 1}
                    currency={currency}
                />
            ))}
        </div>
    );
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

function MenuItemCard({
                          item,
                          lang,
                          currency,
                          showOtherCurrencies
                      }: {
    item: MenuItem;
    lang: 'mk' | 'en';
    currency: Currency;
    showOtherCurrencies?: boolean;
}) {
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

                    <PriceDisplay
                        amount={item.price}
                        currency={currency}
                        showOtherCurrencies={showOtherCurrencies}
                    />
                </div>
            </div>
        </div>
    );
}

export default function MenuPageClient({ initialMenuItems, categories }: MenuPageProps) {
    const [lang, setLang] = useState<'mk' | 'en'>('mk');
    const [currency, setCurrency] = useState<Currency>('MKD');

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
    const categoryTree = buildCategoryTree(categories);

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
            {/* Hero Section with Background Image */}
            <div className="relative bg-blue-600 text-white">
                {/* Optional: Add a background pattern or texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-16 md:py-24">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                {getText('Нашето Мени', 'Our Menu')}
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 mb-8">
                                {getText(
                                    'Истражете ги нашите вкусни јадења',
                                    'Explore our delicious dishes'
                                )}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <CurrencySwitcher
                                currentCurrency={currency}
                                onCurrencyChange={setCurrency}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Search and Filters Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 relative">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder={getText('Пребарувај...', 'Search...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                            />
                            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors text-gray-700"
                            >
                                <FilterIcon />
                                {getText('Филтри', 'Filters')}
                            </button>
                            <button
                                onClick={() => setLang(lang === 'mk' ? 'en' : 'mk')}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                            >
                                {lang === 'mk' ? 'EN' : 'MK'}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="space-y-8 border-t pt-6">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {getText('Категорија', 'Category')}
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-3 border rounded-xl bg-white text-lg"
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
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    {getText('Цена', 'Price')}:
                                    <span className="ml-2 text-blue-600 font-semibold text-lg">
                                        {priceRange.min} - {priceRange.max} ден.
                                    </span>
                                </label>
                                <div className="flex gap-6 px-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(...initialMenuItems.map(item => item.price))}
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                        className="flex-1 accent-blue-600 h-2"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(...initialMenuItems.map(item => item.price))}
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                        className="flex-1 accent-blue-600 h-2"
                                    />
                                </div>
                            </div>

                            {/* Dietary Filters */}
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={dietaryFilters.vegetarian}
                                        onChange={(e) => setDietaryFilters(prev => ({ ...prev, vegetarian: e.target.checked }))}
                                        className="rounded text-blue-600 w-5 h-5"
                                    />
                                    <DietaryIcon type="vegetarian" />
                                </label>
                                <label className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={dietaryFilters.vegan}
                                        onChange={(e) => setDietaryFilters(prev => ({ ...prev, vegan: e.target.checked }))}
                                        className="rounded text-blue-600 w-5 h-5"
                                    />
                                    <DietaryIcon type="vegan" />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories and Menu Items */}
                    <div className="space-y-16 pb-16">
                        {categoryTree.map((category) => (
                            <CategorySection
                                key={category._id}
                                category={category}
                                items={filteredItems}
                                lang={lang}
                                currency={currency}
                            />
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-24">
                            <div className="text-gray-400 text-7xl mb-6">🍽️</div>
                            <p className="text-gray-500 text-xl">
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