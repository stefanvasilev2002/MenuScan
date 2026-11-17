import { CURRENCIES } from '@/lib/currency';
import { CURRENCY_SYMBOLS, type Currency } from '@/types/types';

interface CurrencySwitcherProps {
    currentCurrency: Currency;
    onCurrencyChange: (currency: Currency) => void;
}

export function CurrencySwitcher({ currentCurrency, onCurrencyChange }: CurrencySwitcherProps) {
    return (
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            {CURRENCIES.map((curr) => (
                <button
                    key={curr}
                    type="button"
                    aria-pressed={currentCurrency === curr}
                    aria-label={curr}
                    onClick={() => onCurrencyChange(curr)}
                    className={`
                        px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                        ${currentCurrency === curr
                        ? 'bg-white text-blue-600'
                        : 'text-white hover:bg-white/20'
                    }
                    `}
                >
                    {CURRENCY_SYMBOLS[curr]}
                </button>
            ))}
        </div>
    );
}