export type ServerEnvKey =
    | 'MONGODB_URI'
    | 'JWT_SECRET'
    | 'CLOUDINARY_CLOUD_NAME'
    | 'CLOUDINARY_API_KEY'
    | 'CLOUDINARY_API_SECRET';

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

export function resolveBaseUrl(host: string | null, protocol: string | null): string {
    const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    if (configured) {
        return configured.replace(/\/+$/, '');
    }
    if (host) {
        const proto = protocol ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
        return `${proto}://${host}`;
    }
    return 'http://localhost:3000';
}
