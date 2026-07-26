---
layout: home
hero:
  name: vColorPicker
  text: Vue 3 Color Picker
  tagline: A lightweight, accessible color picker component for Vue 3
  actions:
    - theme: brand
      text: Get Started
      link: /#installation
    - theme: alt
      text: GitHub
      link: https://github.com/zuley/vue-color-picker

features:
  - title: Easy to Use
    details: Simple v-model API with rounded corners, smooth transitions, and a refined UI
  - title: Accessible
    details: Full keyboard navigation, ARIA roles, focus management — works with screen readers out of the box
  - title: SSR Friendly
    details: Deterministic first paint, hydration-safe locale detection, single shared MutationObserver
  - title: Themeable
    details: Override CSS Variables for colors and sizing — no selector piercing required
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
  <p>Selected color: <code>{{ color }}</code></p>
</div>

## Localization

<div class="demo-container">
  <colorPicker v-model="englishColor" locale="en-US" />
  <p>English locale: <code>{{ englishColor }}</code></p>
  <colorPicker v-model="japaneseColor" locale="ja-JP" />
  <p>Japanese locale: <code>{{ japaneseColor }}</code></p>
</div>

```vue
<template>
  <colorPicker
    v-model="color"
    locale="en-US"
    :messages="{ moreColors: 'Custom Label...' }"
  />
</template>
```

## Placement

The panel auto-detects available viewport space by default. You can lock it to any side with the `placement` prop.

<div class="demo-container">
  <colorPicker v-model="topColor" placement="top-end" />
  <p>Pinned to <code>top-end</code>: <code>{{ topColor }}</code></p>
</div>

```vue
<colorPicker v-model="color" placement="top-end" />
<colorPicker v-model="color" placement="bottom" /> <!-- vertical locked, horizontal auto -->
```

## Teleport

When the picker sits inside a container with `overflow: hidden` (tables, dialogs, cards), the panel can get clipped. Set `teleport` to render the panel into `document.body` (or any CSS selector) with fixed positioning that tracks the trigger on scroll and resize.

```vue
<colorPicker v-model="color" teleport />
<colorPicker v-model="color" teleport="#popup-root" />
```

## Installation

```bash
npm install vcolorpicker -S
```

## Usage

Register the plugin in `main.js`:

```js
import { createApp } from 'vue'
import vcolorpicker from 'vcolorpicker'
import App from './App.vue'

const app = createApp(App)
app.use(vcolorpicker)
app.mount('#app')
```

Use in your component:

```vue
<template>
  <colorPicker v-model="color" />
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#ff0000')
</script>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `v-model` / `modelValue` | `string` | — | Current color value |
| `defaultColor` | `string` | `#000000` | Color the "Default" button resets to |
| `disabled` | `boolean` | `false` | Disabled state |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP'` | Auto | Built-in panel labels; follows `<html lang>` / `navigator.language` when omitted |
| `messages` | `Partial<ColorPickerMessages>` | — | Override built-in labels with custom text |
| `placement` | `ColorPickerPlacement` | `'auto'` | Panel placement: `'auto'`, `'top'`, `'bottom'`, `'top-start'`, `'top-end'`, `'bottom-start'`, `'bottom-end'`. `'auto'` picks based on available viewport space; directional values lock that axis |
| `teleport` | `boolean \| string` | `false` | Render the panel into `body` (`true`) or a CSS selector target, escaping `overflow: hidden` ancestors |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `change` | `(color: string)` | Color value changed |
| `update:modelValue` | `(color: string)` | `v-model` sync event |
| `open` | — | Panel opened |
| `close` | — | Panel closed (outside click, `Esc`, or after selection) |
| `hover` | `(color: string)` | Swatch hover; emits empty string on leave |

```vue
<colorPicker v-model="color" @change="onColorChange" />
```

## Imperative API

Methods exposed via template ref:

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
  <button @click="openProgrammatically">Open Panel</button>
</template>
```

| Method | Description |
| --- | --- |
| `open()` | Open the panel (no-op when `disabled`) |
| `close()` | Close the panel |
| `focus()` | Move focus back to the trigger button |

## Accessibility

- Trigger button is reachable via `Tab`; `Enter` / `Space` activates; `↑` / `↓` on a focused trigger opens the panel and focuses the first swatch
- The swatch grid uses a roving tabindex: `Tab` enters the grid once, then `←` `→` `↑` `↓` move between swatches, `Home` / `End` jump within a row, `Enter` / `Space` selects
- `Esc` closes the panel and returns focus to the trigger
- Trigger carries `role="button"`, `aria-haspopup="dialog"`, `aria-expanded`; the panel uses `role="dialog"`; every swatch has `aria-label="#RRGGBB"`
- Focus rings use `:focus-visible`, so mouse users are not distracted

## SSR / Nuxt

- When `document` / `navigator` are unavailable (Node SSR), the initial locale falls back to `zh-CN` (or the explicit `locale` prop) so server and client render identically — no hydration mismatch
- Real language detection runs after `onMounted`. To avoid a post-mount flicker from Chinese to another language, **pass an explicit `locale` prop in SSR projects**
- The `MutationObserver` watching `<html lang>` is a module-level singleton — multiple component instances share a single observer

## CSS Variables

Override these custom properties to theme the component without piercing selectors:

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

Example — dark theme:

```css
.dark .m-colorPicker {
  --vcp-panel-bg: #1f1f1f;
  --vcp-panel-border: 1px solid #333;
  --vcp-text-color: #eee;
}
```

> With `teleport` enabled the panel is no longer a descendant of `.m-colorPicker`, so also override `.m-colorPicker-box` (the panel root) — or define the variables on `:root` to cover both.

## TypeScript

Types exported from the package:

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

## FAQ

### Does vColorPicker support Vue 3?

Yes. vColorPicker is built for Vue 3 and can be used with a standard `v-model` API.

### Can I switch the panel language?

Yes. Set `locale="zh-CN"`, `locale="en-US"` or `locale="ja-JP"` to use built-in translations, or pass `messages` to override any label.

### Does it work with TypeScript?

Yes. The package ships with full type declarations — props, emits, instance methods, and helper types.

### Does it support the native browser color picker?

Yes. Clicking `More Colors...` opens the native HTML5 color input in supported browsers.

### Is it accessible to keyboard and screen reader users?

Yes. `Tab` to focus, `Enter` / `Space` to activate, `Esc` to close, and ARIA roles / labels are all wired up.

## Sponsors

- [AI Prompt Card](https://aipromptcard.app): Generate shareable AI Prompt cards
- [Convert Image to WebP](https://convertimagetowebp.app): Offline image to WebP converter
- [Open Agent Skills](https://openagentskills.dev)
- [Tools Online](https://toolsonline.run)
- [UI UX Pro Max Skill](https://ui-ux-pro-max-skill.com)
