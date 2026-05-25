<script lang="ts">
// 声明无法在 <script setup> 中声明的选项；本块为模块作用域，常量只初始化一次
import type {
  ColorPickerExposed,
  ColorPickerLocale,
  ColorPickerMessages,
  ColorPickerPlacement
} from './types'

export default {
  name: "colorPicker"
}

type ResolvedPlacement = {
  vertical: 'top' | 'bottom' | 'auto'
  horizontal: 'left' | 'right' | 'auto'
}

const parsePlacement = (p: ColorPickerPlacement): ResolvedPlacement => {
  if (p === 'auto') return { vertical: 'auto', horizontal: 'auto' }
  const [v, h] = p.split('-') as ['top' | 'bottom', 'start' | 'end' | undefined]
  return {
    vertical: v,
    horizontal: h ? (h === 'start' ? 'left' : 'right') : 'auto'
  }
}

const localeMessagesMap: Record<ColorPickerLocale, ColorPickerMessages> = {
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
const THEME_COLORS = [
  '#000000', '#ffffff', '#eeece1', '#1e497b', '#4e81bb',
  '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c'
] as const

// 标准颜色
const STANDARD_COLORS = [
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

const GRADIENT_STEPS = 5

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// 规范化 hex 字符串；非法输入回退到黑色
const parseColor = (input: string): string => {
  if (!input || typeof input !== 'string') return '#000000'
  let hex = input.trim().toLowerCase()
  if (!hex.startsWith('#')) hex = '#' + hex
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex
  return '#000000'
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = parseColor(hex)
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16)
  ]
}

const rgbToHex = (r: number, g: number, b: number): string => {
  const toComp = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return '#' + toComp(r) + toComp(g) + toComp(b)
}

const gradient = (start: string, end: string, step: number): string[] => {
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

// 预计算一次的渐变面板：浅 -> 深
const COLOR_PANEL: ReadonlyArray<ReadonlyArray<string>> = COLOR_CONFIG.map(
  ([dark, light]) => gradient(light, dark, GRADIENT_STEPS)
)

const normalizeLocale = (locale?: string): ColorPickerLocale => {
  if (!locale) return 'zh-CN'
  const l = locale.toLowerCase()
  if (l.startsWith('zh')) return 'zh-CN'
  if (l.startsWith('ja')) return 'ja-JP'
  return 'en-US'
}

const detectLocale = (): ColorPickerLocale => {
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

const subscribeLang = (cb: LangListener): (() => void) => {
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
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = withDefaults(defineProps<{
  // 当前颜色
  modelValue: string
  // 默认颜色
  defaultColor?: string
  // 禁用状态
  disabled?: boolean
  // 内置语言
  locale?: ColorPickerLocale
  // 自定义文案
  messages?: Partial<ColorPickerMessages>
  // 面板位置；默认 'auto' 由视口空间决定
  placement?: ColorPickerPlacement
}>(), {
  defaultColor: '#000000',
  messages: () => ({}),
  placement: 'auto'
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'hover', color: string): void
}>()

// 面板状态
const openStatus = shallowRef(false)
const panelVerticalPlacement = shallowRef<'bottom' | 'top'>('bottom')
const panelHorizontalPlacement = shallowRef<'left' | 'right'>('left')
// 鼠标经过的颜色块
const hoverColor = shallowRef('')

// SSR 守恒：首屏始终取确定性的 fallback，onMounted 再校准。
// 当 props.locale 存在时，resolvedLocale 直接走 props，detectedLocale 不参与，
// 因此这里只需一个稳定的占位值。
const detectedLocale = shallowRef<ColorPickerLocale>('zh-CN')

const resolvedLocale = computed<ColorPickerLocale>(() =>
  props.locale ? normalizeLocale(props.locale) : detectedLocale.value
)

const resolvedMessages = computed<ColorPickerMessages>(() => ({
  ...localeMessagesMap[resolvedLocale.value],
  ...props.messages
}))

const showColor = computed(() => props.modelValue || props.defaultColor)
const showPanelColor = computed(() => hoverColor.value || showColor.value)

const colorPicker = useTemplateRef<HTMLDivElement>('colorPicker')
const colorPanelEl = useTemplateRef<HTMLDivElement>('colorPanelEl')
const triggerEl = useTemplateRef<HTMLDivElement>('triggerEl')
const html5ColorEl = useTemplateRef<HTMLInputElement>('html5ColorEl')

// rAF 合并的 placement 更新
let placementRaf = 0
const schedulePlacementUpdate = () => {
  if (placementRaf) return
  placementRaf = requestAnimationFrame(() => {
    placementRaf = 0
    updatePanelPlacement()
  })
}

const updatePanelPlacement = () => {
  if (!colorPicker.value || !colorPanelEl.value || !openStatus.value) return

  const placement = parsePlacement(props.placement)

  // 用户显式锁定的方向直接采用，无需测量
  if (placement.vertical !== 'auto' && placement.horizontal !== 'auto') {
    panelVerticalPlacement.value = placement.vertical
    panelHorizontalPlacement.value = placement.horizontal
    return
  }

  const triggerRect = colorPicker.value.getBoundingClientRect()
  const panelRect = colorPanelEl.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const spaceRight = viewportWidth - triggerRect.left
  const leftAvailableSpace = triggerRect.right

  panelVerticalPlacement.value = placement.vertical !== 'auto'
    ? placement.vertical
    : (panelRect.height > spaceBelow && spaceAbove > spaceBelow ? 'top' : 'bottom')

  panelHorizontalPlacement.value = placement.horizontal !== 'auto'
    ? placement.horizontal
    : (panelRect.width > spaceRight && leftAvailableSpace > spaceRight ? 'right' : 'left')
}

const attachViewportListeners = () => {
  window.addEventListener('resize', schedulePlacementUpdate)
  window.addEventListener('scroll', schedulePlacementUpdate, true)
}

const detachViewportListeners = () => {
  window.removeEventListener('resize', schedulePlacementUpdate)
  window.removeEventListener('scroll', schedulePlacementUpdate, true)
  if (placementRaf) {
    cancelAnimationFrame(placementRaf)
    placementRaf = 0
  }
}

const openPanel = () => {
  if (props.disabled || openStatus.value) return
  // 同步先把用户锁定的方向写入，避免首帧 bottom-left → 目标位置闪烁
  const p = parsePlacement(props.placement)
  if (p.vertical !== 'auto') panelVerticalPlacement.value = p.vertical
  if (p.horizontal !== 'auto') panelHorizontalPlacement.value = p.horizontal
  openStatus.value = true
  // 完全锁定时视口变化不影响位置，无需挂 viewport listeners
  const needsAutoMeasure = p.vertical === 'auto' || p.horizontal === 'auto'
  if (needsAutoMeasure) {
    attachViewportListeners()
    void nextTick(updatePanelPlacement)
  }
  emits('open')
}

const closePanel = () => {
  if (!openStatus.value) return
  openStatus.value = false
  detachViewportListeners()
  emits('close')
}

const togglePanel = () => {
  if (props.disabled) return
  if (openStatus.value) closePanel()
  else openPanel()
}

onClickOutside(colorPicker, closePanel)

const focusTrigger = () => {
  void nextTick(() => triggerEl.value?.focus())
}

// 更新组件的值
const updateValue = (value: string) => {
  emits('update:modelValue', value)
  emits('change', value)
  closePanel()
  focusTrigger()
}

const handleDefaultColor = () => updateValue(props.defaultColor)
const handleHover = (color: string) => {
  hoverColor.value = color
  emits('hover', color)
}
const triggerHtml5Color = () => html5ColorEl.value?.click()
const handleHtml5ColorChange = (event: Event) => {
  updateValue((event.target as HTMLInputElement).value)
}

// 键盘交互
const onTriggerKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    togglePanel()
  } else if (e.key === 'Escape' && openStatus.value) {
    e.preventDefault()
    closePanel()
  } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !openStatus.value) {
    e.preventDefault()
    openPanel()
  }
}

const onPanelKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    closePanel()
    focusTrigger()
  }
}

const onActivate = (e: KeyboardEvent, handler: () => void) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handler()
  }
}

let unsubscribeLang: (() => void) | null = null

onMounted(() => {
  if (!props.locale) detectedLocale.value = detectLocale()
  unsubscribeLang = subscribeLang((next) => {
    if (!props.locale) detectedLocale.value = next
  })
})

onBeforeUnmount(() => {
  unsubscribeLang?.()
  unsubscribeLang = null
  detachViewportListeners()
})

defineExpose<ColorPickerExposed>({
  open: openPanel,
  close: closePanel,
  focus: () => triggerEl.value?.focus()
})
</script>

<template>
  <div class="m-colorPicker" :class="{ open: openStatus }" ref="colorPicker">
    <!-- 颜色显示小方块（兼具触发按钮） -->
    <div
      ref="triggerEl"
      class="colorBtn"
      role="button"
      :tabindex="disabled ? -1 : 0"
      aria-haspopup="dialog"
      :aria-expanded="openStatus"
      :aria-disabled="disabled || undefined"
      :aria-label="`${resolvedMessages.pickerLabel}, ${showColor}`"
      :style="{ backgroundColor: showColor }"
      :class="{ disabled }"
      @click="togglePanel"
      @keydown="onTriggerKeydown"
    ></div>
    <!-- 颜色色盘 -->
    <div
      ref="colorPanelEl"
      class="box"
      role="dialog"
      aria-modal="false"
      :aria-hidden="!openStatus"
      :aria-label="resolvedMessages.pickerLabel"
      :class="{
        open: openStatus,
        'placement-top': panelVerticalPlacement === 'top',
        'placement-right': panelHorizontalPlacement === 'right'
      }"
      @keydown="onPanelKeydown"
    >
      <div class="hd">
        <div class="colorView" :style="{ backgroundColor: showPanelColor }"></div>
        <div
          class="defaultColor"
          role="button"
          tabindex="0"
          @click="handleDefaultColor"
          @keydown="(e) => onActivate(e, handleDefaultColor)"
          @mouseover="handleHover(defaultColor)"
          @mouseout="handleHover('')"
        >{{ resolvedMessages.defaultColor }}</div>
      </div>
      <div class="bd">
        <h3>{{ resolvedMessages.themeColors }}</h3>
        <ul class="tColor" role="grid">
          <li
            v-for="(color, index) of THEME_COLORS"
            :key="index"
            role="gridcell"
            tabindex="0"
            :aria-label="color"
            :style="{ backgroundColor: color }"
            @mouseover="handleHover(color)"
            @mouseout="handleHover('')"
            @click="updateValue(color)"
            @keydown="(e) => onActivate(e, () => updateValue(color))"
          ></li>
        </ul>
        <ul class="bColor" role="grid">
          <li v-for="(item, index) of COLOR_PANEL" :key="index" role="row">
            <ul>
              <li
                v-for="(color, cindex) of item"
                :key="cindex"
                role="gridcell"
                tabindex="0"
                :aria-label="color"
                :style="{ backgroundColor: color }"
                @mouseover="handleHover(color)"
                @mouseout="handleHover('')"
                @click="updateValue(color)"
                @keydown="(e) => onActivate(e, () => updateValue(color))"
              ></li>
            </ul>
          </li>
        </ul>
        <h3>{{ resolvedMessages.standardColors }}</h3>
        <ul class="tColor" role="grid">
          <li
            v-for="(color, index) of STANDARD_COLORS"
            :key="index"
            role="gridcell"
            tabindex="0"
            :aria-label="color"
            :style="{ backgroundColor: color }"
            @mouseover="handleHover(color)"
            @mouseout="handleHover('')"
            @click="updateValue(color)"
            @keydown="(e) => onActivate(e, () => updateValue(color))"
          ></li>
        </ul>
        <h3
          class="moreColors"
          role="button"
          tabindex="0"
          @click="triggerHtml5Color"
          @keydown="(e) => onActivate(e, triggerHtml5Color)"
        >{{ resolvedMessages.moreColors }}</h3>
        <!--
          用以激活 HTML5 原生颜色面板。
          监听 @change（用户在原生面板里点确定）而非 @input（拖动持续触发），
          避免拖动时反复 emit + focusTrigger 抢焦点。
        -->
        <input
          type="color"
          ref="html5ColorEl"
          aria-hidden="true"
          tabindex="-1"
          :value="showColor"
          @change="handleHtml5ColorChange"
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.m-colorPicker{
  // CSS Variables - 可被外部覆盖以定制主题
  --vcp-swatch-size: 15px;
  --vcp-panel-width: 190px;
  --vcp-panel-bg: #fff;
  --vcp-panel-border: 1px solid #ddd;
  --vcp-panel-radius: 2px;
  --vcp-panel-shadow: 0 8px 24px rgba(0, 0, 0, .18);
  --vcp-panel-padding: 10px;
  --vcp-text-color: #333;
  --vcp-focus-color: #4e81bb;
  --vcp-transition: .3s ease;
  --vcp-z-index: 10000;

  position: relative; text-align: left; font-size: 14px; display: inline-block;
  outline: none;
  ul,li,ol{ list-style: none; margin: 0; padding: 0; }
  .colorBtn{ width: var(--vcp-swatch-size); height: var(--vcp-swatch-size); cursor: pointer; }
  .colorBtn.disabled{ cursor: no-drop; }
  .colorBtn:focus-visible{ outline: 2px solid var(--vcp-focus-color); outline-offset: 2px; }
  &.open{ z-index: var(--vcp-z-index); }
  .box{
    position: absolute; top: calc(100% + 2px); left: 0;
    width: var(--vcp-panel-width);
    background: var(--vcp-panel-bg);
    border: var(--vcp-panel-border);
    border-radius: var(--vcp-panel-radius);
    box-shadow: var(--vcp-panel-shadow);
    padding: var(--vcp-panel-padding); padding-bottom: 5px;
    visibility: hidden; margin-top: 0; opacity: 0; transition: all var(--vcp-transition);
    box-sizing: content-box;
    z-index: 1;
    pointer-events: none;
    h3{ margin: 0; font-size: 14px; font-weight: normal; margin-top: 10px; margin-bottom: 5px; line-height: 1; color: var(--vcp-text-color); }
    h3.moreColors{ cursor: pointer; }
    h3.moreColors:focus-visible{ outline: 1px dashed var(--vcp-focus-color); outline-offset: 2px; }
    input {
      visibility: hidden;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
  .box.placement-top{ top: auto; bottom: calc(100% + 2px); }
  .box.placement-right{ left: auto; right: 0; }
  .box.open{ visibility: visible; opacity: 1; pointer-events: auto; }
  .hd{
    overflow: hidden; line-height: 29px;
    .colorView{ width: 100px; height: 30px; float: left; transition: background-color var(--vcp-transition); }
    .defaultColor{ width: 80px; float: right; text-align: center; border: var(--vcp-panel-border); cursor: pointer; color: var(--vcp-text-color); box-sizing: border-box; }
    .defaultColor:focus-visible{ outline: 2px solid var(--vcp-focus-color); outline-offset: 1px; }
  }
  .tColor{
    li{ width: var(--vcp-swatch-size); height: var(--vcp-swatch-size); display: inline-block; margin: 0 2px; transition: all var(--vcp-transition); cursor: pointer; }
    li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
    li:focus-visible{ outline: none; box-shadow: 0 0 0 2px var(--vcp-focus-color); position: relative; z-index: 1; }
  }
  .bColor{
    li{
      width: var(--vcp-swatch-size); display: inline-block; margin: 0 2px;
      li{ display: block; width: var(--vcp-swatch-size); height: var(--vcp-swatch-size); transition: all var(--vcp-transition); margin: 0; cursor: pointer; }
      li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
      li:focus-visible{ outline: none; box-shadow: 0 0 0 2px var(--vcp-focus-color); position: relative; z-index: 1; }
    }
  }
}
</style>
