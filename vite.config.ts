import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true,
    proxy: {
      '/api/v1/github': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/v1/projects': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/v1/deploy': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/v1/deployments': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/v1/stack': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/v1/webhooks': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
