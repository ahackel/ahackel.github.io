import { defineConfig } from 'astro/config';
import markdoc from "@astrojs/markdoc";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: 'https://andreashackel.de',
  integrations: [markdoc(), svelte()]
});