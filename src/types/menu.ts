export interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    order: number;
    isVisible: boolean;
    parentId?: string | null;
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
    preparationTime?: number | null;
    order: number;
    restaurantId: string;
    createdAt: Date;
    updatedAt: Date;
}
