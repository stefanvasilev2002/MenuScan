import { NextResponse, type NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AUTH_COOKIE, verifyToken } from './session';
import { connectToDatabase } from './db';
import { MissingEnvError } from './env';
import { fieldErrors } from './validation';
import { Restaurant } from '@/models/Restaurant';

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly details?: Record<string, string>,
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export const badRequest = (message: string, details?: Record<string, string>) => new HttpError(400, message, details);
export const unauthorized = (message = 'Unauthorized') => new HttpError(401, message);
export const notFound = (message = 'Not found') => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

export function errorResponse(error: unknown): NextResponse {
    if (error instanceof HttpError) {
        return NextResponse.json(
            error.details ? { error: error.message, details: error.details } : { error: error.message },
            { status: error.status },
        );
    }
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: fieldErrors(error) }, { status: 400 });
    }
    if (error instanceof mongoose.Error.CastError) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
        const details: Record<string, string> = {};
        for (const [key, value] of Object.entries(error.errors)) {
            details[key] = value.message;
        }
        return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
        return NextResponse.json({ error: 'A record with these values already exists' }, { status: 409 });
    }
    if (error instanceof MissingEnvError) {
        console.error(error.message);
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

type RouteContext<P> = { params: Promise<P> };

export function route<P = Record<string, never>>(
    handler: (request: NextRequest, params: P) => Promise<Response>,
) {
    return async (request: NextRequest, context: RouteContext<P>) => {
        try {
            const params = context?.params ? await context.params : ({} as P);
            return await handler(request, params);
        } catch (error) {
            return errorResponse(error);
        }
    };
}

export async function parseJson<S extends z.ZodTypeAny>(request: Request, schema: S): Promise<z.infer<S>> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw badRequest('Request body must be valid JSON');
    }
    const result = schema.safeParse(body);
    if (!result.success) {
        throw new HttpError(400, 'Validation failed', fieldErrors(result.error));
    }
    return result.data;
}

export async function requireUserId(request: NextRequest): Promise<string> {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
        throw unauthorized();
    }
    return payload.userId;
}

export async function requireOwnedRestaurant(request: NextRequest, slug: string) {
    const userId = await requireUserId(request);
    await connectToDatabase();
    const restaurant = await Restaurant.findOne({ slug, userId });
    if (!restaurant) {
        throw notFound('Restaurant not found');
    }
    return { userId, restaurant };
}

export const caseInsensitive = { locale: 'en', strength: 2 } as const;
