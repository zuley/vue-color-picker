<template>
  <div id="app">
    <div class="page-header">
      <h1>Vue-color-picker</h1>
      <h2>基于Vue2.0的颜色选择器插件</h2>
      <a href="#" class="btn">View on GitHub</a>
      <a href="#" class="btn">下载整个项目</a>
      <a href="#" class="btn">只下载插件</a>
    </div>
    <div class="page-content">
      <h1>Vue-color-picker</h1>
      <p>本插件仿照<code>Angular</code>的<code><a href="http://zhangbobell.github.io/color-picker/" target="_blank">color-picker</a></code>插件制作</p>
      <h2>Demo</h2>
      <colorPicker v-model="color" v-on:change="headleChangeColor"></colorPicker>
      <h2>特点</h2>
      <ol>
        <li>简单易用，UI在原插件基础上优化增加了圆角和过渡动画</li>
        <li>提供以插件的形式安装提供全局组件</li>
        <li>提供单独以组件的方式按需引入</li>
        <li>在支持 html5 input[type='color'] 的浏览器实现了「更多颜色」的功能</li>
      </ol>
      <h2>获取</h2>
      <p>你可以直接下载整个项目，然后提取其中的<code>/src/plugin/vue-color-picker</code>目录使用。</p>
      <p>也可以直接只下载插件</p>
      <h2>用法</h2>
      <h3>以插件的形式安装</h3>
<pre>// 导入插件
import colorPicker from './plugin/vue-color-picker'
// 注册插件
Vue.use(colorPicker)

// 在组件的 temelate 中直接使用
&lt;colorPicker v-model=&quot;color&quot;&gt;&lt;/colorPicker&gt;
</pre>
      <h3>以组件的时候安装</h3>
<pre>// 在组件中导入插件
import colorPicker from './plugin/vue-color-picker/colorPicker'
// 在组件中注册插件
export default {
  components: { colorPicker }
}
// 在组件的 temelate 中直接使用
&lt;colorPicker v-model=&quot;color&quot;&gt;&lt;/colorPicker&gt;
</pre>
      <h2>选项</h2>
      <p>你可以通过在所在的元素上设置以下属性来配置<code>color-picker</code></p>
      <ol>
        <li><code>defaultColor</code>：默认颜色，如<code>defaultColor="#ff0000"</code></li>
        <li><code>disabled</code>：禁用状态，如<code>disabled=true</code></li>
      </ol>
      <h2>事件</h2>
      <p><code>change</code>颜色值改变的时候触发</p>
<pre>&lt;colorPicker v-model=&quot;color&quot; v-on:change=&quot;headleChangeColor&quot;&gt;&lt;/colorPicker
</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      color: '#f00'
    }
  },
  methods: {
    headleChangeColor (color) {
      console.log(`颜色值改变事件：${color}`)
    }
  }
}
</script>

<style lang="sass">
@import "assets/style.scss"
</style>
