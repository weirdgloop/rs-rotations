import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: undefined,
            precompress: false,
            strict: true,
            typescript: true
        }),
        paths: {
            base: '/rs-rot',
        },
        alias: {
            $components: path.resolve('src/components'),
            $lib: path.resolve('src/lib') // Additional useful alias
        }
    }
};

export default config;
