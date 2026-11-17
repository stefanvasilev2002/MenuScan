import { CURRENCY_SYMBOLS, EXCHANGE_RATES, type Currency } from '@/types/types';

export const CURRENCIES = Object.keys(EXCHANGE_RATES) as Currency[];

export function convertPrice(amount: number, from: Currency, to: Currency): number {
    if (from === to) {
        return amount;
    }
    return (amount / EXCHANGE_RATES[from]) * EXCHANGE_RATES[to];
}

export function formatPrice(amount: number, currency: Currency): string {
    if (!Number.isFinite(amount) || amount < 0) {
        return '—';
    }
    const formatted = amount.toFixed(currency === 'MKD' ? 0 : 2);
    return currency === 'MKD' ? `${formatted} ${CURRENCY_SYMBOLS.MKD}` : `${CURRENCY_SYMBOLS[currency]}${formatted}`;
}

export function formatConverted(amount: number, base: Currency, display: Currency): string {
    return formatPrice(convertPrice(amount, base, display), display);
}
