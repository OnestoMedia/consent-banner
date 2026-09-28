import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173', browserName: 'chromium' },
  webServer: { command: 'node scripts/serve.mjs', port: 4173, reuseExistingServer: true },
});
