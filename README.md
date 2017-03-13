# vue-color-picker

> 基于Vue2.0的颜色选择器插件

## 运行DEMO项目

``` bash
# 安装依赖
npm install

# 运行项目
npm run dev

# 编译项目
npm run build

```
## 特点
1. 简单易用，UI在原插件基础上优化增加了圆角和过渡动画
2. 提供以插件的形式安装提供全局组件
3. 提供单独以组件的方式按需引入
4. 在支持 html5 input[type='color'] 的浏览器实现了「更多颜色」的功能

## 获取
你可以直接下载整个项目，然后提取其中的`/src/plugin/vue-color-picker`目录使用。
也可以直接只下载插件

## 用法

### 以插件的形式安装
```
// 导入插件
import colorPicker from './plugin/vue-color-picker'
// 注册插件
Vue.use(colorPicker)

// 在组件的 temelate 中直接使用
<colorPicker v-model="color"></colorPicker>
```

### 以组件的形式安装
```
// 在组件中导入插件
import colorPicker from './plugin/vue-color-picker/colorPicker'
// 在组件中注册插件
export default {
  components: { colorPicker }
}
// 在组件的 temelate 中直接使用
<colorPicker v-model="color"></colorPicker>
```

## 选项
你可以通过在所在的元素上设置以下属性来配置`color-picker`
1. `defaultColor`：默认颜色，如`defaultColor="#ff0000"`
2. `disabled`：禁用状态，如`disabled=true`

## 事件
`change`颜色值改变的时候触发

```
<colorPicker v-model="color" v-on:change="headleChangeColor"></colorPicker>
```


