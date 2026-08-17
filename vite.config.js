// vite.config.js
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import config from './config/config'
import configOverride from './config/configOverride'
import { mergeDeep } from './src/utils/objectMerge'
import {
  flattenLayerConfigs,
  runtimeCachingFromLayers,
} from './pwa/runtimeCachingFromConfig'

const DEFAULT_PWA = {
  name: 'OpenLayers Map for QGIS',
  shortName: 'OL Map',
  description: 'Interactive web map generated from QGIS',
  themeColor: '#1a1a1a',
  backgroundColor: '#1a1a1a',
  icons: [
    {
      src: 'icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
  ],
}

const mergedConfig = mergeDeep({}, config, configOverride)
const pwa = {
  ...DEFAULT_PWA,
  ...(mergedConfig.pwa ?? {}),
  icons: mergedConfig.pwa?.icons ?? DEFAULT_PWA.icons,
}

const firstIconSrc = pwa.icons[0]?.src ?? DEFAULT_PWA.icons[0].src
const htmlIconHref =
  firstIconSrc.startsWith('./') || firstIconSrc.startsWith('/')
    ? firstIconSrc
    : `./${firstIconSrc}`

export default defineConfig({
  base: './',
  plugins: [
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'default',
      },
    }),
    {
      name: 'html-pwa-meta',
      transformIndexHtml(html) {
        return html
          .replace(/<title>[^<]*<\/title>/, `<title>${pwa.name}</title>`)
          .replace(
            /<link rel="icon"[^>]*>/,
            `<link rel="icon" type="image/png" href="${htmlIconHref}" />`
          )
          .replace(
            /<link rel="apple-touch-icon"[^>]*>/,
            `<link rel="apple-touch-icon" href="${htmlIconHref}">`
          )
          .replace(
            /<meta name="theme-color"[^>]*>/,
            `<meta name="theme-color" content="${pwa.themeColor}" />`
          )
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeManifestIcons: false,
      manifest: {
        name: pwa.name,
        short_name: pwa.shortName,
        description: pwa.description,
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: pwa.backgroundColor,
        theme_color: pwa.themeColor,
        icons: pwa.icons,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,geojson}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: runtimeCachingFromLayers(
          flattenLayerConfigs(mergedConfig.layers)
        ),
      },
    }),
  ]
});
