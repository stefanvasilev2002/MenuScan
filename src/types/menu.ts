export interface MenuItem {
    _id: string;
    nameMK: string;
    nameEN: string;
    descriptionMK?: string;
    descriptionEN?: string;
    price: number;
    category: string;
    isAvailable: boolean;
    ingredients: string[];
    allergens: string[];
    spicyLevel: number;
    isVegetarian: boolean;
    isVegan: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}