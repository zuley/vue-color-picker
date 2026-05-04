<template>
  <div id="app">
    <header class="page-header">
      <h1>vColorPicker</h1>
      <h2>基于 Vue 的颜色选择器插件</h2>
      <a href="https://github.com/zuley/vue-color-picker" class="btn" target="_blank">View on GitHub</a>
    </header>
    <main class="page-content" v-hljs>
      <h2>使用文档</h2>
      <p>本插件仿照<code>Angular</code>的<code><a href="http://zhangbobell.github.io/color-picker/" target="_blank">color-picker</a></code>插件制作</p>
      <h2>Demo</h2>
      <colorPicker v-model="color" @change="headleChangeColor"></colorPicker>
      <h2>特点</h2>
      <ol>
        <li>简单易用，UI在原插件基础上优化增加了圆角和过渡动画</li>
        <li>提供以 npm 的形式安装提供全局组件</li>
        <li>在支持 html5 input[type='color'] 的浏览器实现了「更多颜色」的功能</li>
      </ol>
      <h2>安装</h2>
      <pre>$ npm install vcolorpicker -S</pre>
      <h2>使用</h2>
      <h3>在 `main.js` 文件中引入插件并注册</h3>
<pre># main.js
import vcolorpicker from 'vcolorpicker'
Vue.use(vcolorpicker)
</pre>
      <h3>在项目中使用 vcolorpicker</h3>
<pre>&lt;template&gt;
  &lt;colorPicker v-model=&quot;color&quot; /&gt;
&lt;/template&gt;
&lt;script&gt;
  export default {
    data () {
      return {
        color: &#x27;#ff0000&#x27;
      }
    }
  }
&lt;/script&gt;</pre>
      <h2>选项</h2>
      <p>你可以通过在所在的元素上设置以下属性来配置<code>color-picker</code></p>
      <ol>
        <li><code>defaultColor</code>：默认颜色，如<code>defaultColor="#ff0000"</code></li>
        <li><code>disabled</code>：禁用状态，如<code>disabled=true</code></li>
      </ol>
      <h2>事件</h2>
      <p><code>change</code>颜色值改变的时候触发</p>
<pre>&lt;colorPicker v-model=&quot;color&quot; v-on:change=&quot;headleChangeColor&quot;&gt;&lt;/colorPicker&gt;
</pre>
    </main>
    <section class="page-sponsor" aria-label="赞助">
      <div class="page-sponsor__inner">
        <h2>赞助</h2>
        <p>感谢赞助商支持：</p>
        <div class="page-sponsor__links">
          <a href="https://aipromptcard.app" target="_blank" rel="noopener noreferrer">AI Prompt Card：生成可分享的 AI Prompt 卡片</a>
          <a href="https://convertimagetowebp.app" target="_blank" rel="noopener noreferrer">Convert Image to WebP：离线图片转 WebP</a>
          <a href="https://openagentskills.dev" target="_blank" rel="noopener noreferrer">Open Agent Skills</a>
          <a href="https://toolsonline.run" target="_blank" rel="noopener noreferrer">Tools Online</a>
          <a href="https://ui-ux-pro-max-skill.com" target="_blank" rel="noopener noreferrer">UI UX Pro Max Skill</a>
        </div>
      </div>
    </section>
    <footer class="page-footer">Vue-color-picker 插件由<a href="https://www.rxshc.com/" target="_blank">猪不乐意</a>编写</footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const color = ref('#ff0000')

const headleChangeColor = (color: string) => {
  console.log(`颜色值改变事件：${color}`)
}
</script>

<style lang="scss">
@use "assets/main";
</style>
