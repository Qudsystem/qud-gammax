import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@github/spark/hooks': path.resolve(__dirname, './src/spark-hooks.ts'),
        },
    },
    optimizeDeps: {
        exclude: ['tailwind-merge'],
    },
    test: {
        environment: 'jsdom',
    },
})
