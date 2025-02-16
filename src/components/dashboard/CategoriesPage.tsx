//components/dashboard/CategoriesPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {Eye, EyeOff, ChevronDown, ChevronRight, GripVertical, Plus} from 'lucide-react';

interface Category {
    _id: string;
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
    parentId?: string;
    icon?: string;
    color?: string;
    isVisible: boolean;
    children?: Category[];
}

const NestedDraggable = ({
                             category,
                             index,
                             level = 0,
                             expandedCategories,
                             toggleExpand,
                             toggleVisibility,
                             onEdit,
                             onDelete
                         }: {
    category: Category;
    index: number;
    level?: number;
    expandedCategories: Set<string>;
    toggleExpand: (id: string) => void;
    toggleVisibility: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);

    return (
        <>
            <Draggable draggableId={category._id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                            transition-all duration-200
                            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''}
                            ${level > 0 ? 'ml-6' : ''}
                        `}
                    >
                        <div className={`
                            relative
                            flex items-center justify-between
                            p-4 bg-white rounded-lg
                            border-l-4
                            ${snapshot.isDragging ? 'bg-blue-50' : 'hover:bg-gray-50'}
                            mb-2
                        `}
                             style={{ borderLeftColor: category.color || '#3B82F6' }}
                        >
                            {/* Drag Handle */}
                            <div {...provided.dragHandleProps} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <GripVertical size={18} />
                            </div>

                            <div className="flex items-center gap-3 ml-6">
                                {/* Expand/Collapse Button */}
                                {hasChildren && (
                                    <button
                                        onClick={() => toggleExpand(category._id)}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                )}

                                {/* Icon */}
                                {category.icon && (
                                    <span className="text-xl w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg">
                                        {category.icon}
                                    </span>
                                )}

                                {/* Category Info */}
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{category.nameMK}</h3>
                                    <p className="text-sm text-gray-500">{category.nameEN}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => toggleVisibility(category)}
                                    className={`
                                        p-2 rounded-full transition-colors
                                        ${category.isVisible ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}
                                    `}
                                    title={category.isVisible ? 'Visible' : 'Hidden'}
                                >
                                    {category.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={() => onEdit(category)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => onDelete(category._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>

            {/* Render children if expanded */}
            {hasChildren && isExpanded && (
                <Droppable droppableId={`children-${category._id}`} type={`level-${level + 1}`}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {category.children.map((child, childIndex) => (
                                <NestedDraggable
                                    key={child._id}
                                    category={child}
                                    index={childIndex}
                                    level={level + 1}
                                    expandedCategories={expandedCategories}
                                    toggleExpand={toggleExpand}
                                    toggleVisibility={toggleVisibility}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )}
        </>
    );
};

interface CategoriesPageProps {
    menuId: string;
}

export default function CategoriesPage({ menuId }: CategoriesPageProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState({
        nameMK: '',
        nameEN: '',
        parentId: '',
        icon: '',
        color: '#3B82F6',
        isVisible: true,
        menuId: menuId
    });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (menuId) {
            fetchCategories();
            setNewCategory(prev => ({ ...prev, menuId }));
        }
    }, [menuId]);

    const fetchCategories = async () => {
        try {
            console.log('Fetching categories for menuId:', menuId);
            const url = `/api/categories?menuId=${menuId}`;
            console.log('Fetch URL:', url);

            const response = await fetch(url);
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Raw response data:', data);

            if (response.ok) {
                setCategories(data);
            } else {
                console.error('Error response:', data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const toggleExpand = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleVisibility = async (category: Category) => {
        try {
            const response = await fetch(`/api/categories/${category._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...category,
                    menuId,
                    isVisible: !category.isVisible
                }),
            });

            if (response.ok) {
                fetchCategories();
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };
    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        const sourceId = result.source.droppableId;
        const destinationId = result.destination.droppableId;

        // Handle nested droppables
        if (sourceId.startsWith('children-') || destinationId.startsWith('children-')) {
            // Get parent IDs
            const sourceParentId = sourceId.replace('children-', '');
            const destParentId = destinationId.replace('children-', '');

            // Update parent ID and order
            const draggedItem = findCategoryById(categories, result.draggableId);
            if (draggedItem) {
                const updatedItem = {
                    ...draggedItem,
                    parentId: destParentId === 'categories' ? null : destParentId,
                    order: result.destination.index
                };

                try {
                    await fetch(`/api/categories/${draggedItem._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedItem)
                    });

                    fetchCategories(); // Refresh the list
                } catch (error) {
                    console.error('Error updating category:', error);
                }
            }
            return;
        }

        // Handle top-level reordering
        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setCategories(updatedItems);

        try {
            await Promise.all(updatedItems.map(item =>
                fetch(`/api/categories/${item._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...item,
                        menuId // Add menuId
                    })
                })
            ));
        } catch (error) {
            console.error('Error updating orders:', error);
            fetchCategories();
        }
    };

    const findCategoryById = (categories: Category[], id: string): Category | null => {
        for (const category of categories) {
            if (category._id === id) return category;
            if (category.children) {
                const found = findCategoryById(category.children, id);
                if (found) return found;
            }
        }
        return null;
    };
    const renderCategoryItem = (category: Category, index: number) => (
        <Draggable key={category._id} draggableId={category._id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white mb-2"
                    style={{ borderLeftColor: category.color, borderLeftWidth: 4 }}
                >
                    <div className="flex items-center gap-2">
                        {category.children?.length > 0 && (
                            <button onClick={() => toggleExpand(category._id)}>
                                {expandedCategories.has(category._id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                        )}
                        {category.icon && <span className="text-xl">{category.icon}</span>}
                        <div>
                            <h3 className="font-medium">{category.nameMK}</h3>
                            <p className="text-sm text-gray-500">{category.nameEN}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => toggleVisibility(category)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            {category.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                        <button
                            onClick={() => setEditingCategory(category)}
                            className="p-2 hover:bg-gray-100 rounded-full text-blue-500"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => handleDelete(category._id)}
                            className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );

    // In the CategoriesPage component, update the handleSubmit function:
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const isEditing = !!editingCategory;
        const url = isEditing
            ? `/api/categories/${editingCategory._id}`
            : '/api/categories';

        try {
            console.log('Submitting:', isEditing ? editingCategory : newCategory);
            console.log('URL:', url);
            console.log('Menu ID:', menuId);
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditing ? {
                    ...editingCategory,
                    menuId
                } : {
                    ...newCategory,
                    menuId
                }),
            });

            if (response.ok) {
                if (isEditing) {
                    setEditingCategory(null);
                } else {
                    // Reset form while maintaining menuId
                    setNewCategory({
                        nameMK: '',
                        nameEN: '',
                        parentId: '',
                        icon: '',
                        color: '#3B82F6',
                        isVisible: true,
                        menuId: menuId
                    });
                }
                fetchCategories();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to save category');
            }
        } catch (error) {
            setError('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Дали сте сигурни дека сакате да ја избришете оваа категорија?')) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchCategories();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete category');
            }
        } catch (error) {
            setError('Failed to delete category');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Управувај со Категории</h1>
                <button
                    onClick={() => setEditingCategory(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={18} />
                    Нова Категорија
                </button>
            </div>
            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Име (Македонски)
                        </label>
                        <input
                            type="text"
                            value={editingCategory ? editingCategory.nameMK : newCategory.nameMK}
                            onChange={(e) => editingCategory
                                ? setEditingCategory({...editingCategory, nameMK: e.target.value})
                                : setNewCategory({...newCategory, nameMK: e.target.value})
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name (English)
                        </label>
                        <input
                            type="text"
                            value={editingCategory ? editingCategory.nameEN : newCategory.nameEN}
                            onChange={(e) => editingCategory
                                ? setEditingCategory({...editingCategory, nameEN: e.target.value})
                                : setNewCategory({...newCategory, nameEN: e.target.value})
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Category
                            </label>
                            <select
                                value={editingCategory?.parentId || newCategory.parentId}
                                onChange={(e) => editingCategory
                                    ? setEditingCategory({...editingCategory, parentId: e.target.value})
                                    : setNewCategory({...newCategory, parentId: e.target.value})
                                }
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="">None (Top Level)</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.nameMK}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Icon (Emoji)
                            </label>
                            <input
                                type="text"
                                value={editingCategory?.icon || newCategory.icon}
                                onChange={(e) => editingCategory
                                    ? setEditingCategory({...editingCategory, icon: e.target.value})
                                    : setNewCategory({...newCategory, icon: e.target.value})
                                }
                                className="w-full p-2 border rounded-lg"
                                placeholder="📱"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <input
                                type="color"
                                value={editingCategory?.color || newCategory.color}
                                onChange={(e) => editingCategory
                                    ? setEditingCategory({...editingCategory, color: e.target.value})
                                    : setNewCategory({...newCategory, color: e.target.value})
                                }
                                className="w-full p-1 border rounded-lg h-10"
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingCategory?.isVisible ?? newCategory.isVisible}
                                    onChange={(e) => editingCategory
                                        ? setEditingCategory({...editingCategory, isVisible: e.target.checked})
                                        : setNewCategory({...newCategory, isVisible: e.target.checked})
                                    }
                                    className="rounded text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Visible</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 ${
                                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white py-2 px-4 rounded-lg`}
                        >
                            {loading ? 'Се зачувува...' : editingCategory ? 'Зачувај Промени' : 'Додади Категорија'}
                        </button>

                        {editingCategory && (
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
                            >
                                Откажи
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="categories" type="level-0" isDropDisabled={false}
                        >
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {categories.map((category, index) => (
                                        <NestedDraggable
                                            key={category._id}
                                            category={category}
                                            index={index}
                                            expandedCategories={expandedCategories}
                                            toggleExpand={toggleExpand}
                                            toggleVisibility={toggleVisibility}
                                            onEdit={setEditingCategory}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {categories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-3">📋</div>
                            <p className="text-gray-500">
                                Сѐ уште немате додадено категории
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}