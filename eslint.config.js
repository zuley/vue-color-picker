import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueTsESLintPlugin from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/lib/**', '**/dist-ssr/**', '**/coverage/**']
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...vueTsESLintPlugin(),
  skipFormatting,

  {
    name: 'app/vue-rules',
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
]
