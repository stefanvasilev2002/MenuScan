import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/Category';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const { categoryId, parentId } = await request.json();

        if (!parentId) {
            return NextResponse.json({ valid: true });
        }

        // Check if parent exists
        const parent = await Category.findById(parentId);
        if (!parent) {
            return NextResponse.json({
                valid: false,
                error: 'Parent category not found'
            });
        }

        // Check for circular reference
        let currentParent = parent;
        const visited = new Set([categoryId]);

        while (currentParent) {
            if (visited.has(currentParent._id.toString())) {
                return NextResponse.json({
                    valid: false,
                    error: 'Circular reference detected'
                });
            }
            visited.add(currentParent._id.toString());

            if (!currentParent.parentId) break;
            currentParent = await Category.findById(currentParent.parentId);
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error('Error validating hierarchy:', error);
        return NextResponse.json({
            valid: false,
            error: 'Failed to validate hierarchy'
        });
    }
}