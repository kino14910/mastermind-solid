import { solidStart } from '@solidjs/start/config'
import { nitroV2Plugin as nitro } from '@solidjs/vite-plugin-nitro-2'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type PluginOption } from 'vite'

export default defineConfig({
  plugins: [solidStart(), tailwindcss(), nitro()] as PluginOption[],
  optimizeDeps: {
    exclude: ['source-map-js'],
  },
})
