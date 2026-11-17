import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicMenuView from '@/components/menu/PublicMenuView';
import { getPublicMenu } from '@/lib/public-menu';

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

const loadMenu = cache(getPublicMenu);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const menu = await loadMenu(slug);
    if (!menu) {
        return { title: 'Menu not found' };
    }
    return {
        title: `${menu.restaurant.name} menu`,
        description: menu.restaurant.description || `View the menu of ${menu.restaurant.name}.`,
    };
}

export default async function PublicMenuPage({ params }: Props) {
    const { slug } = await params;
    const menu = await loadMenu(slug);
    if (!menu) {
        notFound();
    }
    return <PublicMenuView menu={menu} />;
}
