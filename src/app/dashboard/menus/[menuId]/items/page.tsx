import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/Menu';
import { connectToDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MenuItemsManager } from '@/components/dashboard/MenuItemsManager';

interface MenuItemsPageProps {
    params: {
        menuId: string;
    };
}

export default async function MenuItemsPage({ params }: MenuItemsPageProps) {
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
    const menu = await Menu.findOne({ _id: menuId, userId: user._id });

    if (!menu) {
        redirect('/dashboard/menus');
    }

    return (
        <div>
            <MenuItemsManager menuId={menuId} menuName={menu.name} userId={user._id.toString()} />
        </div>
    );
}