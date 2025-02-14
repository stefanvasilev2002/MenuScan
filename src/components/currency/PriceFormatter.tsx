import {Currency, CURRENCY_SYMBOLS, EXCHANGE_RATES} from "@/types/types";

export function formatPrice(amount: number, currency: Currency): string {
    if (!amount || isNaN(amount)) {
        console.warn('Invalid price amount:', amount);
        return 'N/A';
    }

    const convertedAmount = amount * EXCHANGE_RATES[currency];

    // Add validation for conversion result
    if (isNaN(convertedAmount)) {
        console.warn('Invalid conversion result for amount:', amount, 'currency:', currency);
        return 'N/A';
    }
    const formattedAmount = convertedAmount.toFixed(currency === 'MKD' ? 0 : 2);

    // Handle symbol position and spacing based on currency
    switch (currency) {
        case 'MKD':
            return `${formattedAmount} ${CURRENCY_SYMBOLS[currency]}`;
        case 'EUR':
            return `${CURRENCY_SYMBOLS[currency]}${formattedAmount}`;
        case 'USD':
            return `${CURRENCY_SYMBOLS[currency]}${formattedAmount}`;
        default:
            return `${formattedAmount}`;
    }
}