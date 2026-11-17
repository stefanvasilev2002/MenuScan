'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError, errorMessage } from '@/lib/client-api';
import { fieldErrors, restaurantUpdateSchema } from '@/lib/validation';
import type { RestaurantData } from '@/types/restaurant';

interface Props {
    restaurant: RestaurantData;
}

const CURRENCY_OPTIONS: Array<{ value: RestaurantData['currency']; label: string }> = [
    { value: 'MKD', label: 'Macedonian denar (ден.)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'US dollar ($)' },
];

type FormState = Pick<RestaurantData, 'name' | 'description' | 'address' | 'phone' | 'email' | 'currency' | 'isActive'>;

export default function RestaurantSettingsForm({ restaurant }: Props) {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        currency: restaurant.currency,
        isActive: restaurant.isActive,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        setStatus(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = restaurantUpdateSchema.safeParse(form);
        if (!parsed.success) {
            setErrors(fieldErrors(parsed.error));
            return;
        }

        setSaving(true);
        try {
            await apiRequest(`/api/restaurant/${restaurant.slug}`, { method: 'PATCH', body: JSON.stringify(parsed.data) });
            setStatus({ type: 'success', message: 'Settings saved' });
            router.refresh();
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors(error.details);
            }
            setStatus({ type: 'error', message: errorMessage(error) });
        } finally {
            setSaving(false);
        }
    };

    const input = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
    const fieldClass = (key: string) => `${input} ${errors[key] ? 'border-red-300' : 'border-gray-300'}`;
    const errorText = (key: string) => errors[key] && <p className="mt-1 text-sm text-red-600">{errors[key]}</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl" noValidate>
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900">Restaurant settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    These details appear on your public menu at <span className="font-mono">/menu/{restaurant.slug}</span>.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} className={fieldClass('name')} />
                    {errorText('name')}
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        rows={3}
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        className={fieldClass('description')}
                    />
                    {errorText('description')}
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input id="address" value={form.address} onChange={(e) => update('address', e.target.value)} className={fieldClass('address')} />
                    {errorText('address')}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input id="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass('phone')} />
                    {errorText('phone')}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass('email')} />
                    {errorText('email')}
                </div>
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Menu currency</label>
                    <select
                        id="currency"
                        value={form.currency}
                        onChange={(e) => update('currency', e.target.value as FormState['currency'])}
                        className={fieldClass('currency')}
                    >
                        {CURRENCY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Prices are entered in this currency. Guests can switch the display currency.</p>
                </div>
                <div className="flex items-start gap-3 pt-6">
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => update('isActive', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                        <span className="font-medium">Menu is online</span>
                        <span className="block text-gray-500">When off, the public menu and QR code show a not-found page.</span>
                    </label>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {saving ? 'Saving…' : 'Save settings'}
                </button>
                {status && (
                    <p role="status" className={status.type === 'success' ? 'text-sm text-green-700' : 'text-sm text-red-600'}>
                        {status.message}
                    </p>
                )}
            </div>
        </form>
    );
}
