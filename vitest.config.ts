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
  },
})
