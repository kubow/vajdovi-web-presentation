import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import mdsvexConfig from './mdsvex.config.js';

/** @type {import('vite').UserConfig} */
const config = defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      extensions: ['.svelte', ...mdsvexConfig.extensions],
      preprocess: [
        vitePreprocess({
          postcss: true,
          typescript: {
            tsconfigFile: './tsconfig.json',
            compilerOptions: { verbatimModuleSyntax: true }
          }
        }),
        mdsvex(mdsvexConfig)
      ],
      adapter: adapter({
        pages: process.env.OUTPUT_DIR || 'docs',
        assets: process.env.OUTPUT_DIR || 'docs',
        fallback: undefined,
        precompress: false,
        strict: true
      }),
      paths: { base: process.env.BASE_PATH || '' },
      prerender: {
        handleHttpError: ({ path, referrer, message }) => {
          if (path.startsWith('/test/') && referrer === '/test') return;
          if (path === '/' && process.env.BASE_PATH && process.env.BASE_PATH !== '/') return;
          throw new Error(message);
        }
      }
    })
  ],
  server: { port: 5173 }
})

export default config
