---
layout: home
hero:
  name: vColorPicker
  text: Vue 3 颜色选择器
  tagline: 轻量、可访问的 Vue 3 颜色选择器组件
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/#installation
    - theme: alt
      text: GitHub
      link: https://github.com/zuley/vue-color-picker

features:
  - title: 简单易用
    details: 简洁的 v-model API，UI 圆角和过渡动画都已就位
  - title: 可访问性完善
    details: 完整的键盘导航、ARIA 角色和焦点管理，开箱即用支持屏幕阅读器
  - title: SSR 友好
    details: 首屏渲染确定性，hydration 安全，语言检测延后到挂载之后
  - title: 主题化
    details: 通过覆盖 CSS Variables 自定义配色和尺寸，无需选择器穿透
---

<script setup>
import { ref } from 'vue'
const color = ref('#ff0000')
const englishColor = ref('#3b82f6')
const japaneseColor = ref('#10b981')
const topColor = ref('#f59e0b')
</script>

## Demo

<div class="demo-container">
  <colorPicker v-model="color" />
  <p>选中的颜色: <code>{{ color }}</code></p>
</div>

## 多语言

<div class="demo-container">
  <colorPicker v-model="englishColor" locale="en-US" />
  <p>英文文案: <code>{{ englishColor }}</code></p>
  <colorPicker v-model="japaneseColor" locale="ja-JP" />
  <p>日文文案: <code>{{ japaneseColor }}</code></p>
</div>

```vue
<template>
  <colorPicker
    v-model="color"
    locale="en-US"
    :messages="{ moreColors: '自定义文案...' }"
  />
</template>
```

## 面板位置

默认按视口剩余空间自动选位，也可以通过 `placement` 锁定到任意一侧。

<div class="demo-container">
  <colorPicker v-model="topColor" placement="top-end" />
  <p>固定到 <code>top-end</code>: <code>{{ topColor }}</code></p>
</div>

```vue
<colorPicker v-model="color" placement="top-end" />
<colorPicker v-model="color" placement="bottom" /> <!-- 锁定向下，水平自动 -->
```

## Teleport 传送

当组件位于 `overflow: hidden` 的容器（表格、弹窗、卡片）内时，面板可能被裁剪。设置 `teleport` 可把面板渲染到 `document.body`（或任意 CSS 选择器目标），使用 fixed 定位并在滚动 / 缩放时自动跟随触发器。

```vue
<colorPicker v-model="color" teleport />
<colorPicker v-model="color" teleport="#popup-root" />
```

<div id="installation"></div>

## 安装

```bash
npm install vcolorpicker -S
```

## 使用

在 `main.js` 中引入插件并注册：

```js
import { createApp } from 'vue'
import vcolorpicker from 'vcolorpicker'
import App from './App.vue'

const app = createApp(App)
app.use(vcolorpicker)
app.mount('#app')
```

在组件中使用：

```vue
<template>
  <colorPicker v-model="color" />
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#ff0000')
</script>
```

## 属性 Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` / `modelValue` | `string` | — | 当前颜色值 |
| `defaultColor` | `string` | `#000000` | 「默认颜色」按钮重置使用的颜色 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP'` | 自动检测 | 面板内置文案语言；不传时跟随 `<html lang>` / `navigator.language` |
| `messages` | `Partial<ColorPickerMessages>` | — | 用自定义文案覆盖内置语言包 |
| `placement` | `ColorPickerPlacement` | `'auto'` | 面板位置：`'auto'` / `'top'` / `'bottom'` / `'top-start'` / `'top-end'` / `'bottom-start'` / `'bottom-end'`。`'auto'` 根据视口剩余空间自动决定；带方向时锁定对应轴 |
| `teleport` | `boolean \| string` | `false` | 把面板渲染到 `body`（`true`）或 CSS 选择器指定的容器，避免被祖先 `overflow: hidden` 裁剪 |

## 事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `(color: string)` | 颜色值改变时触发 |
| `update:modelValue` | `(color: string)` | `v-model` 同步事件 |
| `open` | — | 面板打开时触发 |
| `close` | — | 面板关闭时触发（点击外部 / Esc / 选色后自动关闭）|
| `hover` | `(color: string)` | 鼠标移到色块时触发；离开时携带空字符串 |

```vue
<colorPicker v-model="color" @change="onColorChange" />
```

## 命令式 API

通过模板 ref 暴露的方法可命令式控制组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ColorPickerInstance } from 'vcolorpicker'

const pickerRef = ref<ColorPickerInstance>()
const color = ref('#ff0000')

const openProgrammatically = () => pickerRef.value?.open()
</script>

<template>
  <colorPicker ref="pickerRef" v-model="color" />
  <button @click="openProgrammatically">打开面板</button>
</template>
```

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开面板（`disabled` 时无效）|
| `close()` | 关闭面板 |
| `focus()` | 把焦点移回触发按钮 |

## 可访问性 (a11y)

- 触发按钮可通过 `Tab` 聚焦；`Enter` / `Space` 激活；触发按钮聚焦时按 `↑` / `↓` 打开面板并聚焦第一个色块
- 色块网格采用漫游焦点（roving tabindex）：`Tab` 一次进入网格，之后用 `←` `→` `↑` `↓` 在色块间移动，`Home` / `End` 跳到行首 / 行尾，`Enter` / `Space` 选中
- 面板打开后按 `Esc` 关闭并把焦点送回触发按钮
- 触发按钮带 `role="button"` + `aria-haspopup="dialog"` + `aria-expanded`；面板带 `role="dialog"`；每个色块带 `aria-label="#RRGGBB"`
- 焦点环使用 `:focus-visible`，鼠标用户不会被打扰

## SSR / Nuxt

- 在 Node 环境无 `document` / `navigator` 时，初始 locale 固定为 `zh-CN`（或显式 `locale` prop），保证服务端和客户端首屏一致，无 hydration mismatch
- 真正的语言检测在 `onMounted` 后才执行。如果要避免挂载后从中文跳变到其他语言的闪动，**建议在 SSR 场景显式传 `locale` prop**
- 监听 `<html lang>` 变化的 `MutationObserver` 是模块级单例，多实例只占一份资源

## CSS Variables 主题化

无需穿透选择器，覆盖以下变量即可：

```css
.m-colorPicker {
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
}
```

例：暗色主题

```css
.dark .m-colorPicker {
  --vcp-panel-bg: #1f1f1f;
  --vcp-panel-border: 1px solid #333;
  --vcp-text-color: #eee;
}
```

> 开启 `teleport` 后面板不再是 `.m-colorPicker` 的后代节点，主题变量需要同时覆盖 `.m-colorPicker-box`（面板根节点），或直接定义在 `:root` 上一次覆盖两者。

## TypeScript

包内导出的类型：

```ts
import type {
  ColorPickerProps,
  ColorPickerEmits,
  ColorPickerExposed,
  ColorPickerInstance,
  ColorPickerLocale,
  ColorPickerMessages,
  ColorPickerPlacement
} from 'vcolorpicker'
```

## 常见问题

### vColorPicker 支持 Vue 3 吗？

支持。这个组件面向 Vue 3 项目设计，接入方式就是标准的 `v-model`。

### 可以切换组件面板语言吗？

可以。通过 `locale="zh-CN"`、`locale="en-US"` 或 `locale="ja-JP"` 使用内置文案，也可以通过 `messages` 自定义覆盖面板文字。

### 这个组件支持 TypeScript 吗？

支持。当前包提供完整的类型声明：props、emits、实例方法和辅助类型都有导出。

### 是否支持浏览器原生取色器？

支持。点击 `更多颜色...` 后，会在兼容浏览器中调用 HTML5 原生取色器。

### 键盘和屏幕阅读器能用吗？

可以。`Tab` 聚焦、`Enter` / `Space` 激活、`Esc` 关闭，ARIA 角色和标签都已配置完整。

## 赞助

- [AI Prompt Card](https://aipromptcard.app)：生成可分享的 AI Prompt 卡片
- [Convert Image to WebP](https://convertimagetowebp.app)：离线图片转 WebP
- [Open Agent Skills](https://openagentskills.dev)
- [Tools Online](https://toolsonline.run)
- [UI UX Pro Max Skill](https://ui-ux-pro-max-skill.com)
