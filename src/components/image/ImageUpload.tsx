'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
    const [publicId, setPublicId] = useState<string | undefined>(currentImagePublicId);
    const [isCropping, setIsCropping] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setPreviewUrl(currentImageUrl);
        setPublicId(currentImagePublicId);
    }, [currentImageUrl, currentImagePublicId]);

    // Update dimensions when image loads or container size changes
    useEffect(() => {
        if (containerRef.current && isCropping) {
            const updateDimensions = () => {
                const container = containerRef.current?.getBoundingClientRect();
                if (container) {
                    setContainerDimensions({
                        width: container.width,
                        height: container.height
                    });
                }
            };

            updateDimensions();
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, [isCropping]);

    const handleImageLoad = () => {
        if (imageRef.current) {
            setImageDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight
            });
        }
    };

    const calculateBoundaries = () => {
        if (!containerRef.current || !imageRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

        const container = containerDimensions;
        const image = imageDimensions;

        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        const xLimit = Math.max(0, (scaledWidth - container.width) / 2);
        const yLimit = Math.max(0, (scaledHeight - container.height) / 2);

        return {
            minX: -xLimit,
            maxX: xLimit,
            minY: -yLimit,
            maxY: yLimit
        };
    };

    const constrainPosition = (x: number, y: number) => {
        const bounds = calculateBoundaries();
        return {
            x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
            y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
        };
    };

    const handleDragStart = (e: React.MouseEvent) => {
        if (!isCropping) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleDragMove = (e: React.MouseEvent) => {
        if (!isDragging || !isCropping) return;
        e.preventDefault();

        const newPosition = constrainPosition(
            e.clientX - dragStart.x,
            e.clientY - dragStart.y
        );

        setPosition(newPosition);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            onError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            onError('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreviewUrl(result);
            setScale(1);
            setPosition({ x: 0, y: 0 });
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveChanges = async () => {
        if (!previewUrl || !imageRef.current || !containerRef.current) return;

        try {
            setIsUploading(true);

            // Create a canvas with the actual container dimensions
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            const container = containerRef.current.getBoundingClientRect();
            canvas.width = container.width;
            canvas.height = container.height;

            // Draw the transformed image
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(
                imageRef.current,
                position.x + (canvas.width - imageRef.current.width * scale) / 2,
                position.y + (canvas.height - imageRef.current.height * scale) / 2,
                imageRef.current.width * scale,
                imageRef.current.height * scale
            );
            ctx.restore();

            // Convert to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
            });

            // Delete existing image if there is one
            if (publicId) {
                await fetch(`/api/upload/${publicId}`, {
                    method: 'DELETE',
                });
            }

            // Upload new image
            const formData = new FormData();
            formData.append('image', blob);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            setPreviewUrl(data.url);
            setPublicId(data.publicId);
            onImageUpload(data.url, data.publicId);
            setIsCropping(false);
        } catch (error) {
            onError('Failed to save changes');
            console.error('Save error:', error);
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

            setPreviewUrl(undefined);
            setPublicId(undefined);
            onImageUpload('', '');
            setIsCropping(false);
        } catch (error) {
            onError('Failed to delete image');
            console.error('Delete error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-4">
                {previewUrl ? (
                    <div
                        ref={containerRef}
                        className="relative w-full aspect-video overflow-hidden"
                    >
                        {isCropping ? (
                            <>
                                <div
                                    className="relative w-full h-full cursor-move"
                                    onMouseDown={handleDragStart}
                                    onMouseMove={handleDragMove}
                                    onMouseUp={handleDragEnd}
                                    onMouseLeave={handleDragEnd}
                                >
                                    <img
                                        ref={imageRef}
                                        src={previewUrl}
                                        alt="Preview"
                                        className="absolute transform-gpu"
                                        style={{
                                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                            transformOrigin: 'center',
                                            maxWidth: 'none'
                                        }}
                                        onLoad={handleImageLoad}
                                        draggable={false}
                                    />
                                </div>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow">
                                    <button
                                        type="button"
                                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Zoom Out
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScale(s => Math.min(3, s + 0.1))}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Zoom In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveChanges}
                                        disabled={isUploading}
                                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                                    >
                                        {isUploading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
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
                                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center">
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