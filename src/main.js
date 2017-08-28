// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

console.log('主分支修改')

Vue.config.productionTip = false

// 导入插件
import colorPicker from './plugin/vue-color-picker'
// 注册插件
Vue.use(colorPicker)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
