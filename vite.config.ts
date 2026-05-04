import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))

  const config = {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./examples', import.meta.url))
      }
    }
  }

  // 当执行 pnpm lib 设置环境变量 --mode lib 时
  if (mode === 'lib') {
    return {
      ...config,
      build: {
        lib: {
          entry: resolve(rootDir, 'packages/main.ts'),
          name: 'vcolorpicker',
          fileName: 'vcolorpicker'
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            },
            dir: 'lib'
          }
        }
      }
    }
  }

  return config
})
