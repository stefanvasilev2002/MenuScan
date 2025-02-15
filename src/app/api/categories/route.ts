//api/categories/route.ts
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const menuId = searchParams.get('menuId');

        if (!menuId) {
            return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
        }

        // Fetch all categories for the menu
        const allCategories = await Category.find({ menuId }).sort({ order: 1 });

        // Build the hierarchy
        const categoryMap = new Map();
        allCategories.forEach(category => {
            categoryMap.set(category._id.toString(), {
                ...category.toObject(),
                children: []
            });
        });

        const rootCategories = [];
        allCategories.forEach(category => {
            const categoryObj = categoryMap.get(category._id.toString());
            if (category.parentId) {
                const parent = categoryMap.get(category.parentId.toString());
                if (parent) {
                    parent.children.push(categoryObj);
                }
            } else {
                rootCategories.push(categoryObj);
            }
        });

        return NextResponse.json(rootCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        console.log('Received body:', body);

        if (!body.menuId) {
            return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
        }

        const categoryData = {
            menuId: new mongoose.Types.ObjectId(body.menuId),
            nameMK: body.nameMK,
            nameEN: body.nameEN,
            slug: slugify(body.nameMK),
            order: body.order || 0,
            parentId: body.parentId ? new mongoose.Types.ObjectId(body.parentId) : null,
            icon: body.icon || null,
            color: body.color || '#3B82F6',
            isVisible: body.isVisible ?? true,
        };

        console.log('Creating category with data:', categoryData);

        const category = await Category.create(categoryData);
        console.log('Raw created document:', category.toObject()); // Log raw document

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
