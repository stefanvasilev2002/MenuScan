// app/dashboard/menus/[id]/items/new/CategoriesPage.tsx
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/Menu';
import { connectToDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';
import NewItemForm from '@/components/dashboard/NewItemForm';

interface NewItemPageProps {
    params: {
        menuId: string;
    };
}

export default async function NewItemPage({ params }: NewItemPageProps) {
    const { menuId } = params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await getCurrentUser(token);
    if (!user) {
        redirect('/login');
    }

    await connectToDatabase();
    console.log('id from new item page:', menuId);
    console.log('user from new item page:', user);
    const menu = await Menu.findOne({ _id: menuId, userId: user._id });

    if (!menu) {
        console.log('Menu not found, from new item page');
        redirect('/dashboard/menus');
    }

    const id = menuId;
    return (
        <div>
            <NewItemForm id={id} />
        </div>
    );
}