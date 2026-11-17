import Image from 'next/image';
import { PriceDisplay } from '@/components/currency/PriceDisplay';
import type { PublicMenuItem } from '@/lib/public-menu';
import type { Currency } from '@/types/types';
import { MENU_TEXT, type MenuLang } from './menu-text';

interface Props {
    item: PublicMenuItem;
    lang: MenuLang;
    baseCurrency: Currency;
    currency: Currency;
}

export default function PublicMenuItemCard({ item, lang, baseCurrency, currency }: Props) {
    const t = MENU_TEXT[lang];

    return (
        <article
            className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 ${item.isAvailable ? '' : 'opacity-60'}`}
            aria-label={item.name}
        >
            {item.imageUrl && (
                <div className="relative w-full h-48 md:h-56">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {!item.isAvailable && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {t.soldOut}
                        </span>
                    )}
                </div>
            )}
            <div className="p-5 flex justify-between items-start gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                        {!item.imageUrl && !item.isAvailable && (
                            <span className="inline-block mt-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {t.soldOut}
                            </span>
                        )}
                        {item.description && <p className="text-gray-600 mt-2 text-sm">{item.description}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                        {item.isVegetarian && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">🥬 {t.vegetarian}</span>}
                        {item.isVegan && <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">🌱 {t.vegan}</span>}
                        {item.isSpicy && <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">🌶️ {t.spicy}</span>}
                        {item.preparationTime && (
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                ⏱ {item.preparationTime} {t.minutes}
                            </span>
                        )}
                    </div>

                    {item.allergens.length > 0 && (
                        <p className="text-xs text-gray-500">
                            <span className="font-medium">{t.allergens}: </span>
                            {item.allergens.join(', ')}
                        </p>
                    )}
                </div>
                <PriceDisplay amount={item.price} baseCurrency={baseCurrency} currency={currency} />
            </div>
        </article>
    );
}
