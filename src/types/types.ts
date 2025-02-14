export type Currency = 'MKD' | 'EUR' | 'USD';

export const EXCHANGE_RATES = {
    MKD: 1,
    EUR: 0.016,  // 1 MKD = 0.016 EUR (approximately)
    USD: 0.018   // 1 MKD = 0.018 USD (approximately)
};

export const CURRENCY_SYMBOLS = {
    MKD: 'ден.',
    EUR: '€',
    USD: '$'
};