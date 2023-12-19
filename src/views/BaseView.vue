<template>
  <ElContainer v-loading="isLoading" class="bg-gray-100 min-h-screen">
    <ElHeader class="flex items-center justify-between bg-blue-700 text-white p-4">
      <span class="font-bold sm:text-lg">BILICHAT WEB UI</span>
      <div>
        <ElButton @click="isVisible = true" color="rgb(59 130 246 / var(--un-bg-opacity))">
          更换url
        </ElButton>
        <ElButton @click="null" color="rgb(59 130 246 / var(--un-bg-opacity))">更新cookie</ElButton>
      </div>
    </ElHeader>
    <ElMain class="h-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start h-full">
        <div class="p-2 bg-white rounded-lg shadow">
          <h2 class="text-lg font-bold mb-2 mt-2">配置文件</h2>
          <ElInput
            class="mt-2"
            @change="handleFormattedBilichatChange"
            v-model="formattedBilichat"
            :rows="20"
            type="textarea"
            placeholder="等待读取数据中"></ElInput>
          <ElButton class="mt-2 mb-2" @click="saveChange">保存修改</ElButton>
        </div>

        <div ref="formDiv" class="p-2 bg-white rounded-lg shadow">
          <!-- 这里改成动态计算scrollbar高度 -->
          <ElScrollbar>
            <h2 class="text-lg font-bold mt-2 mb-2">可视化修改</h2>
            <ElForm
              label-width="8rem"
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
              <h2 class="text-lg font-bold mb-2">用户列表</h2>
              <ElCollapse class="w-full mt-2">
                <ElForm v-for="(user, index) in bilichat.users" :key="index" label-width="7rem">
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
                    <div class="ml-4">
                      <div class="flex justify-between items-center">
                        <span class="font-bold text-[1rem] mb-2">订阅配置</span>
                        <ElPopover
                          title="请输入UP的UID"
                          trigger="click"
                          width="200"
                          placement="top-end">
                          <template #reference>
                            <ElButton
                              class="mr-4"
                              size="small"
                              :icon="Plus"
                              type="success"
                              circle></ElButton>
                          </template>
                          <ElInput type="number" v-model="inputUid"></ElInput>
                          <div class="flex justify-end mt-2">
                            <ElButton
                              size="small"
                              type="primary"
                              @click="handleAddSubs(user.subscriptions)">
                              确认
                            </ElButton>
                          </div>
                        </ElPopover>
                      </div>
                      <ElCollapse class="w-full">
                        <ElForm
                          v-for="(subscription, index) in user.subscriptions"
                          :key="index"
                          label-width="8rem">
                          <ElCollapseItem class="w-full" :name="index">
                            <template #title>
                              <div class="flex w-full items-center justify-between">
                                <span>
                                  {{ getUploaderNickname(subscription.uid) }}
                                </span>
                                <ElButton
                                  size="small"
                                  :icon="Minus"
                                  type="danger"
                                  circle
                                  @click.stop="handleDelSubs(user.subscriptions, index)"></ElButton>
                              </div>
                            </template>
                            <ElFormItem label="UP的B站UID">
                              <span class="font-semibold">{{ subscription.uid }}</span>
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
                    </div>
                  </ElCollapseItem>
                </ElForm>
              </ElCollapse>
              <ElButton class="mt-2" @click="saveChange">保存修改</ElButton>
            </ElForm>
            <span v-else>未读取到bilichat配置</span>
          </ElScrollbar>
        </div>
      </div>
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
import Minus from '@/assets/Minus.vue'
import Plus from '@/assets/Plus.vue'
import type { BiliChat, BiliChatUserSubscriptions, BiliResponse } from '@/types'
import axios from 'axios'

const isNotFirst = ref(Boolean(localStorage.getItem('isNotFirst')))
const isVisible = ref(!isNotFirst.value)
const isPopoverVisible = ref(false)
const isLoading = ref(false)

const formDiv: Ref<HTMLElement | undefined> = ref()
const inputUrl = ref('')
const inputUid = ref<number>()
const getHeight = ref('100%')

const URL = ref(localStorage.getItem('URL'))
const isUrlEndWithSlash = computed(() => inputUrl.value?.endsWith('/'))

const bilichat = ref<BiliChat>()
const formattedBilichat = ref<string>()

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
      .get<BiliResponse<BiliChat>>(URL.value + '/subs_config')
      .then((res) => {
        if (res.data.code !== 0) {
          ElMessage.error('未知错误')
          console.log(res)
          return
        }
        console.log(res.data)

        bilichat.value = res.data.data
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
  inputUrl.value = inputUrl.value.trim()
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
    .get<BiliResponse<BiliChat>>(inputUrl.value + '/subs_config', { timeout: 5000 })
    .then((res) => {
      if (res.data.code !== 0) {
        ElMessage.error('URL错误，请重新输入')
        return
      }
      bilichat.value = res.data.data
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
    .put<BiliResponse<BiliChat>>(URL.value + '/subs_config', bilichat.value, { timeout: 5000 })
    .then((res) => {
      if (res.data.code !== 0) {
        ElMessage.error('未知错误')
        console.log(res)
        return
      }
      console.log(res.data)
      bilichat.value = res.data.data
      ElMessage.success('保存成功')
    })

    .finally(() => {
      loading.close()
    })
}

const getUploaderNickname = (uid: number) => {
  const uploader = bilichat.value?.uploaders.find((uploader) => uploader.uid === uid)
  return uploader?.nickname ? uploader?.nickname : uid.toString()
}

const handleAddSubs = (subscriptions: BiliChatUserSubscriptions[]) => {
  if (!inputUid.value) {
    ElMessage.error('请输入UID')
    return
  }
  const newSubs: BiliChatUserSubscriptions = {
    uid: inputUid.value,
    dynamic: true,
    dynamic_at_all: false,
    live: true,
    live_at_all: false
  }
  subscriptions.push(newSubs)
  isPopoverVisible.value = false
  inputUid.value = undefined
}
const handleDelSubs = (subscriptions: BiliChatUserSubscriptions[], index: number) => {
  if (subscriptions.length <= 1) {
    ElMessage.error('订阅列表不能为空')
    return
  }
  subscriptions.splice(index, 1)
}
</script>
<style scoped lang="scss"></style>
