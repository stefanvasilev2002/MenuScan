import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface IMenuItem {
    restaurantId: Types.ObjectId;
    categoryId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    isHidden: boolean;
    ingredients: string[];
    allergens: string[];
    isSpicy: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    preparationTime: number | null;
    order: number;
    imageUrl: string;
    imagePublicId: string;
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
            index: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            default: '',
            maxlength: 500,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isHidden: {
            type: Boolean,
            default: false,
        },
        ingredients: {
            type: [String],
            default: [],
        },
        allergens: {
            type: [String],
            default: [],
        },
        isSpicy: {
            type: Boolean,
            default: false,
        },
        isVegetarian: {
            type: Boolean,
            default: false,
        },
        isVegan: {
            type: Boolean,
            default: false,
        },
        preparationTime: {
            type: Number,
            default: null,
        },
        order: {
            type: Number,
            default: 0,
        },
        imageUrl: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    },
);

export const MenuItem =
    (mongoose.models.MenuItem as Model<IMenuItem> | undefined) || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
