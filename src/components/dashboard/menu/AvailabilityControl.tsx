'use client';

import { AVAILABILITY_LABELS, AVAILABILITY_STATUSES, type AvailabilityStatus } from '@/lib/availability';

const ACTIVE_STYLES: Record<AvailabilityStatus, string> = {
    available: 'bg-green-600 text-white border-green-600',
    sold_out: 'bg-amber-500 text-white border-amber-500',
    hidden: 'bg-gray-700 text-white border-gray-700',
};

interface Props {
    value: AvailabilityStatus;
    onChange: (status: AvailabilityStatus) => void;
    label: string;
    disabled?: boolean;
}

export default function AvailabilityControl({ value, onChange, label, disabled = false }: Props) {
    return (
        <div role="radiogroup" aria-label={label} className="inline-flex rounded-md shadow-sm">
            {AVAILABILITY_STATUSES.map((status, index) => {
                const checked = value === status;
                return (
                    <button
                        key={status}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        disabled={disabled}
                        onClick={() => !checked && onChange(status)}
                        className={`px-2.5 py-1 text-xs font-medium border transition-colors disabled:opacity-50 ${
                            index === 0 ? 'rounded-l-md' : index === AVAILABILITY_STATUSES.length - 1 ? 'rounded-r-md -ml-px' : '-ml-px'
                        } ${checked ? ACTIVE_STYLES[status] : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                        {AVAILABILITY_LABELS[status]}
                    </button>
                );
            })}
        </div>
    );
}
