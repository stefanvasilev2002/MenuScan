'use client';

import { useId, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { buildCategoryTree, flattenCategoryTree } from '@/lib/category-tree';
import { formatConverted } from '@/lib/currency';
import { EMPTY_FILTERS, hasActiveFilters, type MenuFilters } from '@/lib/menu-filter';
import type { PublicCategory } from '@/lib/public-menu';
import type { Currency } from '@/types/types';
import { MENU_TEXT, type MenuLang } from './menu-text';

interface Props {
    filters: MenuFilters;
    onChange: (filters: MenuFilters) => void;
    categories: PublicCategory[];
    priceCeiling: number;
    baseCurrency: Currency;
    currency: Currency;
    lang: MenuLang;
    resultCount: number;
}

export default function MenuFilterBar({
    filters,
    onChange,
    categories,
    priceCeiling,
    baseCurrency,
    currency,
    lang,
    resultCount,
}: Props) {
    const t = MENU_TEXT[lang];
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const active = hasActiveFilters(filters);
    const update = (patch: Partial<MenuFilters>) => onChange({ ...filters, ...patch });
    const options = flattenCategoryTree(buildCategoryTree(categories));
    const step = priceCeiling > 100 ? 10 : 1;

    const toggles: Array<{ key: 'vegetarian' | 'vegan' | 'spicy' | 'hideSoldOut'; label: string }> = [
        { key: 'vegetarian', label: `🥬 ${t.vegetarian}` },
        { key: 'vegan', label: `🌱 ${t.vegan}` },
        { key: 'spicy', label: `🌶️ ${t.spicy}` },
        { key: 'hideSoldOut', label: t.hideSoldOut },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                        type="search"
                        value={filters.query}
                        onChange={(e) => update({ query: e.target.value })}
                        placeholder={t.search}
                        aria-label={t.search}
                        className="w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                    <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
                    <span className="hidden sm:inline">{t.filters}</span>
                </button>
            </div>

            {open && (
                <div id={panelId} className="grid gap-4 sm:grid-cols-2 border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700">
                        {t.category}
                        <select
                            value={filters.categoryId ?? ''}
                            onChange={(e) => update({ categoryId: e.target.value || null })}
                            className="mt-1 w-full p-2.5 border rounded-lg bg-white"
                        >
                            <option value="">{t.allCategories}</option>
                            {options.map(({ category, depth }) => (
                                <option key={category._id} value={category._id}>
                                    {`${'  '.repeat(depth)}${category.name}`}
                                </option>
                            ))}
                        </select>
                    </label>

                    {priceCeiling > 0 && (
                        <label className="block text-sm font-medium text-gray-700">
                            {t.maxPrice}:{' '}
                            <span className="text-blue-600 font-semibold">
                                {filters.maxPrice === null ? t.anyPrice : formatConverted(filters.maxPrice, baseCurrency, currency)}
                            </span>
                            <input
                                type="range"
                                min={0}
                                max={priceCeiling}
                                step={step}
                                value={filters.maxPrice ?? priceCeiling}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    update({ maxPrice: value >= priceCeiling ? null : value });
                                }}
                                className="mt-3 w-full accent-blue-600"
                            />
                        </label>
                    )}

                    <div className="sm:col-span-2 flex flex-wrap gap-2">
                        {toggles.map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={filters[key]}
                                onClick={() => update({ [key]: !filters[key] })}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                    filters[key] ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {active && (
                <div className="flex items-center justify-between text-sm text-gray-600" aria-live="polite">
                    <span>{t.resultCount(resultCount)}</span>
                    <button
                        type="button"
                        onClick={() => onChange(EMPTY_FILTERS)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                        {t.clearFilters}
                    </button>
                </div>
            )}
        </div>
    );
}
