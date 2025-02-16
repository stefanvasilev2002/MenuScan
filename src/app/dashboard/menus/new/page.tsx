// app/dashboard/menus/new/CategoriesPage.tsx
import { MenuForm } from '@/components/dashboard/MenuForm';

export default function NewMenuPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Create New Menu</h1>
            </div>
            <MenuForm />
        </div>
    );
}