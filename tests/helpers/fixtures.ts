import { randomBytes } from 'node:crypto';

export function makeTestPassword(): string {
    return `Tt-${randomBytes(6).toString('hex')}-9`;
}
