'use client';

import { useMemo, useState } from 'react';
import { CurrencySwitcher } from '@/components/currency/CurrencySwitcher';
import { buildCategoryTree, type CategoryNode } from '@/lib/category-tree';
import type { PublicCategory, PublicMenu, PublicMenuItem } from '@/lib/public-menu';
import type { Currency } from '@/types/types';
import PublicMenuItemCard from './PublicMenuItemCard';
import { MENU_TEXT, type MenuLang } from './menu-text';

interface Props {
    menu: PublicMenu;
}

function countItems(node: CategoryNode<PublicCategory>, itemsByCategory: Map<string, PublicMenuItem[]>): number {
    return (
        (itemsByCategory.get(node._id)?.length ?? 0) +
        node.children.reduce((sum, child) => sum + countItems(child, itemsByCategory), 0)
    );
}

function CategorySection({
    node,
    itemsByCategory,
    level,
    lang,
    baseCurrency,
    currency,
}: {
    node: CategoryNode<PublicCategory>;
    itemsByCategory: Map<string, PublicMenuItem[]>;
    level: number;
    lang: MenuLang;
    baseCurrency: Currency;
    currency: Currency;
}) {
    if (countItems(node, itemsByCategory) === 0) {
        return null;
    }
    const items = itemsByCategory.get(node._id) ?? [];
    const Heading = level === 0 ? 'h2' : 'h3';

    return (
        <section id={`category-${node._id}`} aria-labelledby={`heading-${node._id}`} className={`space-y-6 ${level > 0 ? 'sm:ml-6' : ''}`}>
            <div className="flex items-center gap-4">
                <Heading
                    id={`heading-${node._id}`}
                    className={`flex items-center gap-3 font-bold ${level === 0 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
                    style={{ color: node.color || '#1F2937' }}
                >
                    {node.icon && <span aria-hidden="true">{node.icon}</span>}
                    {node.name}
                </Heading>
                <div className="flex-1 border-b-2 border-gray-200" />
            </div>
            {node.description && <p className="text-gray-600 -mt-3">{node.description}</p>}

            {items.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                    {items.map((item) => (
                        <PublicMenuItemCard key={item._id} item={item} lang={lang} baseCurrency={baseCurrency} currency={currency} />
                    ))}
                </div>
            )}

            {node.children.map((child) => (
                <CategorySection
                    key={child._id}
                    node={child}
                    itemsByCategory={itemsByCategory}
                    level={level + 1}
                    lang={lang}
                    baseCurrency={baseCurrency}
                    currency={currency}
                />
            ))}
        </section>
    );
}

export default function PublicMenuView({ menu }: Props) {
    const [lang, setLang] = useState<MenuLang>('en');
    const [currency, setCurrency] = useState<Currency>(menu.restaurant.currency);
    const t = MENU_TEXT[lang];

    const tree = useMemo(() => buildCategoryTree(menu.categories), [menu.categories]);
    const itemsByCategory = useMemo(() => {
        const map = new Map<string, PublicMenuItem[]>();
        for (const item of [...menu.items].sort((a, b) => a.order - b.order)) {
            map.set(item.categoryId, [...(map.get(item.categoryId) ?? []), item]);
        }
        return map;
    }, [menu.items]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                    <div className="flex flex-wrap items-center justify-end gap-3 mb-8">
                        <CurrencySwitcher currentCurrency={currency} onCurrencyChange={setCurrency} />
                        <button
                            type="button"
                            onClick={() => setLang(lang === 'mk' ? 'en' : 'mk')}
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20"
                            aria-label={t.switchLanguage}
                        >
                            {lang === 'mk' ? 'EN' : 'MK'}
                        </button>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-center">{menu.restaurant.name}</h1>
                    <p className="mt-4 text-center text-blue-100 text-lg">{menu.restaurant.description || t.tagline}</p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
                {menu.items.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg py-16">{t.emptyMenu}</p>
                ) : (
                    tree.map((node) => (
                        <CategorySection
                            key={node._id}
                            node={node}
                            itemsByCategory={itemsByCategory}
                            level={0}
                            lang={lang}
                            baseCurrency={menu.restaurant.currency}
                            currency={currency}
                        />
                    ))
                )}
            </main>

            <footer className="py-8 text-center text-sm text-gray-400">{t.poweredBy}</footer>
        </div>
    );
}
