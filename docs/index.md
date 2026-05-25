---
layout: home
hero:
  name: vColorPicker
  text: Vue 3 Color Picker
  tagline: A lightweight, easy-to-use color picker component for Vue 3
  actions:
    - theme: brand
      text: Get Started
      link: /#installation
    - theme: alt
      text: GitHub
      link: https://github.com/zuley/vue-color-picker

features:
  - title: Easy to Use
    details: Simple API with v-model support, optimized UI with rounded corners and smooth transitions
  - title: npm Package
    details: Install via npm and register as a global component, ready to use in any Vue 3 project
  - title: HTML5 Color Picker
    details: Supports "More Colors" via native HTML5 color input in compatible browsers
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

## Options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `v-model` | `string` | - | Current color value |
| `defaultColor` | `string` | `#000000` | Default color when reset |
| `disabled` | `boolean` | `false` | Disabled state |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP'` | Auto | Built-in locale used by panel labels, follows page language when omitted |
| `messages` | `Partial<ColorPickerMessages>` | - | Override built-in labels with custom text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `change` | `(color: string)` | Triggered when color value changes |

```vue
<colorPicker v-model="color" @change="onColorChange" />
```

## FAQ

### Does vColorPicker support Vue 3?

Yes. vColorPicker is built for Vue 3 and can be used with a standard `v-model` API.

### Can I switch the panel language?

Yes. Set `locale="zh-CN"`, `locale="en-US"` or `locale="ja-JP"` to use built-in translations, or pass `messages` to override any label.

### Does it work with TypeScript?

Yes. The package ships with TypeScript declaration files for component props and plugin installation.

### Does it support the native browser color picker?

Yes. Clicking `More Colors...` opens the native HTML5 color input in supported browsers.

## Sponsors

- [AI Prompt Card](https://aipromptcard.app): Generate shareable AI Prompt cards
- [Convert Image to WebP](https://convertimagetowebp.app): Offline image to WebP converter
- [Open Agent Skills](https://openagentskills.dev)
- [Tools Online](https://toolsonline.run)
- [UI UX Pro Max Skill](https://ui-ux-pro-max-skill.com)
