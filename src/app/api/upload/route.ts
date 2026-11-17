import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { badRequest, HttpError, parseJson, requireUserId, route } from '@/lib/api';
import { getCloudinaryConfig } from '@/lib/env';
import { ALLOWED_IMAGE_TYPES, isOwnImage, MAX_UPLOAD_BYTES, userImageFolder } from '@/lib/images';
import { deleteImageSchema } from '@/lib/validation';

export const POST = route(async (request) => {
    const userId = await requireUserId(request);

    const formData = await request.formData().catch(() => {
        throw badRequest('Expected multipart form data');
    });
    const file = formData.get('image');

    if (!(file instanceof Blob) || file.size === 0) {
        throw badRequest('No file uploaded');
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw badRequest('Only JPEG, PNG, WebP or GIF images are allowed');
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new HttpError(413, 'Image must be 5MB or smaller');
    }

    cloudinary.config(getCloudinaryConfig());
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await cloudinary.uploader.upload(`data:${file.type};base64,${buffer.toString('base64')}`, {
        folder: userImageFolder(userId),
        transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
        ],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id }, { status: 201 });
});

export const DELETE = route(async (request) => {
    const userId = await requireUserId(request);
    const { publicId } = await parseJson(request, deleteImageSchema);

    if (!isOwnImage(publicId, userId)) {
        throw new HttpError(403, 'You can only delete your own images');
    }

    cloudinary.config(getCloudinaryConfig());
    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ success: true });
});
