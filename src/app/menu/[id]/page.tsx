import { notFound } from 'next/navigation';
import MenuPageClient from "@/app/menu/menuPageClient";

interface Props {
    params: {
        id: string;
    };
}
interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
    parentId?: string;
    icon?: string;
    color?: string;
    isVisible: boolean;
    children?: Category[];
}

interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    descriptionMK?: string;
    descriptionEN?: string;
    price: number;
    category: string;
    isAvailable: boolean;
    ingredients?: string[];
    allergens?: string[];
    spicyLevel?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    imageUrl?: string;
    imagePublicId?: string;
}

interface Menu {
    id: string;
    name: string;
    theme: string;
    settings: {
        showPrices: boolean;
        showDescriptions: boolean;
        showAllergens: boolean;
        showSpicyLevel: boolean;
        showDietaryInfo: boolean;
    };
    isActive: boolean;
}
async function getMenuItems(menuId: string): Promise<MenuItem[]> {
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

async function getCategories(menuId: string): Promise<Category[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories?menuId=${menuId}`, {
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

async function getMenu(menuId: string): Promise<Menu> {
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

    const menu = await res.json();

    if (!menu.isActive) {
        notFound();
    }

    return menu;
}

export default async function MenuPage({ params }: Props) {
    const { id: menuId } = params;

    try {
        const [menuItems, categories, menu] = await Promise.all([
            getMenuItems(menuId),
            getCategories(menuId),
            getMenu(menuId),
        ]);

        if (!menu.isActive) {
            notFound();
        }

        return (
            <MenuPageClient
                initialMenuItems={menuItems}
                categories={categories}
                menu={menu}
            />
        );
    } catch (error) {
        console.error('Error fetching data:', error);
        notFound();
    }
}