//api/categories/[id]/route.ts
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { NextResponse } from 'next/server';
function slugify(text: string): string {
    // Transliteration map for Cyrillic to Latin
    const cyrillicToLatin: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'ѓ': 'gj', 'е': 'e', 'ж': 'zh', 'з': 'z', 'ѕ': 'dz',
        'и': 'i', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj',
        'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'ќ': 'kj', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'џ': 'dj',
        'ш': 'sh',
        // Add uppercase variants
        'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd',
        'Ѓ': 'gj', 'Е': 'e', 'Ж': 'zh', 'З': 'z', 'Ѕ': 'dz',
        'И': 'i', 'Ј': 'j', 'К': 'k', 'Л': 'l', 'Љ': 'lj',
        'М': 'm', 'Н': 'n', 'Њ': 'nj', 'О': 'o', 'П': 'p',
        'Р': 'r', 'С': 's', 'Т': 't', 'Ќ': 'kj', 'У': 'u',
        'Ф': 'f', 'Х': 'h', 'Ц': 'c', 'Ч': 'ch', 'Џ': 'dj',
        'Ш': 'sh'
    };

    // Transliterate Cyrillic to Latin
    const transliterated = text.split('').map(char => cyrillicToLatin[char] || char).join('');

    return transliterated
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')    // Remove non-word chars
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/--+/g, '-')        // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start
        .replace(/-+$/, '');         // Trim - from end
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        // First, check if category has children
        const hasChildren = await Category.exists({ parentId: params.id });
        if (hasChildren) {
            return NextResponse.json(
                { error: 'Cannot delete category with subcategories' },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndDelete(params.id);

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Reorder remaining categories
        const remainingCategories = await Category.find({
            parentId: category.parentId
        }).sort('order');

        for (let i = 0; i < remainingCategories.length; i++) {
            await Category.findByIdAndUpdate(remainingCategories[i]._id, {
                order: i
            });
        }

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Check for circular reference in parentId
        if (body.parentId) {
            if (body.parentId === params.id) {
                return NextResponse.json(
                    { error: 'Category cannot be its own parent' },
                    { status: 400 }
                );
            }

            let currentParent = await Category.findById(body.parentId);
            while (currentParent?.parentId) {
                if (currentParent.parentId.toString() === params.id) {
                    return NextResponse.json(
                        { error: 'Circular reference detected in category hierarchy' },
                        { status: 400 }
                    );
                }
                currentParent = await Category.findById(currentParent.parentId);
            }
        }

        const categoryData = {
            ...body,
            slug: slugify(body.nameMK),
            parentId: body.parentId || null,
            color: body.color || '#3B82F6',
            isVisible: body.isVisible ?? true
        };

        // Update the category
        const category = await Category.findByIdAndUpdate(
            params.id,
            categoryData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Manually populate the virtual children field
        const populatedCategory = await Category.findById(category._id).populate('children');

        return NextResponse.json(populatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const category = await Category.findById(params.id).populate('children');

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}