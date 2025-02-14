import MenuPageClient from "@/app/menu/menuPageClient";

async function getMenuItems() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/menu`, {
        cache: 'no-store',
        headers: {
            'Accept': 'application/json',
        },
    });
    if (!res.ok) {
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

export default async function MenuPage() {
    const [menuItems, categories] = await Promise.all([
        getMenuItems(),
        getCategories(),
    ]);

    return (
        <MenuPageClient
            initialMenuItems={menuItems}
            categories={categories}
        />
    );
}