<script lang="ts">
// 声明无法在 <script setup> 中声明的选项
export default {
  name: "colorPicker"
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'

type ColorPickerLocale = 'zh-CN' | 'en-US'

interface ColorPickerMessages {
  defaultColor: string
  themeColors: string
  standardColors: string
  moreColors: string
}

const localeMessagesMap: Record<ColorPickerLocale, ColorPickerMessages> = {
  'zh-CN': {
    defaultColor: '默认颜色',
    themeColors: '主题颜色',
    standardColors: '标准颜色',
    moreColors: '更多颜色...'
  },
  'en-US': {
    defaultColor: 'Default',
    themeColors: 'Theme Colors',
    standardColors: 'Standard Colors',
    moreColors: 'More Colors...'
  }
}

const normalizeLocale = (locale?: string): ColorPickerLocale => {
  if (!locale) {
    return 'zh-CN'
  }

  return locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

const detectLocale = (): ColorPickerLocale => {
  if (typeof document !== 'undefined') {
    const documentLang = document.documentElement.lang
    if (documentLang) {
      return normalizeLocale(documentLang)
    }
  }

  if (typeof navigator !== 'undefined') {
    return normalizeLocale(navigator.language)
  }

  return 'zh-CN'
}

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
}>(), {
  defaultColor: '#000000',
  messages: () => ({})
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

// 面板状态
const openStatus = shallowRef(false)
const panelVerticalPlacement = shallowRef<'bottom' | 'top'>('bottom')
const panelHorizontalPlacement = shallowRef<'left' | 'right'>('left')
// 打开面板
const openPanel = () => {
  if (props.disabled) {
    return
  }

  openStatus.value = !openStatus.value

  if (openStatus.value) {
    void nextTick(() => {
      updatePanelPlacement()
    })
  }
}
const colorPicker = useTemplateRef<HTMLDivElement>('colorPicker')
const colorPanelEl = useTemplateRef<HTMLDivElement>('colorPanelEl')
// 关闭面板
const closePanel = () => {
  openStatus.value = false
}
onClickOutside(colorPicker, closePanel)

// 鼠标经过的颜色块
const hoverColor = shallowRef('')
const handleHover = (color: string) => {
  hoverColor.value = color
}
// 主题颜色
const tColor = ['#000000', '#ffffff', '#eeece1', '#1e497b', '#4e81bb', '#e2534d', '#9aba60', '#8165a0', '#47acc5', '#f9974c']
// 颜色面板
const colorConfig = [
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
// 标准颜色
const bColor = ['#c21401', '#ff1e02', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d']

const detectedLocale = shallowRef<ColorPickerLocale>(props.locale ? normalizeLocale(props.locale) : 'zh-CN')
let documentLangObserver: MutationObserver | null = null

onMounted(() => {
  detectedLocale.value = detectLocale()

  if (typeof document === 'undefined') {
    return
  }

  documentLangObserver = new MutationObserver(() => {
    detectedLocale.value = detectLocale()
  })

  documentLangObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  })

  window.addEventListener('resize', updatePanelPlacement)
  window.addEventListener('scroll', updatePanelPlacement, true)
})

onBeforeUnmount(() => {
  documentLangObserver?.disconnect()
  documentLangObserver = null
  window.removeEventListener('resize', updatePanelPlacement)
  window.removeEventListener('scroll', updatePanelPlacement, true)
})

const resolvedLocale = computed<ColorPickerLocale>(() => {
  return props.locale ? normalizeLocale(props.locale) : detectedLocale.value
})

const resolvedMessages = computed<ColorPickerMessages>(() => ({
  ...localeMessagesMap[resolvedLocale.value],
  ...props.messages
}))

// 计算属性：显示面板颜色
const showPanelColor = computed(() => {
  return hoverColor.value || showColor.value
})
// 计算属性：显示颜色
const showColor = computed(() => {
  return props.modelValue || props.defaultColor
})
// 计算属性：颜色面板
const colorPanel = computed(() => {
  const colorArr: string[][] = []
  for (const color of colorConfig) {
    colorArr.push(gradient(color[1], color[0], 5))
  }
  return colorArr
})

const html5ColorEl = useTemplateRef<HTMLInputElement>('html5ColorEl')
const updatePanelPlacement = () => {
  if (!colorPicker.value || !colorPanelEl.value || !openStatus.value) {
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

  panelVerticalPlacement.value =
    panelRect.height > spaceBelow && spaceAbove > spaceBelow ? 'top' : 'bottom'

  panelHorizontalPlacement.value =
    panelRect.width > spaceRight && leftAvailableSpace > spaceRight ? 'right' : 'left'
}

const triggerHtml5Color = () => {
  html5ColorEl.value?.click()
}
// 更新组件的值
const updateValue = (value: string) => {
  emits('update:modelValue', value)
  emits('change', value)
  openStatus.value = false
}
// 设置默认颜色
const handleDefaultColor = () => {
  updateValue(props.defaultColor)
}

const handleHtml5ColorChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  updateValue(value)
}

/**
 * 颜色计算
 */
// 格式化 hex 颜色值
const parseColor = (hexStr: string) => {
  if (hexStr.length === 4) {
    return '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3]
  } else {
    return hexStr
  }
}
// RGB 颜色 转 HEX 颜色
const rgbToHex = (r: number, g: number, b: number) => {
  const hex = ((r << 16) | (g << 8) | b).toString(16)
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex
}
// HEX 转 RGB 颜色
const hexToRgb = (hex: string) => {
  hex = parseColor(hex)
  const rgb = []
  for (let i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
  }
  return rgb
}
// 计算渐变过渡颜色
const gradient = (startColor: string, endColor: string, step: number) => {
  // 讲 hex 转换为 rgb
  const sColor = hexToRgb(startColor)
  const eColor = hexToRgb(endColor)
  // 计算R\G\B每一步的差值
  const rStep = (eColor[0] - sColor[0]) / step
  const gStep = (eColor[1] - sColor[1]) / step
  const bStep = (eColor[2] - sColor[2]) / step
  const gradientColorArr = []
  // 计算每一步的hex值
  for (let i = 0; i < step; i++) {
    gradientColorArr.push(rgbToHex(rStep * i + sColor[0], gStep * i + sColor[1], bStep * i + sColor[2]))
  }
  return gradientColorArr
}
</script>

<template>
  <div class="m-colorPicker" :class="{ open: openStatus }" ref="colorPicker" @click="event => { event.stopPropagation() }">
    <!-- 颜色显示小方块 -->
    <div class="colorBtn"
      :style="`background-color: ${showColor}`"
      @click="openPanel"
      :class="{ disabled: disabled }"
    ></div>
    <!-- 颜色色盘 -->
    <div
      ref="colorPanelEl"
      class="box"
      :class="{
        open: openStatus,
        'placement-top': panelVerticalPlacement === 'top',
        'placement-right': panelHorizontalPlacement === 'right'
      }"
    >
      <div class="hd">
        <div class="colorView" :style="{ backgroundColor: showPanelColor }"></div>
        <div class="defaultColor"
          @click="handleDefaultColor"
          @mouseover="handleHover(defaultColor)"
          @mouseout="handleHover('')"
        >{{ resolvedMessages.defaultColor }}</div>
      </div>
      <div class="bd">
        <h3>{{ resolvedMessages.themeColors }}</h3>
        <ul class="tColor">
          <li
            v-for="(color, index) of tColor"
            :key="index"
            :style="{ backgroundColor: color }"
            @mouseover="handleHover(color)"
            @mouseout="handleHover('')"
            @click="updateValue(color)"
          ></li>
        </ul>
        <ul class="bColor">
          <li v-for="(item, index) of colorPanel" :key="index">
            <ul>
              <li
                v-for="(color, cindex) of item"
                :key="cindex"
                :style="{ backgroundColor: color }"
                @mouseover="handleHover(color)"
                @mouseout="handleHover('')"
                @click="updateValue(color)"
              ></li>
            </ul>
          </li>
        </ul>
        <h3>{{ resolvedMessages.standardColors }}</h3>
        <ul class="tColor">
          <li
            v-for="(color, index) of bColor"
            :key="index"
            :style="{ backgroundColor: color }"
            @mouseover="handleHover(color)"
            @mouseout="handleHover('')"
            @click="updateValue(color)"
          ></li>
        </ul>
        <h3 @click="triggerHtml5Color">{{ resolvedMessages.moreColors }}</h3>
        <!-- 用以激活HTML5颜色面板 -->
        <input type="color"
          ref="html5ColorEl"
          :value="showColor"
          @input="handleHtml5ColorChange">
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.m-colorPicker{
  position: relative; text-align: left; font-size: 14px; display: inline-block;
  outline: none;
  ul,li,ol{ list-style: none; margin: 0; padding: 0; }
  .colorBtn{ width: 15px; height: 15px; }
  .colorBtn.disabled{ cursor: no-drop; }
  &.open{ z-index: 10000; }
  .box{
    position: absolute; top: calc(100% + 2px); left: 0; width: 190px; background: #fff; border: 1px solid #ddd; visibility: hidden; border-radius: 2px; margin-top: 0; padding: 10px; padding-bottom: 5px; box-shadow: 0 8px 24px rgba(0,0,0,.18); opacity: 0; transition: all .3s ease;
    box-sizing: content-box;
    z-index: 1;
    pointer-events: none;
    h3{ margin: 0; font-size: 14px; font-weight: normal; margin-top: 10px; margin-bottom: 5px; line-height: 1; color: #333; }
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
    .colorView{ width: 100px; height: 30px; float: left; transition: background-color .3s ease; }
    .defaultColor{ width: 80px; float: right; text-align: center; border: 1px solid #ddd; cursor: pointer; color: #333; }
  }
  .tColor{
    li{ width: 15px; height: 15px; display: inline-block; margin: 0 2px; transition: all .3s ease; }
    li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
  }
  .bColor{
    li{
      width: 15px; display: inline-block; margin: 0 2px;
      li{ display: block; width: 15px; height: 15px; transition: all .3s ease; margin: 0; }
      li:hover{ box-shadow: 0 0 5px rgba(0,0,0,.4); transform: scale(1.3); }
    }
  }
}
</style>
