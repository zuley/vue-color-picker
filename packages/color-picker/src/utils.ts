/**
 * 与组件实例无关的纯逻辑：颜色计算、locale 解析、面板方位解析、
 * 以及跨实例共享的 <html lang> 观察者。抽出以便单元测试。
 */
import type { ColorPickerLocale, ColorPickerMessages, ColorPickerPlacement } from './types'

export type ResolvedPlacement = {
  vertical: 'top' | 'bottom' | 'auto'
  horizontal: 'left' | 'right' | 'auto'
}

export const parsePlacement = (p: ColorPickerPlacement): ResolvedPlacement => {
  if (p === 'auto') return { vertical: 'auto', horizontal: 'auto' }
  const [v, h] = p.split('-') as ['top' | 'bottom', 'start' | 'end' | undefined]
  return {
    vertical: v,
    horizontal: h ? (h === 'start' ? 'left' : 'right') : 'auto'
  }
}

export const localeMessagesMap: Record<ColorPickerLocale, ColorPickerMessages> = {
  'zh-CN': {
    defaultColor: '默认颜色',
    themeColors: '主题颜色',
    standardColors: '标准颜色',
    moreColors: '更多颜色...',
    pickerLabel: '颜色选择器'
  },
  'en-US': {
    defaultColor: 'Default',
    themeColors: 'Theme Colors',
    standardColors: 'Standard Colors',
    moreColors: 'More Colors...',
    pickerLabel: 'Color picker'
  },
  'ja-JP': {
    defaultColor: 'デフォルトカラー',
    themeColors: 'テーマカラー',
    standardColors: '標準カラー',
    moreColors: 'その他のカラー...',
    pickerLabel: 'カラーピッカー'
  }
}

// 主题颜色
export const THEME_COLORS = [
  '#000000', '#ffffff', '#eeece1', '#1e497b', '#4e81bb',
  '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'
] as const

// 标准颜色
export const STANDARD_COLORS = [
  '#c21401', '#ff1e02', '#ffc12a', '#ffff3a', '#90cf5b',
  '#00af57', '#00afee', '#0071be', '#00215f', '#72349d'
] as const

// 色板渐变源 [深色, 浅色]
const COLOR_CONFIG: ReadonlyArray<readonly [string, string]> = [
  ['#7f7f7f', '#f2f2f2'],
  ['#0d0d0d', '#808080'],
  ['#1c1a10', '#ddd8c3'],
  ['#0e243d', '#c6d9f0'],
  ['#233f5e', '#dae5f0'],
  ['#632623', '#f2dbdb'],
  ['#4d602c', '#eaf1de'],
  ['#3f3150', '#e6e0ec'],
  ['#1e5867', '#d9eef3'],
  ['#99490f', '#fee9da']
]

export const GRADIENT_STEPS = 5

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// 规范化 hex 字符串；非法输入回退到黑色
export const parseColor = (input: string): string => {
  if (!input || typeof input !== 'string') return '#000000'
  let hex = input.trim().toLowerCase()
  if (!hex.startsWith('#')) hex = '#' + hex
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex
  return '#000000'
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const h = parseColor(hex)
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16)
  ]
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toComp = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return '#' + toComp(r) + toComp(g) + toComp(b)
}

export const gradient = (start: string, end: string, step: number): string[] => {
  const [sr, sg, sb] = hexToRgb(start)
  const [er, eg, eb] = hexToRgb(end)
  const rStep = (er - sr) / step
  const gStep = (eg - sg) / step
  const bStep = (eb - sb) / step
  const out: string[] = []
  for (let i = 0; i < step; i++) {
    out.push(rgbToHex(sr + rStep * i, sg + gStep * i, sb + bStep * i))
  }
  return out
}

// 预计算一次的渐变面板：COLOR_PANEL[列][行]，浅 -> 深
export const COLOR_PANEL: ReadonlyArray<ReadonlyArray<string>> = COLOR_CONFIG.map(
  ([dark, light]) => gradient(light, dark, GRADIENT_STEPS)
)

export const normalizeLocale = (locale?: string): ColorPickerLocale => {
  if (!locale) return 'zh-CN'
  const l = locale.toLowerCase()
  if (l.startsWith('zh')) return 'zh-CN'
  if (l.startsWith('ja')) return 'ja-JP'
  return 'en-US'
}

export const detectLocale = (): ColorPickerLocale => {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang
    if (lang) return normalizeLocale(lang)
  }
  if (typeof navigator !== 'undefined') return normalizeLocale(navigator.language)
  return 'zh-CN'
}

// MutationObserver 单例：所有组件实例共享一个 observer，引用计数为 0 时断开
type LangListener = (locale: ColorPickerLocale) => void
const langListeners = new Set<LangListener>()
let sharedLangObserver: MutationObserver | null = null

export const subscribeLang = (cb: LangListener): (() => void) => {
  langListeners.add(cb)
  if (typeof document !== 'undefined' && !sharedLangObserver) {
    sharedLangObserver = new MutationObserver(() => {
      const next = detectLocale()
      langListeners.forEach(fn => fn(next))
    })
    sharedLangObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    })
  }
  return () => {
    langListeners.delete(cb)
    if (langListeners.size === 0 && sharedLangObserver) {
      sharedLangObserver.disconnect()
      sharedLangObserver = null
    }
  }
}
