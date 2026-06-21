import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  test: {
    // Simula um ambiente de navegador (window, document, etc.)
    environment: 'jsdom',
    // Carrega os matchers do jest-dom antes de cada teste
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/main.jsx', 'src/assets/'],
    },
  },
})

