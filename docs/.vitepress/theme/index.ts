import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import colorPicker from '../../../packages/color-picker/src/index.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('colorPicker', colorPicker)
  }
} satisfies Theme
