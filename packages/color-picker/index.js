// 导入组件
import Button from './src/color-picker.vue'

// 为组件提供 install 安装方法，供按需引入
Button.install = function (Vue) {
  Vue.component(Button.name, Button)
}

// 默认导出组件
export default Button
