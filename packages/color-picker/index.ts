import type { Plugin } from "vue"
// 导入组件
import colorPicker from "./src/index.vue"

// 为组件提供 install 安装方法，供按需引入
colorPicker.install = function (app) {
  app.component(colorPicker.name ?? 'colorPicker', colorPicker)
} as Plugin

// 默认导出组件
export default colorPicker