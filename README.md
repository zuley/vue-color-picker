# vColorPicker

> 基于Vue的颜色选择器插件
[DEMO 演示](http://vue-color-picker.rxshc.com/)

## 安装

``` bash
# vue2
npm install vcolorpicker@1.1.0 -S
# vue3
npm install vcolorpicker -S
```
## 使用
### vue3 使用
在`main.ts`文件中引入并注册
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
const headleChangeColor = (color: string) => {
  console.log(`颜色值改变事件：${color}`)
}
</script>
<template>
  <colorPicker v-model="color" @change="headleChangeColor"></colorPicker>
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
1. 简单易用，UI在原插件基础上优化增加了圆角和过渡动画
2. 提供以 `npm` 的形式安装提供全局组件
3. 在支持 html5 input[type='color'] 的浏览器实现了「更多颜色」的功能

## 选项
你可以通过在所在的元素上设置以下属性来配置`color-picker`
1. `defaultColor`：默认颜色，如`defaultColor="#ff0000"`
2. `disabled`：禁用状态，如`disabled=true`

## 事件
`change`颜色值改变的时候触发

``` js
<colorPicker v-model="color" @change="headleChangeColor" />
```