import { sveltekit } from '@sveltejs/kit/vite';
//import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
const config = defineConfig({
  plugins: [sveltekit()],
  server: { port: 5173 }
})

export default config