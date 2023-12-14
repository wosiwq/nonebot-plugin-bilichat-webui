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
          <!-- 为bilichat的每个属性生成form修改 -->
          <span>可视化修改</span>
          <ElForm label-width="130px">
            <ElFormItem label="全局订阅数量限制">
              <ElInputNumber
                v-model="bilichat.config.subs_limit"
                placeholder="全局订阅数量限制，范围 0 到 50，默认为 5"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="动态轮询间隔">
              <ElInputNumber
                v-model="bilichat.config.dynamic_interval"
                placeholder="动态轮询间隔（秒），范围大于 60，默认为 90。"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="直播轮询间隔">
              <ElInputNumber
                v-model="bilichat.config.live_interval"
                placeholder="直播轮询间隔（秒），范围大于 10，默认为 30。"></ElInputNumber>
            </ElFormItem>
            <!-- 此配置文件包含三个主要部分：config，uploaders，和 users。
              config -> object
              这部分包含了应用的基本配置项。字段如下：

              dynamic_grpc (boolean): 是否启用gRPC刷取动态，默认为 false。
              dynamic_interval (integer): 动态轮询间隔（秒），范围大于 60，默认为 90。
              live_interval (integer): 直播轮询间隔（秒），范围大于 10，默认为 30。
              push_delay (integer): 每条推送的延迟（秒），默认为 3。
              subs_limit (integer): 全局订阅数量限制，范围 0 到 50，默认为 5。
              uploaders -> array
              这部分定义了上传者的列表。每个上传者对象包含以下字段：

              nickname (string): UP 的昵称，可能为 ""。
              uid (integer): UP 的 B 站 UID。
              living (integer): 直播状态标识，在 WebUI 中无意义。
              dyn_offset (integer): 动态偏移量，在 WebUI 中无意义。
              users -> array
              这部分定义了用户的列表。每个用户对象包含以下字段：

              user_id (string): 用户唯一标识符。
              platform (string): 用户平台，例如 "QQ Group"，采用 SAA 的命名。
              at_all (boolean): 是否@所有人，默认为 false。
              subscriptions (数组): 订阅配置列表，每个对象包含以下字段：
              uid (integer): UP 的 B 站 UID。
              dynamic (boolean): 是否订阅动态，默认为 true。
              dynamic_at_all (boolean): 动态是否@所有人，默认为 false。
              live (boolean): 是否订阅直播，默认为 true。
              live_at_all (boolean): 直播是否@所有人，默认为 false。 -->
            <ElFormItem label="每条推送的延迟">
              <ElInputNumber
                v-model="bilichat.config.push_delay"
                placeholder="每条推送的延迟（秒），默认为 3。"></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="是否启用gRPC">
              <ElSwitch
                v-model="bilichat.config.dynamic_grpc"
                placeholder="是否启用gRPC刷取动态，默认为 false。"></ElSwitch>
            </ElFormItem>
          </ElForm>
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
    <ElForm>
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
const bilichat = ref<BiliChat>()
const formattedBilichat = ref<string>()

watch(
  () => URL.value,
  (newVal) => {
    if (newVal) {
      axios.get(newVal + '/api/subs_config').then((res) => {
        console.log(res)
      })
    }
  }
)
watch(
  () => bilichat.value,
  (newVal) => {
    if (newVal) {
      console.log(newVal)

      formattedBilichat.value = JSON.stringify(newVal, null, 2)
    }
  },
  { deep: true }
)

onMounted(() => {
  if (URL.value) {
    axios.get<BiliChat>(URL.value + '/api/subs_config').then((res) => {
      bilichat.value = res.data
    })
  }
  console.log(bilichat.value)
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
  if (!isNotFirst.value) {
    localStorage.setItem('isNotFirst', 'true')
    isNotFirst.value = true
  }
  if (!inputUrl.value) {
    ElMessage.error('URL不能为空')
    return
  }
  localStorage.setItem('URL', inputUrl.value)
  URL.value = inputUrl.value
  ElMessage.success('您的URL更新为：' + inputUrl.value)
  isVisible.value = false
  inputUrl.value = ''
}
</script>
<style scoped lang="scss"></style>
