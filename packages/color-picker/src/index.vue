<script lang="ts">
// 声明无法在 <script setup> 中声明的选项
export default {
  name: "colorPicker"
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import type { ColorPickerLocale, ColorPickerMessages, ColorPickerPlacement, ColorPickerExposed } from './types'
import {
  COLOR_PANEL,
  GRADIENT_STEPS,
  STANDARD_COLORS,
  THEME_COLORS,
  detectLocale,
  localeMessagesMap,
  normalizeLocale,
  parsePlacement,
  subscribeLang
} from './utils'

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
  // 将面板渲染到指定容器（true = body），避免被 overflow: hidden 祖先裁剪
  teleport?: boolean | string
}>(), {
  defaultColor: '#000000',
  messages: () => ({}),
  placement: 'auto',
  teleport: false
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
// aria-selected 用：大小写 / 空白不敏感地和色块 hex 比较
const normalizedShowColor = computed(() => showColor.value.trim().toLowerCase())

const isTeleported = computed(() => !!props.teleport)
const teleportTarget = computed(() =>
  typeof props.teleport === 'string' && props.teleport ? props.teleport : 'body'
)

const colorPicker = useTemplateRef<HTMLDivElement>('colorPicker')
const colorPanelEl = useTemplateRef<HTMLDivElement>('colorPanelEl')
const triggerEl = useTemplateRef<HTMLDivElement>('triggerEl')
const html5ColorEl = useTemplateRef<HTMLInputElement>('html5ColorEl')

// teleport 时面板脱离触发器的定位上下文，改用 fixed + 像素坐标
const panelStyle = shallowRef<Record<string, string>>({})

const computeTeleportStyle = () => {
  if (!isTeleported.value || !colorPicker.value) return
  const triggerRect = colorPicker.value.getBoundingClientRect()
  const panelRect = colorPanelEl.value?.getBoundingClientRect()
  const gap = 2
  const top = panelVerticalPlacement.value === 'top' && panelRect
    ? triggerRect.top - panelRect.height - gap
    : triggerRect.bottom + gap
  const left = panelHorizontalPlacement.value === 'right' && panelRect
    ? triggerRect.right - panelRect.width
    : triggerRect.left
  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    right: 'auto',
    bottom: 'auto'
  }
}

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

  if (placement.vertical === 'auto' || placement.horizontal === 'auto') {
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
  } else {
    // 用户显式锁定的方向直接采用，无需测量
    panelVerticalPlacement.value = placement.vertical
    panelHorizontalPlacement.value = placement.horizontal
  }

  computeTeleportStyle()
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

// 点击组件外部（触发器和面板都不包含目标）时关闭；仅在面板打开期间监听
const onDocumentPointerDown = (event: Event) => {
  const target = event.target as Node | null
  if (!target) return
  if (colorPicker.value?.contains(target)) return
  if (colorPanelEl.value?.contains(target)) return
  closePanel()
}

const openPanel = () => {
  if (props.disabled || openStatus.value) return
  // 同步先把用户锁定的方向写入，避免首帧 bottom-left → 目标位置闪烁
  const p = parsePlacement(props.placement)
  if (p.vertical !== 'auto') panelVerticalPlacement.value = p.vertical
  if (p.horizontal !== 'auto') panelHorizontalPlacement.value = p.horizontal
  // 键盘漫游焦点回到第一个色块
  activeRow.value = 0
  activeCol.value = 0
  // 先用触发器位置放一版，nextTick 量出面板尺寸后校准
  if (isTeleported.value) computeTeleportStyle()
  openStatus.value = true
  // teleport 的 fixed 定位需要持续跟随视口；行内渲染只有 auto 方向才需要测量
  const needsViewportTracking = isTeleported.value || p.vertical === 'auto' || p.horizontal === 'auto'
  if (needsViewportTracking) {
    attachViewportListeners()
    void nextTick(updatePanelPlacement)
  }
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  emits('open')
}

const closePanel = () => {
  if (!openStatus.value) return
  openStatus.value = false
  detachViewportListeners()
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  emits('close')
}

const togglePanel = () => {
  if (props.disabled) return
  if (openStatus.value) closePanel()
  else openPanel()
}

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

// ---- 色块网格键盘导航（roving tabindex）----
// 逻辑网格：第 0 行主题色，第 1..GRADIENT_STEPS 行渐变面板，最后一行标准色
const GRID_ROWS = GRADIENT_STEPS + 2
const GRID_COLS = THEME_COLORS.length

const activeRow = shallowRef(0)
const activeCol = shallowRef(0)

const colorAt = (row: number, col: number): string => {
  if (row === 0) return THEME_COLORS[col]
  if (row === GRID_ROWS - 1) return STANDARD_COLORS[col]
  return COLOR_PANEL[col][row - 1]
}

const cellTabindex = (row: number, col: number) =>
  activeRow.value === row && activeCol.value === col ? 0 : -1

const focusCell = (row: number, col: number) => {
  activeRow.value = row
  activeCol.value = col
  void nextTick(() => {
    colorPanelEl.value
      ?.querySelector<HTMLElement>(`[data-cell="${row}-${col}"]`)
      ?.focus()
  })
}

const onSwatchKeydown = (e: KeyboardEvent, row: number, col: number) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      updateValue(colorAt(row, col))
      return
    case 'ArrowRight':
      e.preventDefault()
      focusCell(row, Math.min(col + 1, GRID_COLS - 1))
      return
    case 'ArrowLeft':
      e.preventDefault()
      focusCell(row, Math.max(col - 1, 0))
      return
    case 'ArrowDown':
      e.preventDefault()
      focusCell(Math.min(row + 1, GRID_ROWS - 1), col)
      return
    case 'ArrowUp':
      e.preventDefault()
      focusCell(Math.max(row - 1, 0), col)
      return
    case 'Home':
      e.preventDefault()
      focusCell(row, 0)
      return
    case 'End':
      e.preventDefault()
      focusCell(row, GRID_COLS - 1)
      return
  }
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
    focusCell(0, 0)
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
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
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
    <!-- 颜色色盘；teleport 开启时渲染到目标容器，避免被祖先 overflow 裁剪 -->
    <Teleport :to="teleportTarget" :disabled="!isTeleported">
      <div
        ref="colorPanelEl"
        class="box m-colorPicker-box"
        role="dialog"
        aria-modal="false"
        :aria-hidden="!openStatus"
        :aria-label="resolvedMessages.pickerLabel"
        :class="{
          open: openStatus,
          'placement-top': panelVerticalPlacement === 'top',
          'placement-right': panelHorizontalPlacement === 'right'
        }"
        :style="isTeleported ? panelStyle : undefined"
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
          <ul
            class="tColor"
            role="listbox"
            aria-orientation="horizontal"
            :aria-label="resolvedMessages.themeColors"
          >
            <li
              v-for="(color, index) of THEME_COLORS"
              :key="color"
              role="option"
              :aria-selected="color === normalizedShowColor"
              :tabindex="cellTabindex(0, index)"
              :data-cell="`0-${index}`"
              :aria-label="color"
              :style="{ backgroundColor: color }"
              @mouseover="handleHover(color)"
              @mouseout="handleHover('')"
              @click="updateValue(color)"
              @keydown="(e) => onSwatchKeydown(e, 0, index)"
            ></li>
          </ul>
          <ul class="bColor" role="grid" :aria-label="resolvedMessages.themeColors">
            <li v-for="(item, cIndex) of COLOR_PANEL" :key="cIndex" role="row">
              <ul role="presentation">
                <li
                  v-for="(color, rIndex) of item"
                  :key="color"
                  role="gridcell"
                  :tabindex="cellTabindex(rIndex + 1, cIndex)"
                  :data-cell="`${rIndex + 1}-${cIndex}`"
                  :aria-label="color"
                  :style="{ backgroundColor: color }"
                  @mouseover="handleHover(color)"
                  @mouseout="handleHover('')"
                  @click="updateValue(color)"
                  @keydown="(e) => onSwatchKeydown(e, rIndex + 1, cIndex)"
                ></li>
              </ul>
            </li>
          </ul>
          <h3>{{ resolvedMessages.standardColors }}</h3>
          <ul
            class="tColor"
            role="listbox"
            aria-orientation="horizontal"
            :aria-label="resolvedMessages.standardColors"
          >
            <li
              v-for="(color, index) of STANDARD_COLORS"
              :key="color"
              role="option"
              :aria-selected="color === normalizedShowColor"
              :tabindex="cellTabindex(GRID_ROWS - 1, index)"
              :data-cell="`${GRID_ROWS - 1}-${index}`"
              :aria-label="color"
              :style="{ backgroundColor: color }"
              @mouseover="handleHover(color)"
              @mouseout="handleHover('')"
              @click="updateValue(color)"
              @keydown="(e) => onSwatchKeydown(e, GRID_ROWS - 1, index)"
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
    </Teleport>
  </div>
</template>

<style lang="scss">
// CSS Variables 主题化：组件自身不声明变量，所有使用点带默认值回退。
// 自定义属性「元素自身声明优先于继承」，若在面板元素上声明默认值，
// 用户在 :root / .m-colorPicker 等祖先上的覆盖将永远传不进面板。
// 用回退值则任意层级（:root、.m-colorPicker、.m-colorPicker-box）覆盖均生效。
$swatch-size: var(--vcp-swatch-size, 15px);
$panel-width: var(--vcp-panel-width, 190px);
$panel-bg: var(--vcp-panel-bg, #fff);
$panel-border: var(--vcp-panel-border, 1px solid #ddd);
$panel-radius: var(--vcp-panel-radius, 2px);
$panel-shadow: var(--vcp-panel-shadow, 0 8px 24px rgba(0, 0, 0, .18));
$panel-padding: var(--vcp-panel-padding, 10px);
$text-color: var(--vcp-text-color, #333);
$focus-color: var(--vcp-focus-color, #4e81bb);
$transition: var(--vcp-transition, .3s ease);
$z-index: var(--vcp-z-index, 10000);

.m-colorPicker{
  position: relative; text-align: left; font-size: 14px; display: inline-block;
  outline: none;
  .colorBtn{ width: $swatch-size; height: $swatch-size; cursor: pointer; }
  .colorBtn.disabled{ cursor: no-drop; }
  .colorBtn:focus-visible{ outline: 2px solid $focus-color; outline-offset: 2px; }
  &.open{ z-index: $z-index; }
}

// 面板样式独立成顶层类：teleport 时面板脱离 .m-colorPicker 渲染
.m-colorPicker-box{
  position: absolute; top: calc(100% + 2px); left: 0;
  width: $panel-width;
  text-align: left; font-size: 14px;
  background: $panel-bg;
  border: $panel-border;
  border-radius: $panel-radius;
  box-shadow: $panel-shadow;
  padding: $panel-padding; padding-bottom: 5px;
  visibility: hidden; margin-top: 0; opacity: 0; transition: all $transition;
  box-sizing: content-box;
  z-index: 1;
  pointer-events: none;
  ul,li,ol{ list-style: none; margin: 0; padding: 0; }
  h3{ margin: 0; font-size: 14px; font-weight: normal; margin-top: 10px; margin-bottom: 5px; line-height: 1; color: $text-color; }
  h3.moreColors{ cursor: pointer; }
  h3.moreColors:focus-visible{ outline: 1px dashed $focus-color; outline-offset: 2px; }
  input {
    visibility: hidden;
    position: absolute;
    left: 0;
    bottom: 0;
  }
  &.placement-top{ top: auto; bottom: calc(100% + 2px); }
  &.placement-right{ left: auto; right: 0; }
  &.open{ visibility: visible; opacity: 1; pointer-events: auto; z-index: $z-index; }
  .hd{
    overflow: hidden; line-height: 29px;
    .colorView{ width: 100px; height: 30px; float: left; transition: background-color $transition; }
    .defaultColor{ width: 80px; float: right; text-align: center; border: $panel-border; cursor: pointer; color: $text-color; box-sizing: border-box; }
    .defaultColor:focus-visible{ outline: 2px solid $focus-color; outline-offset: 1px; }
  }
  .tColor{
    li{ width: $swatch-size; height: $swatch-size; display: inline-block; margin: 0 2px; transition: all $transition; cursor: pointer; }
    li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
    li:focus-visible{ outline: none; box-shadow: 0 0 0 2px $focus-color; position: relative; z-index: 1; }
  }
  .bColor{
    li{
      width: $swatch-size; display: inline-block; margin: 0 2px;
      li{ display: block; width: $swatch-size; height: $swatch-size; transition: all $transition; margin: 0; cursor: pointer; }
      li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
      li:focus-visible{ outline: none; box-shadow: 0 0 0 2px $focus-color; position: relative; z-index: 1; }
    }
  }
}
</style>
