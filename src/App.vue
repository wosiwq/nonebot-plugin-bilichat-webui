<template>
  <ElConfigProvider :locale="locale">
    <BaseView />
  </ElConfigProvider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { ref } from 'vue'
import BaseView from './views/BaseView.vue'
const locale = ref(zhCn)
</script>

<style>
#app {
  height: 100%;
  width: 100%;
  margin: 0;
}
body {
  width: 100%;
  height: 100%;
  margin: 0;
}
html {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
