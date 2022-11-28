import { createApp } from 'vue'
import App from './App.vue'
import vColorPicker from './../packages/main'

const app = createApp(App)

app.use(vColorPicker)

app.mount('#app')
