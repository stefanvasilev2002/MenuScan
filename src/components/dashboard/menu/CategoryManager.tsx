'use client';

import { useState } from 'react';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/menu';
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
}

export default function CategoryManager({
    restaurantSlug,
    categories,
    selectedCategory,
    onCategorySelect,
    onCategoryCreated,
    onCategoryUpdated,
    onCategoryDeleted
}: CategoryManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleCreateCategory = async (data: CreateCategoryData) => {
        try {
            const response = await fetch(`/api/restaurant/${restaurantSlug}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create category');
            }

            const newCategory = await response.json();
            onCategoryCreated(newCategory);
            setIsCreating(false);
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category. Please try again.');
        }
    };

    const handleUpdateCategory = async (categoryId: string, data: UpdateCategoryData) => {
        try {
            const response = await fetch(`/api/restaurant/${restaurantSlug}/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update category');
            }

            const updatedCategory = await response.json();
            onCategoryUpdated(updatedCategory);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category. Please try again.');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category? All menu items in this category will also be deleted.')) {
            return;
        }

        try {
            const response = await fetch(`/api/restaurant/${restaurantSlug}/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            onCategoryDeleted(categoryId);
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category. Please try again.');
        }
    };

    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

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
                {isCreating && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <CategoryForm
                            onSubmit={handleCreateCategory}
                            onCancel={() => setIsCreating(false)}
                            submitLabel="Create Category"
                        />
                    </div>
                )}

                {editingCategory && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <CategoryForm
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
                            {sortedCategories.map((category) => (
                                <CategoryItem
                                    key={category._id}
                                    category={category}
                                    isSelected={selectedCategory === category._id}
                                    onSelect={() => onCategorySelect(category._id)}
                                    onEdit={() => setEditingCategory(category)}
                                    onDelete={() => handleDeleteCategory(category._id)}
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