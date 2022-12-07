<script lang="ts">
// 声明无法在 <script setup> 中声明的选项
export default {
  name: "colorPicker"
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  // 当前颜色
  modelValue: string
  // 默认颜色
  defaultColor: string
  // 禁用状态
  disabled: boolean
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 面板状态
const openStatus = ref(false)
// 打开面板
const openPanel = () => {
  openStatus.value = !props.disabled
}
const colorPicker = ref<HTMLInputElement | null>(null)
// 关闭面板
const closePanel = () => {
  openStatus.value = false
}
onClickOutside(colorPicker, closePanel)

// 鼠标经过的颜色块
const hoveColor: string = ''
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
const html5Color = props.modelValue
// 计算属性：显示面板颜色
const showPanelColor = computed(() => {
  if (hoveColor) {
    return hoveColor
  } else {
    return showColor
  }
})
// 计算属性：显示颜色
const showColor = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  } else {
    return props.defaultColor
  }
})
// 计算属性：颜色面板
const colorPanel = computed(() => {
  let colorArr = []
  for (let color of colorConfig) {
    colorArr.push(gradient(color[1], color[0], 5))
  }
  return colorArr
})

const html5ColorEl = ref<HTMLInputElement | null>(null)
const triggerHtml5Color = () => {
  html5ColorEl.value?.click()
}
// 更新组件的值
const updataValue = (value: string) => {
  emits('update:modelValue', value)
}
// 设置默认颜色
const handleDefaultColor = () => {
  updataValue(props.defaultColor)
}

/**
 * 颜色计算
 */
// 格式化 hex 颜色值
const parseColor = (hexStr: string) => {
  if (hexStr.length === 4) {
    return hexStr = '#' + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + hexStr[3] + hexStr[3]
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
  let rgb = []
  for (let i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)))
  }
  return rgb
}
// 计算渐变过渡颜色
const gradient = (startColor: string, endColor: string, step: number) => {
  // 讲 hex 转换为 rgb
  let sColor = hexToRgb(startColor)
  let eColor = hexToRgb(endColor)
  // 计算R\G\B每一步的差值
  let rStep = (eColor[0] - sColor[0]) / step
  let gStep = (eColor[1] - sColor[1]) / step
  let bStep = (eColor[2] - sColor[2]) / step
  let gradientColorArr = []
  // 计算每一步的hex值
  for (let i = 0; i < step; i++) {
    gradientColorArr.push(rgbToHex(rStep * i + sColor[0], gStep * i + sColor[1], bStep * i + sColor[2]))
  }
  return gradientColorArr
}
</script>

<template>
  <div class="m-colorPicker"  ref="colorPicker" v-on:click="event => { event.stopPropagation() }">
    <!-- 颜色显示小方块 -->
    <div class="colorBtn"
      v-bind:style="`background-color: ${showColor}`"
      v-on:click="openPanel"
      v-bind:class="{ disabled: disabled }"
    ></div>
    <!-- 颜色色盘 -->
    <div class="box" v-bind:class="{ open: openStatus }" >
      <div class="hd">
        <div class="colorView" v-bind:style="`background-color: ${showPanelColor}`"></div>
        <div class="defaultColor"
          v-on:click="handleDefaultColor"
          v-on:mouseover="hoveColor = defaultColor"
          v-on:mouseout="hoveColor = ''"
        >默认颜色</div>
      </div>
      <div class="bd">
        <h3>主题颜色</h3>
        <ul class="tColor">
          <li
            v-for="(color, index) of tColor"
            :key="index"
            v-bind:style="{ backgroundColor: color }"
            v-on:mouseover="hoveColor = color"
            v-on:mouseout="hoveColor = ''"
            v-on:click="updataValue(color)"
          ></li>
        </ul>
        <ul class="bColor">
          <li v-for="(item, index) of colorPanel" :key="index">
            <ul>
              <li
                v-for="(color, cindex) of item"
                :key="cindex"
                v-bind:style="{ backgroundColor: color }"
                v-on:mouseover="hoveColor = color"
                v-on:mouseout="hoveColor = ''"
                v-on:click="updataValue(color)"
              ></li>
            </ul>
          </li>
        </ul>
        <h3>标准颜色</h3>
        <ul class="tColor">
          <li
            v-for="(color, index) of bColor"
            :key="index"
            v-bind:style="{ backgroundColor: color }"
            v-on:mouseover="hoveColor = color"
            v-on:mouseout="hoveColor = ''"
            v-on:click="updataValue(color)"
          ></li>
        </ul>
        <h3 v-on:click="triggerHtml5Color">更多颜色...</h3>
        <!-- 用以激活HTML5颜色面板 -->
        <input type="color"
          ref="html5ColorEl"
          v-model="html5Color"
          v-on:change="updataValue(html5Color)">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.m-colorPicker{
  position: relative; text-align: left; font-size: 14px; display: inline-block;
  outline: none;
  ul,li,ol{ list-style: none; margin: 0; padding: 0; }
  .colorBtn{ width: 15px; height: 15px; }
  .colorBtn.disabled{ cursor: no-drop; }
  .box{
    position: absolute; width: 190px; background: #fff; border: 1px solid #ddd; visibility: hidden; border-radius: 2px; margin-top: 2px; padding: 10px; padding-bottom: 5px; box-shadow: 0 0 5px rgba(0,0,0,.15); opacity: 0; transition: all .3s ease;
    box-sizing: content-box;
    h3{ margin: 0; font-size: 14px; font-weight: normal; margin-top: 10px; margin-bottom: 5px; line-height: 1; color: #333; }
    input {
      visibility: hidden;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
  .box.open{ visibility: visible; opacity: 1;z-index: 1; }
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