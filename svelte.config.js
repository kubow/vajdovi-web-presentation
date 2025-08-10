import adapter from '@sveltejs/adapter-static';
import { mdsvex } from "mdsvex"
import mdsvexConfig from "./mdsvex.config.js"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],
  preprocess: [
    vitePreprocess({
      postcss: true,
      typescript: {
        tsconfigFile: "./tsconfig.json",
        compilerOptions: {
          verbatimModuleSyntax: true
        }
      }
    }),
    mdsvex(mdsvexConfig),
  ],
  kit: {
    adapter: adapter({
      pages: process.env.OUTPUT_DIR || 'docs',
      assets: process.env.OUTPUT_DIR || 'docs',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    alias: {
      $components: resolve(__dirname, "./src/lib/components"),
      $content: resolve(__dirname, "./src/content"),
      $stores: resolve(__dirname, "./src/lib/stores"),
      $styles: resolve(__dirname, "./src/lib/styles"),
      $utils: resolve(__dirname, "./src/lib/utils"),
      $src: resolve(__dirname, "./src"),
    },
    paths: {
      base: process.env.BASE_PATH || '',
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // Ignore 404 errors for test links
        if (path.startsWith('/test/') && referrer === '/test') {
          return;
        }
        // Ignore 404 for / when base path is set (for GitHub Pages build)
        if (path === '/' && process.env.BASE_PATH && process.env.BASE_PATH !== '/') {
          return;
        }
        // Otherwise, throw the error
        throw new Error(message);
      }
    }
  }
}

export default config