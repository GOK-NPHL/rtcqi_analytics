import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { transformWithEsbuild } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        include: ['jquery', 'bootstrap', 'axios', 'lodash', 'xlsx'],
        esbuildOptions: {
            loader: { '.js': 'jsx', '.jsx': 'jsx' },
        },
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                loadPaths: [path.resolve(__dirname, 'node_modules')],
            },
        },
    },
    plugins: [
        // Transform .js files in resources/js as JSX
        {
            name: 'treat-js-as-jsx',
            async transform(code, id) {
                if (/resources\/js\/.*\.js$/.test(id)) {
                    return transformWithEsbuild(code, id, { loader: 'jsx' });
                }
                if (/node_modules\/.*\.jsx$/.test(id)) {
                    return transformWithEsbuild(code, id, { loader: 'jsx' });
                }
            },
        },
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        react({ include: /\.(jsx|js)$/ }),
    ],
});
