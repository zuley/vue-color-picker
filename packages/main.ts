import type { Plugin } from 'vue'
// 导入颜色选择器组件
import colorPicker from './color-picker'

// 存储组件列表
const components = [
  colorPicker
]

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install: Plugin['install'] = function (app) {
  // 遍历注册全局组件
  components.map(component => app.component(component.name, component))
}

export default {
  install,
  colorPicker
}