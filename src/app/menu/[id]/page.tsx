import MenuPageClient from "@/app/menu/menuPageClient";
import { notFound } from 'next/navigation';

interface Props {
    params: {
        id: string;
    };
}

async function getMenuItems(menuId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu?menuId=${menuId}`, {
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!res.ok) {
        if (res.status === 404) {
            notFound();
        }
        throw new Error('Failed to fetch menu items');
    }
    return res.json();
}

async function getCategories() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, {
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
        },
    });
    if (!res.ok) {
        throw new Error('Failed to fetch categories');
    }
    return res.json();
}

async function getMenu(menuId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menus/${menuId}`, {
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!res.ok) {
        if (res.status === 404) {
            notFound();
        }
        throw new Error('Failed to fetch menu');
    }
    return res.json();
}

export default async function MenuPage({ params }: Props) {
    const { id: menuId } = params;

    try {
        const [menuItems, categories, menu] = await Promise.all([
            getMenuItems(menuId),
            getCategories(),
            getMenu(menuId),
        ]);

        return (
            <MenuPageClient
                initialMenuItems={menuItems}
                categories={categories}
                menu={menu}
            />
        );
    } catch (error) {
        notFound();
    }
}