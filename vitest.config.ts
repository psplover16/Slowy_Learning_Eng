import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'virtual:pwa-register/vue': resolve(__dirname, './src/__mocks__/pwa-register.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Vitest only runs unit tests under src/__tests__/.
    // Playwright handles tests/e2e separately.
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**', '.deploy-pages/**', '.spectra/**'],
    // viteBasePath imports vite.config.ts which triggers esbuild — esbuild
    // requires a true Node environment (jsdom's TextEncoder is incompatible).
    environmentMatchGlobs: [
      ['src/__tests__/viteBasePath.test.ts', 'node'],
      ['src/__tests__/packageScripts.test.ts', 'node'],
      ['src/__tests__/githubActionsWorkflows.test.ts', 'node'],
      ['src/__tests__/publishPages.test.ts', 'node'],
      ['src/__tests__/readmeCiCdDocs.test.ts', 'node'],
    ],
  },
})
