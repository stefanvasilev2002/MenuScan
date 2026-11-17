'use client';

import Image from 'next/image';
import { Category, MenuItem } from '@/types/menu';
import { availabilityOf, type AvailabilityStatus } from '@/lib/availability';
import AvailabilityControl from './AvailabilityControl';

interface MenuItemCardProps {
    item: MenuItem;
    category?: Category;
    onEdit: () => void;
    onDelete: () => void;
    onAvailabilityChange: (status: AvailabilityStatus) => void;
}

export default function MenuItemCard({ 
    item, 
    category, 
    onEdit, 
    onDelete, 
    onAvailabilityChange 
}: MenuItemCardProps) {
    const status = availabilityOf(item);

    return (
        <div className={`group relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all ${
            status !== 'available' ? 'opacity-70' : ''
        }`}>
            {/* Image */}
            <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                
                {status !== 'available' && (
                    <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full ${
                        status === 'hidden' ? 'bg-gray-700' : 'bg-amber-500'
                    }`}>
                        {status === 'hidden' ? 'Hidden from menu' : 'Sold out'}
                    </div>
                )}

                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center space-x-1 bg-white/80 rounded-full">
                    <button
                        onClick={onEdit}
                        aria-label={`Edit ${item.name}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit item"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    
                    <button
                        onClick={onDelete}
                        aria-label={`Delete ${item.name}`}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete item"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="px-4 pt-3">
                <AvailabilityControl
                    value={status}
                    onChange={onAvailabilityChange}
                    label={`Availability of ${item.name}`}
                />
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.name}
                        </h3>
                        {category && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <span 
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: category.color + '40' }}
                                />
                                {category.name}
                            </p>
                        )}
                    </div>
                    <div className="text-right ml-2">
                        <p className="text-lg font-bold text-gray-900">
                            ${item.price.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                    </p>
                )}

                {/* Dietary Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {item.isVegetarian && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🌱 Vegetarian
                        </span>
                    )}
                    {item.isVegan && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🌿 Vegan
                        </span>
                    )}
                    {item.isSpicy && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🌶️ Spicy
                        </span>
                    )}
                </div>

                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Allergens:</p>
                        <div className="flex flex-wrap gap-1">
                            {item.allergens.slice(0, 3).map((allergen) => (
                                <span
                                    key={allergen}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                                >
                                    {allergen}
                                </span>
                            ))}
                            {item.allergens.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{item.allergens.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Preparation Time */}
                {item.preparationTime && (
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.preparationTime} min
                    </div>
                )}
            </div>
        </div>
    );
} 