---
layout: home
hero:
  name: vColorPicker
  text: Vue 3 颜色选择器
  tagline: 轻量、易用的 Vue 3 颜色选择器组件
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/#installation
    - theme: alt
      text: GitHub
      link: https://github.com/zuley/vue-color-picker

features:
  - title: 简单易用
    details: 简洁的 API，支持 v-model，UI 优化增加了圆角和过渡动画
  - title: npm 安装
    details: 以 npm 形式安装，注册为全局组件，可在任何 Vue 3 项目中使用
  - title: HTML5 取色器
    details: 在支持的浏览器中通过 HTML5 原生 color input 实现「更多颜色」功能
---

<script setup>
import { ref } from 'vue'
const color = ref('#ff0000')
const englishColor = ref('#3b82f6')
const japaneseColor = ref('#10b981')
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

## 选项

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` | `string` | - | 当前颜色值 |
| `defaultColor` | `string` | `#000000` | 重置时的默认颜色 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP'` | 自动识别 | 面板内置文案语言，不传时自动跟随当前页面语言 |
| `messages` | `Partial<ColorPickerMessages>` | - | 用自定义文案覆盖内置语言包 |

## 事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `(color: string)` | 颜色值改变时触发 |

```vue
<colorPicker v-model="color" @change="onColorChange" />
```

## 常见问题

### vColorPicker 支持 Vue 3 吗？

支持。这个组件面向 Vue 3 项目设计，接入方式就是标准的 `v-model`。

### 可以切换组件面板语言吗？

可以。你可以通过 `locale="zh-CN"`、`locale="en-US"` 或 `locale="ja-JP"` 使用内置文案，也可以通过 `messages` 自定义覆盖面板文字。

### 这个组件支持 TypeScript 吗？

支持。当前包已经包含组件属性和插件注册所需的 TypeScript 类型声明。

### 是否支持浏览器原生取色器？

支持。点击 `更多颜色...` 后，会在兼容浏览器中调用 HTML5 原生取色器。

## 赞助

- [AI Prompt Card](https://aipromptcard.app)：生成可分享的 AI Prompt 卡片
- [Convert Image to WebP](https://convertimagetowebp.app)：离线图片转 WebP
- [Open Agent Skills](https://openagentskills.dev)
- [Tools Online](https://toolsonline.run)
- [UI UX Pro Max Skill](https://ui-ux-pro-max-skill.com)
