'use client';

import { Category } from '@/types/menu';

interface CategoryItemProps {
    category: Category;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CategoryItem({ 
    category, 
    isSelected, 
    onSelect, 
    onEdit, 
    onDelete 
}: CategoryItemProps) {
    return (
        <div
            className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={onSelect}
        >
            <div className="flex items-center space-x-3">
                {/* Icon */}
                <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: category.color + '20' }}
                >
                    {category.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium truncate ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                            {category.name}
                        </h4>
                        
                        {/* Visibility indicator */}
                        {!category.isVisible && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Hidden
                            </span>
                        )}
                    </div>
                    
                    {category.description && (
                        <p className={`text-xs truncate mt-1 ${
                            isSelected ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit category"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete category"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
                <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-l-lg"></div>
            )}
        </div>
    );
} 