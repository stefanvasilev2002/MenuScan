import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from '@/lib/env';


export async function POST(request: Request) {
    try {
        cloudinary.config(getCloudinaryConfig());
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64File, {
            folder: 'menu-items',
            transformation: [
                { width: 800, height: 600, crop: 'fill' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}