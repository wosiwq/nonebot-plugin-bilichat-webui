<template>
  <ElContainer v-loading="isLoading">
    <ElHeader class="flex items-center">
      <ElButton class="ml-a" @click="isVisible = true" type="primary">更换url</ElButton>
      <ElButton @click="isVisible = true" type="primary">更新cookie</ElButton>
    </ElHeader>
    <ElMain>
      <ElRow :gutter="20" class="">
        <ElCol
          :sm="12"
          class="border-b-1 border-[#dcdfe6] border-0 border-solid sm:border-r-1 sm:border-b-0">
          <span>配置文件</span>
          <ElInput
            class="mt-2"
            @change="handleFormattedBilichatChange"
            v-model="formattedBilichat"
            :rows="20"
            type="textarea"
            placeholder="等待读取数据中"></ElInput>
          <ElButton class="mt-2 mb-2" @click="saveChange">保存修改</ElButton>
        </ElCol>
        <ElCol :sm="12">
          <span>可视化修改</span>
          <ElForm
            label-width="130px"
            :model="bilichat"
            v-if="bilichat"
            @submit.prevent="saveChange">
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
            <span>上传者列表</span>
            <ElCollapse class="w-full mb-2 mt-2">
              <ElForm v-for="(uploader, index) in bilichat.uploaders" :key="index">
                <ElCollapseItem :title="uploader.nickname" class="w-full">
                  <ElFormItem label="UP的昵称">
                    <ElInput v-model="uploader.nickname" placeholder="可能为空"></ElInput>
                  </ElFormItem>
                  <ElFormItem label="UP的B站UID">
                    <ElInputNumber v-model="uploader.uid"></ElInputNumber>
                  </ElFormItem>
                </ElCollapseItem>
              </ElForm>
            </ElCollapse>
            <span>用户列表</span>
            <ElCollapse class="w-full mt-2">
              <ElForm v-for="(user, index) in bilichat.users" :key="index">
                <ElCollapseItem :title="user.user_id.toString()" class="w-full">
                  <ElFormItem label="用户唯一标识符">
                    <ElInput v-model="user.user_id"></ElInput>
                  </ElFormItem>
                  <ElFormItem label="用户平台">
                    <ElInput v-model="user.platform" placeholder="例如 'QQ Group'"></ElInput>
                  </ElFormItem>
                  <ElFormItem label="是否@所有人">
                    <ElSwitch v-model="user.at_all"></ElSwitch>
                  </ElFormItem>
                  <ElFormItem label="订阅配置">
                    <ElCollapse class="w-full">
                      <ElForm v-for="(subscription, index) in user.subscriptions" :key="index">
                        <ElCollapseItem :title="subscription.uid.toString()" class="w-full">
                          <ElFormItem label="UP的B站UID">
                            <ElInputNumber v-model="subscription.uid"></ElInputNumber>
                          </ElFormItem>
                          <ElFormItem label="是否订阅动态">
                            <ElSwitch v-model="subscription.dynamic"></ElSwitch>
                          </ElFormItem>
                          <ElFormItem label="动态是否@所有人">
                            <ElSwitch v-model="subscription.dynamic_at_all"></ElSwitch>
                          </ElFormItem>
                          <ElFormItem label="是否订阅直播">
                            <ElSwitch v-model="subscription.live"></ElSwitch>
                          </ElFormItem>
                          <ElFormItem label="直播是否@所有人">
                            <ElSwitch v-model="subscription.live_at_all"></ElSwitch>
                          </ElFormItem>
                        </ElCollapseItem>
                      </ElForm>
                    </ElCollapse>
                  </ElFormItem>
                </ElCollapseItem>
              </ElForm>
            </ElCollapse>
            <ElButton class="mt-2" @click="saveChange">保存修改</ElButton>
          </ElForm>
          <span v-else>未读取到bilichat配置</span>
        </ElCol>
      </ElRow>
    </ElMain>
  </ElContainer>
  <ElDialog
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
const isLoading = ref(false)

watch(
  () => URL.value,
  (newVal) => {
    if (newVal) {
      isLoading.value = true
      axios
        .get(newVal + '/subs_config')
        .then((res) => {
          bilichat.value = res.data
          console.log(bilichat.value)
        })
        .finally(() => {
          isLoading.value = false
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
    isLoading.value = true
    axios
      .get<BiliChat>(URL.value + '/subs_config')
      .then((res) => {
        bilichat.value = res.data
        console.log(bilichat.value)
      })
      .finally(() => {
        isLoading.value = false
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

const saveChange = () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  axios
    .put<BiliChat>(URL.value + '/subs_config', bilichat.value, { timeout: 5000 })
    .then((res) => {
      console.log(res.data)
      bilichat.value = res.data
      ElMessage.success('保存成功')
    })
    .catch((res) => {
      ElMessage.error('未知错误')
      console.log(res)
      return
    })
    .finally(() => {
      loading.close()
    })
}
</script>
<style scoped lang="scss"></style>
