import { CURRENCIES, formatConverted } from '@/lib/currency';
import type { Currency } from '@/types/types';

interface PriceDisplayProps {
    amount: number;
    baseCurrency: Currency;
    currency: Currency;
    showOtherCurrencies?: boolean;
}

export function PriceDisplay({ amount, baseCurrency, currency, showOtherCurrencies = false }: PriceDisplayProps) {
    return (
        <div className="space-y-1 text-right">
            <div className="whitespace-nowrap text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {formatConverted(amount, baseCurrency, currency)}
            </div>
            {showOtherCurrencies && (
                <div className="text-xs text-gray-500 space-y-0.5">
                    {CURRENCIES.filter((c) => c !== currency).map((c) => (
                        <div key={c}>{formatConverted(amount, baseCurrency, c)}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
