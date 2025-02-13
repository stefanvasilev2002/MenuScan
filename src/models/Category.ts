import mongoose, { Schema } from 'mongoose';

// Define the interface
interface ICategory {
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
}

// Create the schema
const CategorySchema = new Schema<ICategory>({
    nameMK: {
        type: String,
        required: [true, 'NameMK is required'],
    },
    nameEN: {
        type: String,
        required: [true, 'NameEN is required'],
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

// Export the model
export const Category = mongoose.models.Category as mongoose.Model<ICategory> || mongoose.model<ICategory>('Category', CategorySchema);