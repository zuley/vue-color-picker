# vColorPicker

> 基于 Vue 3 的颜色选择器插件
[DEMO 演示](https://vue-color-picker.rxshc.com/)

## 安装

``` bash
# vue2
npm install vcolorpicker@1.1.0 -S
# vue3
npm install vcolorpicker -S
```

## 使用

### vue3 使用

在 `main.ts` 文件中引入并注册

```ts
import vColorPicker from 'vcolorpicker'
const app = createApp(App)
app.use(vColorPicker)
```

在页面中使用

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const color = ref('#ff0000')
const handleChangeColor = (color: string) => {
  console.log(`颜色值改变事件：${color}`)
}
</script>
<template>
  <colorPicker v-model="color" @change="handleChangeColor"></colorPicker>
</template>
```

多语言使用示例

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const color = ref('#3b82f6')
</script>

<template>
  <colorPicker
    v-model="color"
    locale="en-US"
    :messages="{ moreColors: 'Custom Label...' }"
  />
</template>
```

### vue2 使用

在 `main.js` 文件中引入插件并注册

``` bash
# main.js
import vcolorpicker from 'vcolorpicker'
Vue.use(vcolorpicker)
```

在项目中使用 vcolorpicker

```js
<template>
  <colorPicker v-model="color" />
</template>
<script>
  export default {
    data () {
      return {
        color: '#ff0000'
      }
    }
  }
</script>
```

## 特点

1. 简单易用，支持 `v-model`，UI 增加了圆角和过渡动画
2. 提供以 `npm` 的形式安装提供全局组件
3. 在支持 html5 input[type='color'] 的浏览器实现了「更多颜色」的功能
4. **完整的键盘 / 屏幕阅读器可访问性**：`Tab` 聚焦、`Enter` / `Space` 激活、`Esc` 关闭，所有色块都带 `aria-label`
5. **SSR 友好**：服务端渲染输出确定性 fallback，客户端挂载后再做语言检测，无 hydration mismatch
6. **CSS Variables 主题化**：无需选择器穿透就能定制配色和尺寸

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` / `modelValue` | `string` | — | 当前颜色值 |
| `defaultColor` | `string` | `#000000` | 「默认颜色」按钮重置使用的颜色 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP'` | 自动检测 | 面板内置文案语言；不传时跟随 `<html lang>` / `navigator.language` |
| `messages` | `Partial<ColorPickerMessages>` | — | 自定义文案对象，覆盖 `defaultColor` / `themeColors` / `standardColors` / `moreColors` |
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

``` js
<colorPicker v-model="color" @change="handleChangeColor" />
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

## 可访问性（a11y）

- 触发按钮可通过 `Tab` 聚焦；`Enter` / `Space` 激活；触发按钮聚焦时按 `↑` / `↓` 打开面板并聚焦第一个色块
- 色块网格采用漫游焦点（roving tabindex）：`Tab` 一次进入网格，之后用 `←` `→` `↑` `↓` 在色块间移动，`Home` / `End` 跳到行首 / 行尾，`Enter` / `Space` 选中
- 面板打开后按 `Esc` 关闭并把焦点送回触发按钮
- 触发按钮带 `role="button"` + `aria-haspopup="dialog"` + `aria-expanded`，面板带 `role="dialog"`，每个色块带 `aria-label="#RRGGBB"`
- 焦点环使用 `:focus-visible`，鼠标用户不会被打扰

## SSR / Nuxt

- 在 Node 环境无 `document` / `navigator` 时，初始 locale 固定为 `zh-CN`（或显式 `locale` prop），保证服务端和客户端首屏一致
- 组件 `onMounted` 后才执行真正的语言检测；如果要避免挂载后从中文跳变到其他语言的闪动，**建议在 SSR 场景显式传 `locale` prop**
- `MutationObserver` 监听 `<html lang>` 变化时是模块级单例，多实例只占一份资源

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

## 赞助

感谢赞助商支持：

- <a href="https://aipromptcard.app" target="_blank" rel="noopener">AI Prompt Card：生成可分享的 AI Prompt 卡片</a>
- <a href="https://convertimagetowebp.app" target="_blank" rel="noopener">Convert Image to WebP：离线图片转 WebP</a>
- <a href="https://openagentskills.dev" target="_blank" rel="noopener">Open Agent Skills</a>
- <a href="https://toolsonline.run" target="_blank" rel="noopener">Tools Online</a>
- <a href="https://ui-ux-pro-max-skill.com" target="_blank" rel="noopener">UI UX Pro Max Skill</a>
