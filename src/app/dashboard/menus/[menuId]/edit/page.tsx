// app/dashboard/menus/[id]/edit/CategoriesPage.tsx
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/Menu';
import { connectToDatabase } from '@/lib/db';
import { MenuForm } from '@/components/dashboard/MenuForm';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface EditMenuPageProps {
    params: {
        id: string;
    };
}

async function getMenu(id: string, userId: string) {
    await connectToDatabase();
    const menu = await Menu.findOne({ _id: id, userId });
    if (!menu) return null;

    return {
        _id: menu._id.toString(),
        name: menu.name,
        theme: menu.theme,
        settings: menu.settings
    };
}

export default async function EditMenuPage({ params }: EditMenuPageProps) {
    const { id } = params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await getCurrentUser(token);
    if (!user) {
        redirect('/login');
    }

    const menu = await getMenu(id, user._id.toString());
    if (!menu) {
        redirect('/dashboard/menus');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Menu: {menu.name}</h1>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <MenuForm initialData={menu} isEditing />
            </Suspense>
        </div>
    );
}