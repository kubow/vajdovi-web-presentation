import remarkGfm from "remark-gfm";
import { defineMDSveXConfig as defineConfig } from "mdsvex"

const config = defineConfig({
  extensions: [".svelte.md", ".md", ".svx"],

  smartypants: {
    dashes: "oldschool",
  },

  remarkPlugins: [remarkGfm],
  rehypePlugins: [],
})

export default config