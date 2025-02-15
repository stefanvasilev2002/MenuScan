// app/dashboard/menu/[id]/items/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MenuDashboard } from '@/components/dashboard/MenuDashboard';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/Menu';
import { connectToDatabase } from '@/lib/db';

export default async function MenuItemsPage({
                                                params
                                            }: {
    params: { id: string }
}) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await getCurrentUser(token);
    if (!user) {
        redirect('/login');
    }

    // Connect to database and fetch menu
    await connectToDatabase();
    const menu = await Menu.findById(params.id);

    if (!menu) {
        redirect('/dashboard');
    }

    // Verify ownership
    if (menu.userId.toString() !== user._id.toString()) {
        redirect('/dashboard');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <MenuDashboard initialMenuId={params.id} userId={user._id.toString()} />
        </div>
    );
}