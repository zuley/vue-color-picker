/**
 * Canonical type definitions for vcolorpicker.
 *
 * NOTE: index.d.ts at the repo root re-declares the same shapes for npm
 * consumers (since the source tree is not shipped). Keep both files in sync.
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

export interface ColorPickerExposed {
  open: () => void
  close: () => void
  focus: () => void
}
