//dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MenuDashboard } from '@/components/dashboard/MenuDashboard';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/Menu';
import { connectToDatabase } from '@/lib/db';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await getCurrentUser(token);
    if (!user) {
        redirect('/login');
    }

    // Connect to database and fetch user's primary menu
    await connectToDatabase();
    const userMenu = await Menu.findOne({ userId: user._id });

    if (!userMenu) {
        // If user has no menu, redirect to menu creation page
        console.log('User has no menu, redirecting to menu creation page');
        redirect('/dashboard/menu/new');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <MenuDashboard initialMenuId={userMenu._id.toString()} userId={user._id.toString()} />
        </div>
    );
}