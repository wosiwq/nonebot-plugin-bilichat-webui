<template>
  <ElContainer>
    <ElHeader class="flex items-center">
      <ElButton class="ml-a" @click="isVisible = true" type="primary">更换url</ElButton>
      <ElButton @click="isVisible = true" type="primary">更新cookie</ElButton>
    </ElHeader>
    <ElMain>
      <ElRow :gutter="20">
        <ElCol :sm="12">
          <span>配置文件</span>
          <ElInput
            @change="handleFormattedBilichatChange"
            v-model="formattedBilichat"
            :rows="20"
            type="textarea"
            placeholder="配置文件"></ElInput>
          <ElButton>保存提交</ElButton>
        </ElCol>
        <ElCol :sm="12" v-if="bilichat">
          <span>可视化修改</span>
          <ElForm label-width="130px" :model="bilichat" v-if="bilichat">
            <ElFormItem label="全局订阅数量限制">
              <ElInputNumber
                v-model="bilichat.config.subs_limit"
                placeholder="默认为 5"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="动态轮询间隔">
              <ElInputNumber
                v-model="bilichat.config.dynamic_interval"
                placeholder="默认为 90。"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="直播轮询间隔">
              <ElInputNumber
                v-model="bilichat.config.live_interval"
                placeholder="默认为 30。"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="每条推送的延迟">
              <ElInputNumber
                v-model="bilichat.config.push_delay"
                placeholder="默认为 3。"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="是否启用gRPC">
              <ElSwitch v-model="bilichat.config.dynamic_grpc"></ElSwitch>
            </ElFormItem>
          </ElForm>
          <span v-else>未读取到bilichat配置</span>
        </ElCol>
      </ElRow>
    </ElMain>
  </ElContainer>
  <ElDialog
    v-loading.fullscreen.lock="false"
    v-model="isVisible"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="isNotFirst">
    <template #header>
      {{ isNotFirst ? '更换URL' : '你似乎是第一次使用BILICHAT WEB UI，请输入你的URL' }}
    </template>
    <ElForm @submit.prevent="handleDialogConfirm">
      <ElFormItem label="URL:">
        <ElInput v-model="inputUrl" placeholder="在这里输入你的URL"></ElInput>
      </ElFormItem>
      <ElFormItem><ElButton @click="handleDialogConfirm">确定</ElButton></ElFormItem>
    </ElForm>
  </ElDialog>
</template>
<script lang="ts" setup>
import type { BiliChat } from '@/types'
import axios from 'axios'

const isNotFirst = ref(Boolean(localStorage.getItem('isNotFirst')))
const isVisible = ref(!isNotFirst.value)
const inputUrl = ref('')
const URL = ref(localStorage.getItem('URL'))
const isUrlEndWithSlash = computed(() => inputUrl.value?.endsWith('/'))
const bilichat = ref<BiliChat>()
const formattedBilichat = ref<string>()

watch(
  () => URL.value,
  (newVal) => {
    if (newVal) {
      axios.get(newVal + '/subs_config').then((res) => {
        bilichat.value = res.data
        console.log(bilichat.value)
      })
    }
  }
)
watch(
  () => bilichat.value,
  (newVal) => {
    if (newVal) {
      formattedBilichat.value = JSON.stringify(newVal, null, 2)
    }
  },
  { deep: true }
)

onMounted(() => {
  if (URL.value) {
    axios.get<BiliChat>(URL.value + '/subs_config').then((res) => {
      bilichat.value = res.data
      console.log(bilichat.value)
    })
  }
})

const handleFormattedBilichatChange = (val: string) => {
  try {
    bilichat.value = JSON.parse(val) as BiliChat
  } catch (e) {
    ElMessage.error('JSON格式错误')
    formattedBilichat.value = JSON.stringify(bilichat.value, null, 2)
  }
}

const handleDialogConfirm = () => {
  if (!inputUrl.value) {
    ElMessage.error('URL不能为空')
    return
  }

  if (isUrlEndWithSlash.value) {
    inputUrl.value = inputUrl.value.slice(0, -1)
    console.log(inputUrl.value)
  }
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  axios
    .get<BiliChat>(inputUrl.value + '/subs_config', { timeout: 5000 })
    .then((res) => {
      bilichat.value = res.data
      console.log(bilichat.value)
      localStorage.setItem('URL', inputUrl.value)
      URL.value = inputUrl.value
      ElMessage.success('您的URL更新为：' + inputUrl.value)
      isVisible.value = false
      inputUrl.value = ''
      if (!isNotFirst.value) {
        localStorage.setItem('isNotFirst', 'true')
        isNotFirst.value = true
      }
    })
    .catch(() => {
      ElMessage.error('URL错误，请重新输入')
      return
    })
    .finally(() => {
      loading.close()
    })
}
</script>
<style scoped lang="scss"></style>
