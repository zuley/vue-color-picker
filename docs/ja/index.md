---
layout: home
hero:
  name: vColorPicker
  text: Vue 3 カラーピッカー
  tagline: 軽量でアクセシブルな Vue 3 カラーピッカーコンポーネント
  actions:
    - theme: brand
      text: はじめる
      link: /ja/#installation
    - theme: alt
      text: GitHub
      link: https://github.com/zuley/vue-color-picker

features:
  - title: 使いやすい
    details: シンプルな v-model API。角丸とトランジションを備えた洗練された UI
  - title: アクセシブル
    details: キーボードナビゲーション、ARIA ロール、フォーカス管理を完備。スクリーンリーダーにそのまま対応
  - title: SSR フレンドリー
    details: 決定的なファーストペイント、hydration 安全なロケール検出、共有 MutationObserver
  - title: テーマカスタマイズ
    details: CSS Variables を上書きするだけで配色やサイズを変更可能。セレクタの深掘りは不要
---

<script setup>
import { ref } from 'vue'
const color = ref('#ff0000')
const englishColor = ref('#3b82f6')
const japaneseColor = ref('#10b981')
const topColor = ref('#f59e0b')
</script>

## デモ

<div class="demo-container">
  <colorPicker v-model="color" />
  <p>選択中の色: <code>{{ color }}</code></p>
</div>

## 多言語対応

<div class="demo-container">
  <colorPicker v-model="englishColor" locale="en-US" />
  <p>英語表示: <code>{{ englishColor }}</code></p>
  <colorPicker v-model="japaneseColor" locale="ja-JP" />
  <p>日本語表示: <code>{{ japaneseColor }}</code></p>
</div>

```vue
<template>
  <colorPicker
    v-model="color"
    locale="ja-JP"
    :messages="{ moreColors: 'カスタムラベル...' }"
  />
</template>
```

## パネルの表示位置

デフォルトではビューポートの空きスペースに応じて自動配置されます。`placement` プロパティで任意の方向に固定することもできます。

<div class="demo-container">
  <colorPicker v-model="topColor" placement="top-end" />
  <p><code>top-end</code> に固定: <code>{{ topColor }}</code></p>
</div>

```vue
<colorPicker v-model="color" placement="top-end" />
<colorPicker v-model="color" placement="bottom" /> <!-- 縦方向のみ固定、横方向は自動 -->
```

## Teleport

ピッカーが `overflow: hidden` を持つコンテナ（テーブル、ダイアログ、カードなど）の中にあると、パネルが切り取られることがあります。`teleport` を設定すると、パネルを `document.body`（または任意の CSS セレクタ）に描画し、スクロールやリサイズに追従する fixed 配置になります。

```vue
<colorPicker v-model="color" teleport />
<colorPicker v-model="color" teleport="#popup-root" />
```

<div id="installation"></div>

## インストール

```bash
npm install vcolorpicker -S
```

## 使い方

`main.js` でプラグインを登録します：

```js
import { createApp } from 'vue'
import vcolorpicker from 'vcolorpicker'
import App from './App.vue'

const app = createApp(App)
app.use(vcolorpicker)
app.mount('#app')
```

コンポーネント内で使用します：

```vue
<template>
  <colorPicker v-model="color" />
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#ff0000')
</script>
```

## プロパティ Props

| プロパティ | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `v-model` / `modelValue` | `string` | — | 現在の色の値 |
| `defaultColor` | `string` | `#000000` | 「デフォルトカラー」ボタンでリセットされる色 |
| `disabled` | `boolean` | `false` | 無効状態 |
| `locale` | `'zh-CN' \| 'en-US' \| 'ja-JP'` | 自動検出 | パネルの組み込み文言の言語。省略時は `<html lang>` / `navigator.language` に追従 |
| `messages` | `Partial<ColorPickerMessages>` | — | 組み込みラベルをカスタム文言で上書き |
| `placement` | `ColorPickerPlacement` | `'auto'` | パネル位置：`'auto'` / `'top'` / `'bottom'` / `'top-start'` / `'top-end'` / `'bottom-start'` / `'bottom-end'`。`'auto'` はビューポートの空きスペースで自動決定、方向指定時はその軸を固定 |
| `teleport` | `boolean \| string` | `false` | パネルを `body`（`true`）または CSS セレクタで指定したコンテナに描画し、祖先の `overflow: hidden` による切り取りを回避 |

## イベント

| イベント名 | 引数 | 説明 |
| --- | --- | --- |
| `change` | `(color: string)` | 色の値が変更されたとき |
| `update:modelValue` | `(color: string)` | `v-model` 同期イベント |
| `open` | — | パネルが開いたとき |
| `close` | — | パネルが閉じたとき（外側クリック / Esc / 色選択後の自動クローズ）|
| `hover` | `(color: string)` | スウォッチにホバーしたとき。離れると空文字列を送出 |

```vue
<colorPicker v-model="color" @change="onColorChange" />
```

## 命令的 API

テンプレート ref 経由で公開されるメソッド：

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
  <button @click="openProgrammatically">パネルを開く</button>
</template>
```

| メソッド | 説明 |
| --- | --- |
| `open()` | パネルを開く（`disabled` 時は無効）|
| `close()` | パネルを閉じる |
| `focus()` | フォーカスをトリガーボタンに戻す |

## アクセシビリティ (a11y)

- トリガーボタンは `Tab` でフォーカス可能。`Enter` / `Space` で開閉、フォーカス中に `↑` / `↓` を押すとパネルを開いて最初のスウォッチにフォーカス
- スウォッチグリッドはローミングフォーカス（roving tabindex）方式：`Tab` 一回でグリッドに入り、`←` `→` `↑` `↓` でスウォッチ間を移動、`Home` / `End` で行頭 / 行末へジャンプ、`Enter` / `Space` で選択
- パネルを開いた状態で `Esc` を押すと閉じてフォーカスをトリガーに戻す
- トリガーは `role="button"` + `aria-haspopup="dialog"` + `aria-expanded`、パネルは `role="dialog"`、各スウォッチは `aria-label="#RRGGBB"` を持つ
- フォーカスリングは `:focus-visible` を使用し、マウス操作時には表示されない

## SSR / Nuxt

- Node 環境で `document` / `navigator` が存在しない場合、初期ロケールは `zh-CN`（または明示的な `locale` プロパティ）に固定され、サーバーとクライアントのファーストペイントが一致するため hydration mismatch は発生しません
- 実際の言語検出は `onMounted` 後に実行されます。マウント後に中国語から別の言語へ切り替わるちらつきを避けたい場合は、**SSR プロジェクトでは明示的に `locale` プロパティを渡すことを推奨します**
- `<html lang>` を監視する `MutationObserver` はモジュールレベルのシングルトンで、複数インスタンスでも 1 つの observer を共有します

## CSS Variables によるテーマ

セレクタの深掘りなしで、以下のカスタムプロパティを上書きするだけでテーマを変更できます：

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

例：ダークテーマ

```css
.dark .m-colorPicker {
  --vcp-panel-bg: #1f1f1f;
  --vcp-panel-border: 1px solid #333;
  --vcp-text-color: #eee;
}
```

> `teleport` を有効にするとパネルは `.m-colorPicker` の子孫ではなくなるため、テーマ変数は `.m-colorPicker-box`（パネルのルート）にも上書きするか、`:root` に定義して両方をカバーしてください。

## TypeScript

パッケージからエクスポートされる型：

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

## よくある質問

### vColorPicker は Vue 3 に対応していますか？

はい。vColorPicker は Vue 3 向けに設計されており、標準的な `v-model` API で利用できます。

### パネルの言語を切り替えられますか？

はい。`locale="zh-CN"`、`locale="en-US"`、`locale="ja-JP"` で組み込みの翻訳を利用でき、`messages` で任意のラベルを上書きすることもできます。

### TypeScript で使えますか？

はい。パッケージには props、emits、インスタンスメソッド、ヘルパー型を含む完全な型宣言が同梱されています。

### ブラウザネイティブのカラーピッカーには対応していますか？

はい。`その他のカラー...` をクリックすると、対応ブラウザでは HTML5 ネイティブの color input が開きます。

### キーボードやスクリーンリーダーで操作できますか？

はい。`Tab` でフォーカス、`Enter` / `Space` で操作、`Esc` で閉じることができ、ARIA ロールとラベルもすべて設定済みです。

## スポンサー

- [AI Prompt Card](https://aipromptcard.app)：シェアできる AI プロンプトカードを生成
- [Convert Image to WebP](https://convertimagetowebp.app)：オフラインで画像を WebP に変換
- [Open Agent Skills](https://openagentskills.dev)
- [Tools Online](https://toolsonline.run)
- [UI UX Pro Max Skill](https://ui-ux-pro-max-skill.com)
