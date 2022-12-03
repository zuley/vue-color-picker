<script setup lang="ts">
import { ref } from 'vue';

const color = ref('')
const headleChangeColor = (val: string) => {
  console.log('颜色改变', val)
}
</script>

<template>
  <colorPicker v-model="color" @update:modelValue="headleChangeColor" />
</template>
