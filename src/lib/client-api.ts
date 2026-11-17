export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly details: Record<string, string> = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, { ...init, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const details = (data?.details ?? {}) as Record<string, string>;
        const firstDetail = Object.values(details)[0];
        throw new ApiError(response.status, firstDetail || data?.error || 'Something went wrong', details);
    }
    return data as T;
}

export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong';
}
