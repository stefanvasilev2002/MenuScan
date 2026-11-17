import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        clearMocks: true,
        coverage: {
            provider: 'v8',
            include: ['src/lib/**', 'src/app/api/**', 'src/models/**', 'src/components/**'],
            reporter: ['text', 'html'],
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['tests/**/*.test.ts'],
                    setupFiles: ['tests/setup/env.ts'],
                    hookTimeout: 120_000,
                    testTimeout: 30_000,
                },
            },
            {
                extends: true,
                test: {
                    name: 'dom',
                    environment: 'jsdom',
                    include: ['tests/**/*.test.tsx'],
                    setupFiles: ['tests/setup/env.ts', 'tests/setup/dom.ts'],
                },
            },
        ],
    },
});
