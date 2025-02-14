// src/scripts/migrate-menu-items.ts
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Define the MenuItem schema for the migration
const MenuItemSchema = new mongoose.Schema({
    nameMK: {
        type: String,
        required: true,
    },
    nameEN: {
        type: String,
        required: true,
    },
    descriptionMK: {
        type: String,
        default: '',
    },
    descriptionEN: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    ingredients: {
        type: [String],
        default: [],
    },
    allergens: {
        type: [String],
        default: [],
    },
    spicyLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
    },
    isVegetarian: {
        type: Boolean,
        default: false,
    },
    isVegan: {
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

async function migrateMenuItems() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
        console.log('Connected to database');

        // Find all existing menu items
        const menuItems = await MenuItem.find({});
        console.log(`Found ${menuItems.length} menu items to migrate`);

        let updated = 0;
        let errors = 0;

        // Update each item
        for (const item of menuItems) {
            try {
                const updates = {
                    descriptionMK: item.descriptionMK || '',
                    descriptionEN: item.descriptionEN || '',
                    ingredients: item.ingredients || [],
                    allergens: item.allergens || [],
                    spicyLevel: item.spicyLevel || 0,
                    isVegetarian: item.isVegetarian || false,
                    isVegan: item.isVegan || false,
                    order: item.order || 0
                };

                await MenuItem.findByIdAndUpdate(item._id, {
                    $set: updates
                }, { new: true });

                updated++;
                console.log(`Updated item: ${item.nameMK}`);
            } catch (error) {
                errors++;
                console.error(`Error updating item ${item.nameMK}:`, error);
            }
        }

        console.log(`\nMigration completed:`);
        console.log(`- Successfully updated: ${updated} items`);
        console.log(`- Errors encountered: ${errors} items`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
        process.exit(0);
    }
}

// Run the migration
migrateMenuItems();