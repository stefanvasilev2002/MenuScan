import CategoriesPage from '@/components/dashboard/CategoriesPage';

export default function CategoryManagerPage({params,}: { params: { menuId: string }; }) {
    return <CategoriesPage menuId={params.menuId} />;
}