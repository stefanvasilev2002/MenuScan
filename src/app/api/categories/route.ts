import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { NextResponse } from 'next/server';

function slugify(text: string): string {
    const cyrillicToLatin: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'ѓ': 'gj', 'е': 'e', 'ж': 'zh', 'з': 'z', 'ѕ': 'dz',
        'и': 'i', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj',
        'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'ќ': 'kj', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'џ': 'dj',
        'ш': 'sh',
        // Uppercase variants
        'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd',
        'Ѓ': 'gj', 'Е': 'e', 'Ж': 'zh', 'З': 'z', 'Ѕ': 'dz',
        'И': 'i', 'Ј': 'j', 'К': 'k', 'Л': 'l', 'Љ': 'lj',
        'М': 'm', 'Н': 'n', 'Њ': 'nj', 'О': 'o', 'П': 'p',
        'Р': 'r', 'С': 's', 'Т': 't', 'Ќ': 'kj', 'У': 'u',
        'Ф': 'f', 'Х': 'h', 'Ц': 'c', 'Ч': 'ch', 'Џ': 'dj',
        'Ш': 'sh'
    };

    const transliterated = text.split('').map(char => cyrillicToLatin[char] || char).join('');

    return transliterated
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Generate slug from Macedonian name
        const slug = slugify(body.nameMK);

        const categoryData = {
            nameMK: body.nameMK,
            nameEN: body.nameEN,
            slug: slug,
            order: body.order || 0,
            parentId: body.parentId || null,
            icon: body.icon || null,
            color: body.color || '#3B82F6',
            isVisible: body.isVisible ?? true
        };

        // Check if parent exists if parentId is provided
        if (categoryData.parentId) {
            const parentExists = await Category.findById(categoryData.parentId);
            if (!parentExists) {
                return NextResponse.json(
                    { error: 'Parent category not found' },
                    { status: 400 }
                );
            }
        }

        console.log('Creating category with data:', categoryData);

        const category = await Category.create(categoryData);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            {
                error: 'Failed to create category',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        // Populate children virtual field and sort by order
        const categories = await Category.find({})
            .populate({
                path: 'children',
                options: { sort: { order: 1 } }
            })
            .sort({ order: 1 });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}