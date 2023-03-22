import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";

import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  site: 'https://andreashackel.de',
  integrations: [svelte(), markdoc()]
});