export interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    order: number;
    isVisible: boolean;
    restaurantId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    imagePublicId?: string;
    isAvailable: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isSpicy?: boolean;
    allergens?: string[];
    ingredients?: string[];
    preparationTime?: number; // in minutes
    order: number;
    restaurantId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryData {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isVisible?: boolean;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isVisible?: boolean;
    order?: number;
}

export interface CreateMenuItemData {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    imagePublicId?: string;
    isAvailable?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isSpicy?: boolean;
    allergens?: string[];
    ingredients?: string[];
    preparationTime?: number;
}

export interface UpdateMenuItemData {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    imageUrl?: string;
    imagePublicId?: string;
    isAvailable?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isSpicy?: boolean;
    allergens?: string[];
    ingredients?: string[];
    preparationTime?: number;
    order?: number;
}