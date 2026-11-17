import { headers } from 'next/headers';
import QrCodePanel from '@/components/dashboard/QrCodePanel';
import { resolveBaseUrl } from '@/lib/env';
import { requireOwnedRestaurantPage } from '@/lib/page-auth';

interface Props {
    params: Promise<{ restaurantSlug: string }>;
}

export default async function QrCodePage({ params }: Props) {
    const { restaurantSlug } = await params;
    const { restaurant } = await requireOwnedRestaurantPage(restaurantSlug);
    const requestHeaders = await headers();
    const baseUrl = resolveBaseUrl(
        requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host'),
        requestHeaders.get('x-forwarded-proto'),
    );

    return <QrCodePanel restaurantName={restaurant.name} menuUrl={`${baseUrl}/menu/${restaurant.slug}`} slug={restaurant.slug} />;
}
