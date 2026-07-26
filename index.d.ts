import type { ComponentPublicInstance, DefineComponent, Plugin } from 'vue'

/**
 * Public type surface for npm consumers.
 *
 * This is the canonical declaration file (the only one shipped to npm);
 * `packages/color-picker/src/types.ts` re-exports the shared shapes from
 * here, so the two can never drift apart.
 */

export type ColorPickerLocale = 'zh-CN' | 'en-US' | 'ja-JP'

export interface ColorPickerMessages {
  defaultColor: string
  themeColors: string
  standardColors: string
  moreColors: string
  pickerLabel: string
}

export type ColorPickerPlacement =
  | 'auto'
  | 'top'
  | 'bottom'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

export interface ColorPickerProps {
  modelValue: string
  defaultColor?: string
  disabled?: boolean
  locale?: ColorPickerLocale
  messages?: Partial<ColorPickerMessages>
  placement?: ColorPickerPlacement
  /** Render the panel into a container (true = body) to escape overflow clipping */
  teleport?: boolean | string
}

export interface ColorPickerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'hover', color: string): void
}

export interface ColorPickerExposed {
  open: () => void
  close: () => void
  focus: () => void
}

export type ColorPickerInstance = ComponentPublicInstance<ColorPickerProps> & ColorPickerExposed

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
