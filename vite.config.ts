import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import type { UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig((env) => {
  const defaultConfig: UserConfigExport = {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./examples', import.meta.url))
      }
    }
  }
  // 当执行 pnpm lib 设置环境变量 --mode lib 时
  if (env.mode === 'lib') {
    defaultConfig.build = {
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, 'packages/main.ts'),
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
  return defaultConfig
})
