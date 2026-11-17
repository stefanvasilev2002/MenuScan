export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function userImageFolder(userId: string) {
    return `menuscan/${userId}`;
}

export function isOwnImage(publicId: string, userId: string) {
    return publicId.startsWith(`${userImageFolder(userId)}/`) && !publicId.includes('..');
}
