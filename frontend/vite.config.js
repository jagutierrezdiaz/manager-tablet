import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  plugins: [
    vue(),
    Components({
      // Auto-register icon components, e.g. <i-mdi-account />
      resolvers: [
        IconsResolver({
          prefix: 'i' // <i-{collection}-{icon}>, e.g. <i-mdi-home/>
        })
      ]
    }),
    Icons({
      autoInstall: true
    })
  ],

  server: {
    host: true,
    port: 5173,

    proxy: {
      '/api': {
        // En desarrollo local, apuntar al backend en localhost:3000.
        // Si usas Docker o un host diferente, ajusta esta URL.
        target: 'http://localhost:5000',
        changeOrigin: true  
      }
    }
  }
})