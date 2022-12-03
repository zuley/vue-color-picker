<script lang="ts">
// 声明无法在 <script setup> 中声明的选项
export default {
  name: "colorPicker"
}
</script>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  测试组件
  <div class="add" @click="$emit('update:modelValue', 'ddd')">add</div>
</template>