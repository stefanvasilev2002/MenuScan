'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
    currentImageUrl?: string;
    currentImagePublicId?: string;
    onImageUpload: (imageUrl: string, publicId: string) => void;
    onError: (error: string) => void;
}

export default function ImageUpload({
                                        currentImageUrl,
                                        currentImagePublicId,
                                        onImageUpload,
                                        onError
                                    }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
    const [publicId, setPublicId] = useState(currentImagePublicId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            onError('Please upload an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            onError('Image size should be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);

            // Delete existing image if there is one
            if (publicId) {
                await fetch(`/api/upload/${publicId}`, {
                    method: 'DELETE',
                });
            }

            // Upload new image
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            setPreviewUrl(data.url);
            setPublicId(data.publicId);
            onImageUpload(data.url, data.publicId);
        } catch (error) {
            onError('Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!publicId) return;

        try {
            setIsUploading(true);
            await fetch(`/api/upload/${publicId}`, {
                method: 'DELETE',
            });

            setPreviewUrl('');
            setPublicId('');
            onImageUpload('', '');
        } catch (error) {
            onError('Failed to delete image');
            console.error('Delete error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file && fileInputRef.current) {
            fileInputRef.current.files = e.dataTransfer.files;
            handleImageChange({ target: { files: e.dataTransfer.files } } as any);
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    isUploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {previewUrl ? (
                    <div className="relative w-full aspect-video">
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isUploading}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:bg-gray-400"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="py-8">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                            or drag and drop an image here
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            PNG, JPG, WebP up to 5MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}