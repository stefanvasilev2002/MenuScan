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
            order: body.order || 0
        };

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
        const categories = await Category.find({}).sort({ order: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}