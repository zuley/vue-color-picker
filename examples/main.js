import Vue from 'vue'
import App from './App.vue'

import ColorPicker from './../packages/index'

Vue.use(ColorPicker)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
