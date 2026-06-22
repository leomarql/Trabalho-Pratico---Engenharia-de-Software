import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    testTimeout: 10000,
    // Vitest cuida apenas dos testes de unidade/integração em src/.
    // Os testes E2E (Playwright) ficam em tests/ e são rodados por `npm run test:e2e`.
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    server: {
      deps: {
        inline: [/@mui\//, /react-transition-group/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/main.jsx', 'src/assets/'],
    },
  },
})
