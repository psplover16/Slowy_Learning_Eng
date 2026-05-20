import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Normalize a raw VITE_APP_BASE_PATH value into a canonical form that
 * always starts with `/` and ends with `/`.
 *
 * Rules:
 *  - undefined / null / "" / whitespace / "/" → "/"
 *  - else: trim, prepend `/` if absent, append `/` if absent
 *  - interior duplicate slashes are NOT collapsed (treated as caller error
 *    and passed through as-is)
 */
export function normalizeBasePath(value: string | undefined | null): string {
  if (value === undefined || value === null) return '/'
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '/') return '/'
  let out = trimmed
  if (!out.startsWith('/')) out = '/' + out
  if (!out.endsWith('/')) out = out + '/'
  return out
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appBasePath = normalizeBasePath(env.VITE_APP_BASE_PATH)
  const startUrl = normalizeBasePath(env.VITE_APP_START_URL ?? appBasePath)

  return {
    base: appBasePath,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
          navigateFallback: `${appBasePath}index.html`,
          runtimeCaching: [
            {
              urlPattern: /\.(?:js|css|html)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
        manifest: {
          name: 'Slowy Learning English',
          short_name: 'Slowy',
          description: '行動優先英語學習 PWA',
          theme_color: '#BF5635',
          background_color: '#F4ECDC',
          display: 'standalone',
          start_url: startUrl,
          scope: appBasePath,
          icons: [
            { src: `${appBasePath}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${appBasePath}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
            { src: `${appBasePath}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 500,
    },
  }
})
