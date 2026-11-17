import Link from 'next/link';
import { CheckCircle2, EyeOff, FolderTree, ImageOff, Layers, QrCode, Utensils, XCircle, ExternalLink } from 'lucide-react';
import type { MenuCounts } from '@/lib/stats';

interface Props {
    restaurantSlug: string;
    restaurantName: string;
    counts: MenuCounts;
}

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    hint?: string;
    icon: typeof Layers;
    tone: string;
}) {
    return (
        <div className="bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${tone}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-3xl font-bold text-gray-900" aria-label={`${label}: ${value}`}>
                    {value}
                </p>
                {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
            </div>
        </div>
    );
}

export default function RestaurantDashboardOverview({ restaurantSlug, restaurantName, counts }: Props) {
    const isEmpty = counts.categories === 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{restaurantName}</h1>
                    <p className="text-gray-600 mt-1">An overview of your menu.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={`/dashboard/${restaurantSlug}/menu`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                        <Utensils className="w-4 h-4" aria-hidden="true" />
                        Edit menu
                    </Link>
                    <Link
                        href={`/dashboard/${restaurantSlug}/qr`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                    >
                        <QrCode className="w-4 h-4" aria-hidden="true" />
                        QR code
                    </Link>
                    <a
                        href={`/menu/${restaurantSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                    >
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        View public menu
                    </a>
                </div>
            </div>

            {isEmpty ? (
                <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Your menu is empty</h2>
                    <p className="text-gray-600 mt-2">Create your first category, then add dishes to it.</p>
                    <Link
                        href={`/dashboard/${restaurantSlug}/menu`}
                        className="inline-flex mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                        Start building
                    </Link>
                </div>
            ) : (
                <>
                    <section aria-label="Menu structure" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            label="Categories"
                            value={counts.categories}
                            hint={`${counts.topLevelCategories} top-level, ${counts.subcategories} nested${
                                counts.hiddenCategories ? `, ${counts.hiddenCategories} hidden` : ''
                            }`}
                            icon={FolderTree}
                            tone="bg-indigo-100 text-indigo-700"
                        />
                        <StatCard label="Menu items" value={counts.items} icon={Layers} tone="bg-blue-100 text-blue-700" />
                        <StatCard
                            label="Items without photo"
                            value={counts.itemsWithoutImage}
                            icon={ImageOff}
                            tone="bg-gray-100 text-gray-700"
                        />
                    </section>

                    <section aria-label="Item availability" className="grid gap-4 sm:grid-cols-3">
                        <StatCard label="Available" value={counts.availableItems} icon={CheckCircle2} tone="bg-green-100 text-green-700" />
                        <StatCard label="Sold out" value={counts.soldOutItems} icon={XCircle} tone="bg-amber-100 text-amber-700" />
                        <StatCard label="Hidden" value={counts.hiddenItems} icon={EyeOff} tone="bg-gray-200 text-gray-700" />
                    </section>
                </>
            )}
        </div>
    );
}
