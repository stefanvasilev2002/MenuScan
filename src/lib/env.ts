const REQUIRED_SERVER_ENV = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
] as const;

export type ServerEnvKey = (typeof REQUIRED_SERVER_ENV)[number];

export class MissingEnvError extends Error {
    constructor(name: string) {
        super(`Missing required environment variable: ${name}. See .env.example.`);
        this.name = 'MissingEnvError';
    }
}

export function requireEnv(name: ServerEnvKey): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new MissingEnvError(name);
    }
    return value;
}

export function getJwtSecret(): Uint8Array {
    return new TextEncoder().encode(requireEnv('JWT_SECRET'));
}

export function getCloudinaryConfig() {
    return {
        cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
        api_key: requireEnv('CLOUDINARY_API_KEY'),
        api_secret: requireEnv('CLOUDINARY_API_SECRET'),
    };
}

export function getPublicBaseUrl(): string {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
