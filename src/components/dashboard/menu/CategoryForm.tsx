'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/menu';

interface CategoryFormProps {
    category?: Category;
    onSubmit: (data: CreateCategoryData | UpdateCategoryData) => void;
    onCancel: () => void;
    submitLabel: string;
}

const ICON_OPTIONS = [
    '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🥙', '🥪',
    '🍜', '🍝', '🍛', '🍚', '🍙', '🍘', '🍱', '🥘', '🍲', '🥣',
    '🥗', '🥙', '🥪', '🌮', '🌯', '🥗', '🥙', '🥪', '🌮', '🌯',
    '🍣', '🍤', '🍥', '🍡', '🍧', '🍨', '🍩', '🍪', '🎂', '🧁',
    '🥧', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕',
    '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍷', '🍸', '🍹', '🍾',
    '🥂', '🥃', '🍻', '🍽️', '🍴', '🥄', '🔪', '🏺', '🌶️', '🧂'
];

const COLOR_OPTIONS = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' }
];

export default function CategoryForm({ category, onSubmit, onCancel, submitLabel }: CategoryFormProps) {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        icon: category?.icon || '🍽️',
        color: category?.color || '#3B82F6',
        isVisible: category?.isVisible ?? true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }

        if (formData.name.length > 50) {
            newErrors.name = 'Category name must be less than 50 characters';
        }

        if (formData.description && formData.description.length > 200) {
            newErrors.description = 'Description must be less than 200 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Appetizers, Main Dishes, Desserts"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Optional description for this category"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                </label>
                <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {ICON_OPTIONS.map((icon, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleInputChange('icon', icon)}
                            className={`w-8 h-8 text-lg flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
                                formData.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : ''
                            }`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => handleInputChange('color', color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                formData.color === color.value 
                                    ? 'border-gray-800 scale-110' 
                                    : 'border-gray-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisible}
                    onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-700">
                    Visible to customers
                </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
} 