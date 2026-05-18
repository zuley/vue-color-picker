import type { DefineComponent, Plugin } from 'vue'

export type ColorPickerLocale = 'zh-CN' | 'en-US'

export interface ColorPickerMessages {
  defaultColor: string
  themeColors: string
  standardColors: string
  moreColors: string
}

export interface ColorPickerProps {
  modelValue: string
  defaultColor?: string
  disabled?: boolean
  locale?: ColorPickerLocale
  messages?: Partial<ColorPickerMessages>
}

export type ColorPickerComponent = DefineComponent<ColorPickerProps>

declare const colorPicker: ColorPickerComponent

declare const plugin: {
  install: Plugin['install']
  colorPicker: ColorPickerComponent
}

declare module 'vue' {
  export interface GlobalComponents {
    colorPicker: ColorPickerComponent
  }
}

export { colorPicker }
export default plugin
