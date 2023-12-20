<template>
  <ElContainer v-loading="isLoading" class="bg-gray-100 min-h-screen">
    <ElHeader class="flex items-center justify-between bg-blue-700 text-white p-4">
      <span class="font-bold sm:text-lg">BILICHAT WEB UI</span>
      <div>
        <ElButton @click="handleManageCookie" color="rgb(59 130 246 / var(--un-bg-opacity))">
          管理cookie
        </ElButton>
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
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-bold mb-2">用户列表</h2>
                <ElButton
                  class="mr-4"
                  size="small"
                  :icon="Plus"
                  type="success"
                  circle
                  @click="handleAddUser"></ElButton>
              </div>
              <ElCollapse accordion class="w-full mt-2">
                <ElForm v-for="(user, index) in bilichat.users" :key="index" label-width="7rem">
                  <ElCollapseItem class="w-full" :name="'user-' + index">
                    <template #title>
                      <div class="flex w-full items-center justify-between">
                        <span>
                          {{ user.user_id }}
                        </span>
                        <ElButton
                          size="small"
                          :icon="Minus"
                          type="danger"
                          circle
                          @click.stop="handleDelUser(bilichat.users, index)"></ElButton>
                      </div>
                    </template>
                    <ElFormItem label="用户唯一标识符">
                      <ElInput v-model="user.user_id"></ElInput>
                    </ElFormItem>
                    <ElFormItem label="用户平台">
                      <ElSelect v-model="user.platform" placeholder="例如 'QQ Group'">
                        <ElOption
                          v-for="(option, index) in platformOption"
                          :key="index"
                          :label="option.label"
                          :value="option.value"></ElOption>
                      </ElSelect>
                    </ElFormItem>
                    <ElFormItem label="是否@所有人">
                      <ElSwitch v-model="user.at_all"></ElSwitch>
                    </ElFormItem>
                    <div class="ml-4 mr-4">
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
  <ElDialog style="min-width: 400px" v-model="isManageCookieDialogVisible">
    <template #header>
      {{ '管理cookie' }}
    </template>
    <ElTable stripe height="400px" :data="authInfo" class="w-full">
      <ElTableColumn label="B站UID" prop="id"></ElTableColumn>
      <ElTableColumn label="token过期时间">
        <template #default="{ row }">{{ coverDataToLocalString(row.token_expired) }}</template>
      </ElTableColumn>
      <ElTableColumn label="Cookie过期时间">
        <template #default="{ row }">{{ coverDataToLocalString(row.cookie_expired) }}</template>
      </ElTableColumn>
      <ElTableColumn fixed="right" label="操作" width="60">
        <template #default="{ row }">
          <ElPopover trigger="click" placement="left" width="200">
            <p class="break-normal">
              确定要删除
              <b>{{ row.id }}</b>
              的cookie吗
            </p>
            <div style="text-align: right; margin: 0">
              <el-button size="small" type="danger" @click="handelDelCookie(row.id)">
                确认
              </el-button>
            </div>
            <template #reference>
              <ElButton link type="danger" size="small">删除</ElButton>
            </template>
          </ElPopover>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElButton @click="handelAddCookie" type="success">新增/刷新cookie</ElButton>
    <ElDialog
      style="min-width: 400px"
      @close="handelQrcodeDialogClose"
      title="扫码登录"
      align-center
      append-to-body
      v-model="isQrcodeDialogVisible">
      <div class="flex justify-center">
        <QrcodeVue :value="qrcodeUrl" :size="300"></QrcodeVue>
      </div>
    </ElDialog>
  </ElDialog>
</template>
<script lang="ts" setup>
import Minus from '@/assets/Minus.vue'
import Plus from '@/assets/Plus.vue'
import type {
  AuthInfo,
  BiliChat,
  BiliChatUserSubscriptions,
  BiliChatUsers,
  BiliResponse,
  PlatformOption,
  Qrcode
} from '@/types'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const isManageCookieDialogVisible = ref(false)
const isQrcodeDialogVisible = ref(false)
const isPopoverVisible = ref(false)
const isLoading = ref(false)

const formDiv: Ref<HTMLElement | undefined> = ref()
const inputUid = ref<number>()
const qrcodeUrl = ref()
const authCode = ref()

const timer = ref()
const bilichat = ref<BiliChat>()
const formattedBilichat = ref<string>()
const authInfo = ref<AuthInfo[]>()

const platformOption = ref<PlatformOption[]>()

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
  isLoading.value = true
  axios
    .get<BiliResponse<BiliChat>>('api/subs_config')
    .then((res) => {
      if (res.data.code !== 0) {
        ElMessage.error('未知错误')
        console.log(res)
        return
      }
      bilichat.value = res.data.data
      return axios.get<BiliResponse<PlatformOption[]>>('api/subs_config/platform')
    })
    .then((res) => {
      if (res!.data.code !== 0) {
        ElMessage.error('未知错误')
        console.log(res)
        return
      }
      platformOption.value = res!.data.data
    })
    .catch((e) => {
      ElMessage.error('未知错误')
      console.log(e)
    })
    .finally(() => {
      isLoading.value = false
    })
})

const handleFormattedBilichatChange = (val: string) => {
  try {
    bilichat.value = JSON.parse(val) as BiliChat
  } catch (e) {
    ElMessage.error('JSON格式错误')
    formattedBilichat.value = JSON.stringify(bilichat.value, null, 2)
  }
}

const saveChange = () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  axios
    .put<BiliResponse<BiliChat>>('api/subs_config', bilichat.value, { timeout: 10000 })
    .then((res) => {
      if (res.data.code !== 0) {
        ElMessage.error('未知错误')
        console.log(res)
        return
      }
      bilichat.value = res.data.data
      ElMessage.success('保存成功')
    })
    .catch((e) => {
      ElMessage.error('保存失败')
      console.log(e)
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
const handleAddUser = () => {
  const newUser: BiliChatUsers = {
    user_id: '',
    platform: 'QQ Group',
    at_all: false,
    subscriptions: []
  }
  bilichat.value?.users.push(newUser)
}
const handleDelSubs = (subscriptions: BiliChatUserSubscriptions[], index: number) => {
  if (subscriptions.length <= 1) {
    ElMessage.error('订阅列表不能为空')
    return
  }
  subscriptions.splice(index, 1)
}
const handleDelUser = (users: BiliChatUsers[], index: number) => {
  users.splice(index, 1)
}
const handleManageCookie = () => {
  axios.get<BiliResponse<AuthInfo[]>>('api/bili_grpc_auth').then((res) => {
    if (res.data.code !== 0) {
      ElMessage.error('未知错误')
      console.log(res)
      return
    }
    authInfo.value = res.data.data
    isManageCookieDialogVisible.value = true
  })
}
const handelDelCookie = (uid: number) => {
  console.log(uid)
  axios.delete<BiliResponse<AuthInfo[]>>('api/bili_grpc_auth', { params: { uid } }).then((res) => {
    if (res.data.code !== 0) {
      ElMessage.error('未知错误')
      console.log(res)
      return
    }
    ElMessage.success('删除成功')
    handleManageCookie()
  })
}
const handelAddCookie = () => {
  axios.get<BiliResponse<Qrcode>>('api/bili_grpc_login/qrcode').then((res) => {
    console.log(res.data.data)
    qrcodeUrl.value = res.data.data.qrcode_url
    authCode.value = res.data.data.auth_code
    isQrcodeDialogVisible.value = true
    if (res.data.code !== 0) {
      ElMessage.error('未知错误')
      console.log(res)
      return
    }
    // 添加一个定时器 调用一个接口 用来查询是否登录成功
    timer.value = setInterval(() => {
      axios
        .post<BiliResponse<AuthInfo>>(
          'api/bili_grpc_login/qrcode',
          {},
          { params: { auth_code: authCode.value } }
        )
        .then((res) => {
          if (res.data.code === 86038) {
            clearInterval(timer.value)
            timer.value = undefined
            ElMessage.warning('二维码已失效，请重新扫码')
            handelAddCookie()
            return
          }
          if (res.data.code !== 86039 && res.data.code !== 0) {
            ElMessage.error('未知错误')
            console.log(res)
            return
          }
          if (res.data.code === 0) {
            clearInterval(timer.value)
            timer.value = undefined
            isQrcodeDialogVisible.value = false
            ElMessage.success('登录成功')
            handleManageCookie()
          }
        })
    }, 1000)
  })
}
const handelQrcodeDialogClose = () => {
  clearInterval(timer.value)
  timer.value = undefined
}
const coverDataToLocalString = (ts: number) => {
  let date = new Date(ts * 1000)
  return date.toLocaleString(undefined, {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>
<style scoped lang="scss"></style>
