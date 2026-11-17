import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const trimmed = (max: number, label: string) =>
    z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

const optionalText = (max: number, label: string) =>
    z.string().trim().max(max, `${label} must be at most ${max} characters`);

const tagList = z.array(z.string().trim().min(1).max(40)).max(30);

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/\d/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    businessName: trimmed(100, 'Business name'),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required').max(128),
});

export const restaurantCreateSchema = z.object({
    name: trimmed(100, 'Restaurant name'),
    description: optionalText(500, 'Description').optional().default(''),
});

export const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, 'Color must be a hex value like #3B82F6');

export const categoryCreateSchema = z.object({
    name: trimmed(50, 'Category name'),
    description: optionalText(200, 'Description').optional().default(''),
    icon: z.string().trim().min(1).max(16).optional().default('🍽️'),
    color: hexColorSchema.optional().default('#3B82F6'),
    isVisible: z.boolean().optional().default(true),
    parentId: objectIdSchema.nullable().optional().default(null),
});

export const categoryUpdateSchema = z
    .object({
        parentId: objectIdSchema.nullable(),
        name: trimmed(50, 'Category name'),
        description: optionalText(200, 'Description'),
        icon: z.string().trim().min(1).max(16),
        color: hexColorSchema,
        isVisible: z.boolean(),
    })
    .partial()
    .strict();

export const MAX_PRICE = 1_000_000;

const priceSchema = z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(MAX_PRICE, `Price must be at most ${MAX_PRICE}`);

const preparationTimeSchema = z.coerce
    .number()
    .int('Preparation time must be a whole number of minutes')
    .min(1, 'Preparation time must be between 1 and 480 minutes')
    .max(480, 'Preparation time must be between 1 and 480 minutes');

const imageUrlSchema = z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || /^https:\/\/res\.cloudinary\.com\//.test(v), 'Image must be uploaded through MenuScan');

const menuItemFields = {
    name: trimmed(100, 'Item name'),
    description: optionalText(500, 'Description'),
    price: priceSchema,
    categoryId: objectIdSchema,
    imageUrl: imageUrlSchema,
    imagePublicId: z.string().trim().max(200),
    isAvailable: z.boolean(),
    isVegetarian: z.boolean(),
    isVegan: z.boolean(),
    isSpicy: z.boolean(),
    allergens: tagList,
    ingredients: tagList,
    preparationTime: preparationTimeSchema.nullable(),
};

export const menuItemCreateSchema = z.object({
    ...menuItemFields,
    description: menuItemFields.description.optional().default(''),
    imageUrl: menuItemFields.imageUrl.optional().default(''),
    imagePublicId: menuItemFields.imagePublicId.optional().default(''),
    isAvailable: z.boolean().optional().default(true),
    isVegetarian: z.boolean().optional().default(false),
    isVegan: z.boolean().optional().default(false),
    isSpicy: z.boolean().optional().default(false),
    allergens: tagList.optional().default([]),
    ingredients: tagList.optional().default([]),
    preparationTime: menuItemFields.preparationTime.optional().default(null),
});

export const menuItemUpdateSchema = z.object(menuItemFields).partial().strict();

export const deleteImageSchema = z.object({
    publicId: z.string().trim().min(1).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
    const result: Record<string, string> = {};
    for (const issue of error.issues) {
        const key = issue.path.join('.') || '_form';
        if (!result[key]) {
            result[key] = issue.message;
        }
    }
    return result;
}
