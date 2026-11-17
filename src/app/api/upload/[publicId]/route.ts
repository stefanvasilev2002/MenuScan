import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from '@/lib/env';


export async function DELETE(
    request: Request,
    { params }: { params: { publicId: string } }
) {
    try {
        cloudinary.config(getCloudinaryConfig());
        const aa = await cloudinary.uploader.destroy(params.publicId);
        console.log('image delete', aa);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}