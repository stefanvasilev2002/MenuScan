'use client';

import { useState } from 'react';
import { Category } from '@/types/menu';
import { apiRequest, errorMessage } from '@/lib/client-api';
import { buildCategoryTree, flattenCategoryTree } from '@/lib/category-tree';
import { moveId, type MoveDirection } from '@/lib/reorder';
import type { CategoryCreateInput } from '@/lib/validation';
import CategoryForm from './CategoryForm';
import CategoryItem from './CategoryItem';

interface CategoryManagerProps {
    restaurantSlug: string;
    categories: Category[];
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string | null) => void;
    onCategoryCreated: (category: Category) => void;
    onCategoryUpdated: (category: Category) => void;
    onCategoryDeleted: (categoryId: string) => void;
    onCategoriesReordered: (categories: Category[]) => void;
}

export default function CategoryManager({
    restaurantSlug,
    categories,
    selectedCategory,
    onCategorySelect,
    onCategoryCreated,
    onCategoryUpdated,
    onCategoryDeleted,
    onCategoriesReordered
}: CategoryManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState<string | null>(null);
    const baseUrl = `/api/restaurant/${restaurantSlug}/categories`;

    const run = async (action: () => Promise<void>) => {
        setError(null);
        try {
            await action();
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    const handleCreateCategory = (data: CategoryCreateInput) => run(async () => {
        const newCategory = await apiRequest<Category>(baseUrl, { method: 'POST', body: JSON.stringify(data) });
        onCategoryCreated(newCategory);
        setIsCreating(false);
    });

    const handleUpdateCategory = (categoryId: string, data: CategoryCreateInput) => run(async () => {
        const updatedCategory = await apiRequest<Category>(`${baseUrl}/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        onCategoryUpdated(updatedCategory);
        setEditingCategory(null);
    });

    const handleDeleteCategory = (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category? Its subcategories and all their menu items will also be deleted.')) {
            return;
        }
        return run(async () => {
            await apiRequest(`${baseUrl}/${categoryId}`, { method: 'DELETE' });
            onCategoryDeleted(categoryId);
        });
    };

    const sortedCategories = flattenCategoryTree(buildCategoryTree(categories));
    const siblingIds = (parentId: string | null | undefined) =>
        sortedCategories.filter(({ category }) => (category.parentId ?? null) === (parentId ?? null)).map(({ category }) => category._id);

    const handleMoveCategory = (category: Category, direction: MoveDirection) => {
        const orderedIds = moveId(siblingIds(category.parentId), category._id, direction);
        if (!orderedIds) {
            return;
        }
        return run(async () => {
            const updated = await apiRequest<Category[]>(`${baseUrl}/reorder`, {
                method: 'PUT',
                body: JSON.stringify({ parentId: category.parentId ?? null, orderedIds }),
            });
            onCategoriesReordered(updated);
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                        <p className="text-sm text-gray-500 mt-1">Organize your menu items</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {error && (
                    <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {isCreating && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <CategoryForm
                            categories={categories}
                            onSubmit={handleCreateCategory}
                            onCancel={() => setIsCreating(false)}
                            submitLabel="Create Category"
                        />
                    </div>
                )}

                {editingCategory && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <CategoryForm
                            key={editingCategory._id}
                            categories={categories}
                            category={editingCategory}
                            onSubmit={(data) => handleUpdateCategory(editingCategory._id, data)}
                            onCancel={() => setEditingCategory(null)}
                            submitLabel="Update Category"
                        />
                    </div>
                )}

                <div className="space-y-3">
                    {sortedCategories.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Get started by creating your first category to organize your menu items.
                            </p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create First Category
                            </button>
                        </div>
                    ) : (
                        <>
                            {sortedCategories.map(({ category, depth }) => (
                                <CategoryItem
                                    key={category._id}
                                    depth={depth}
                                    category={category}
                                    isSelected={selectedCategory === category._id}
                                    onSelect={() => onCategorySelect(category._id)}
                                    onEdit={() => setEditingCategory(category)}
                                    onDelete={() => handleDeleteCategory(category._id)}
                                    canMoveUp={siblingIds(category.parentId)[0] !== category._id}
                                    canMoveDown={siblingIds(category.parentId).at(-1) !== category._id}
                                    onMove={(direction) => handleMoveCategory(category, direction)}
                                />
                            ))}
                            
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => onCategorySelect(null)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        selectedCategory === null
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                        All Items
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 