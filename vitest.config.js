import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [{
    name: 'css-as-text',
    enforce: 'pre',
    async load(id) {
      if (id.endsWith('.css')) {
        const { readFileSync } = await import('node:fs');
        return `export default ${JSON.stringify(readFileSync(id, 'utf8'))};`;
      }
    },
  }],
  test: { include: ['test/**/*.test.js'] },
});
