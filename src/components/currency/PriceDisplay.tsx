import {Currency, EXCHANGE_RATES} from "@/types/types";
import {formatPrice} from "@/components/currency/PriceFormatter";
interface PriceDisplayProps {
    amount: number;
    currency: Currency;
    showOtherCurrencies?: boolean;
}

export function PriceDisplay({ amount, currency, showOtherCurrencies = false }: PriceDisplayProps) {
    const mainPrice = formatPrice(amount, currency);

    if (!showOtherCurrencies) {
        return (
            <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {mainPrice}
            </div>
        );
    }

    const otherCurrencies = Object.keys(EXCHANGE_RATES)
        .filter(curr => curr !== currency)
        .map(curr => ({
            currency: curr as Currency,
            value: formatPrice(amount, curr as Currency)
        }));

    return (
        <div className="space-y-1">
            <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {mainPrice}
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
                {otherCurrencies.map(({ currency, value }) => (
                    <div key={currency} className="text-center">
                        {value}
                    </div>
                ))}
            </div>
        </div>
    );
}