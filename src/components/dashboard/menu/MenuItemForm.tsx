'use client';

import { useState, useEffect } from 'react';
import { Category, MenuItem, CreateMenuItemData, UpdateMenuItemData } from '@/types/menu';
import ImageUpload from '@/components/image/ImageUpload';

interface MenuItemFormProps {
    item?: MenuItem;
    categories: Category[];
    selectedCategoryId?: string | null;
    onSubmit: (data: CreateMenuItemData | UpdateMenuItemData) => void;
    onCancel: () => void;
    submitLabel: string;
}

const ALLERGEN_OPTIONS = [
    'Gluten', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 
    'Peanuts', 'Soybeans', 'Wheat', 'Sesame', 'Sulfites'
];

export default function MenuItemForm({ 
    item, 
    categories, 
    selectedCategoryId,
    onSubmit, 
    onCancel, 
    submitLabel 
}: MenuItemFormProps) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || '',
        categoryId: item?.categoryId || selectedCategoryId || '',
        imageUrl: item?.imageUrl || '',
        imagePublicId: item?.imagePublicId || '',
        isAvailable: item?.isAvailable ?? true,
        isVegetarian: item?.isVegetarian || false,
        isVegan: item?.isVegan || false,
        isSpicy: item?.isSpicy || false,
        allergens: item?.allergens || [],
        ingredients: item?.ingredients || [],
        preparationTime: item?.preparationTime || ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Item name is required';
        }

        if (formData.name.length > 100) {
            newErrors.name = 'Item name must be less than 100 characters';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        if (formData.preparationTime && (parseInt(formData.preparationTime) < 1 || parseInt(formData.preparationTime) > 480)) {
            newErrors.preparationTime = 'Preparation time must be between 1 and 480 minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined
            };
            await onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAllergenToggle = (allergen: string) => {
        const currentAllergens = formData.allergens;
        const newAllergens = currentAllergens.includes(allergen)
            ? currentAllergens.filter(a => a !== allergen)
            : [...currentAllergens, allergen];
        
        handleInputChange('allergens', newAllergens);
    };

    const handleIngredientAdd = (ingredient: string) => {
        if (ingredient.trim() && !formData.ingredients.includes(ingredient.trim())) {
            handleInputChange('ingredients', [...formData.ingredients, ingredient.trim()]);
        }
    };

    const handleIngredientRemove = (ingredient: string) => {
        handleInputChange('ingredients', formData.ingredients.filter(i => i !== ingredient));
    };

    const handleImageUpload = (imageUrl: string, imagePublicId: string) => {
        setFormData(prev => ({
            ...prev,
            imageUrl,
            imagePublicId
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Margherita Pizza"
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
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Describe your item..."
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                id="price"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                step="0.01"
                                min="0"
                                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.price ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            id="categoryId"
                            value={formData.categoryId}
                            onChange={(e) => handleInputChange('categoryId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.categoryId ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Preparation Time (minutes)
                        </label>
                        <input
                            type="number"
                            id="preparationTime"
                            value={formData.preparationTime}
                            onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                            min="1"
                            max="480"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.preparationTime ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 15"
                        />
                        {errors.preparationTime && (
                            <p className="mt-1 text-sm text-red-600">{errors.preparationTime}</p>
                        )}
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Image
                        </label>
                        <ImageUpload
                            currentImageUrl={formData.imageUrl}
                            onImageUpload={handleImageUpload}
                            folder="menu-items"
                        />
                    </div>

                    {/* Dietary Options */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Dietary Options
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isVegetarian}
                                    onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isVegan}
                                    onChange={(e) => handleInputChange('isVegan', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Vegan</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isSpicy}
                                    onChange={(e) => handleInputChange('isSpicy', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Spicy</span>
                            </label>
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Available for ordering</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Allergens */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ALLERGEN_OPTIONS.map((allergen) => (
                        <label key={allergen} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.allergens.includes(allergen)}
                                onChange={() => handleAllergenToggle(allergen)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Ingredients */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                </label>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add an ingredient..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleIngredientAdd(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                handleIngredientAdd(input.value);
                                input.value = '';
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Add
                        </button>
                    </div>
                    {formData.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.ingredients.map((ingredient, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {ingredient}
                                    <button
                                        type="button"
                                        onClick={() => handleIngredientRemove(ingredient)}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Form Actions */}
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
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
} 