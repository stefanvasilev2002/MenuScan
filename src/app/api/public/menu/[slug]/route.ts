import { NextResponse } from 'next/server';
import { notFound, route } from '@/lib/api';
import { getPublicMenu } from '@/lib/public-menu';

type Params = { slug: string };

export const GET = route<Params>(async (_request, { slug }) => {
    const menu = await getPublicMenu(slug);
    if (!menu) {
        throw notFound('Menu not found');
    }
    return NextResponse.json(menu, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' },
    });
});
