import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const cloudinaryMock = vi.hoisted(() => ({
    config: vi.fn(),
    uploader: {
        upload: vi.fn(async () => ({ secure_url: 'https://res.cloudinary.com/test/image/upload/x.jpg', public_id: 'menuscan/u/x' })),
        destroy: vi.fn(async () => ({ result: 'ok' })),
    },
}));

vi.mock('cloudinary', () => ({ v2: cloudinaryMock }));

import { DELETE, POST } from '@/app/api/upload/route';
import { signToken } from '@/lib/session';
import { call } from '../helpers/http';

const userId = '64b7f9f1c2a4b5d6e7f80912';

function uploadRequest(file: Blob | null, token?: string) {
    const form = new FormData();
    if (file) {
        form.append('image', file, 'photo');
    }
    return new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: form,
        headers: token ? { Cookie: `auth_token=${token}` } : undefined,
    });
}

const noParams = { params: Promise.resolve({}) };

describe('POST /api/upload', () => {
    let token: string;
    beforeEach(async () => {
        token = await signToken(userId);
    });

    it('requires authentication', async () => {
        const res = await POST(uploadRequest(new Blob(['x'], { type: 'image/png' })), noParams);
        expect(res.status).toBe(401);
        expect(cloudinaryMock.uploader.upload).not.toHaveBeenCalled();
    });

    it('rejects non-image files', async () => {
        const res = await POST(uploadRequest(new Blob(['<svg/>'], { type: 'image/svg+xml' }), token), noParams);
        expect(res.status).toBe(400);
    });

    it('rejects files over 5MB', async () => {
        const big = new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/jpeg' });
        const res = await POST(uploadRequest(big, token), noParams);
        expect(res.status).toBe(413);
    });

    it("uploads into the user's own folder", async () => {
        const res = await POST(uploadRequest(new Blob(['img'], { type: 'image/jpeg' }), token), noParams);
        expect(res.status).toBe(201);
        expect(cloudinaryMock.uploader.upload).toHaveBeenCalledWith(
            expect.stringMatching(/^data:image\/jpeg;base64,/),
            expect.objectContaining({ folder: `menuscan/${userId}` }),
        );
    });
});

describe('DELETE /api/upload', () => {
    it('requires authentication', async () => {
        const res = await call(DELETE, 'DELETE', { body: { publicId: `menuscan/${userId}/a` } });
        expect(res.status).toBe(401);
    });

    it("refuses to delete images outside the user's folder", async () => {
        const token = await signToken(userId);
        for (const publicId of ['menuscan/someone-else/a', 'menu-items/a', `menuscan/${userId}/../other/a`]) {
            const res = await call(DELETE, 'DELETE', { token, body: { publicId } });
            expect(res.status).toBe(403);
        }
        expect(cloudinaryMock.uploader.destroy).not.toHaveBeenCalled();
    });

    it("deletes the user's own image", async () => {
        const token = await signToken(userId);
        const res = await call(DELETE, 'DELETE', { token, body: { publicId: `menuscan/${userId}/photo` } });
        expect(res.status).toBe(200);
        expect(cloudinaryMock.uploader.destroy).toHaveBeenCalledWith(`menuscan/${userId}/photo`);
    });
});
