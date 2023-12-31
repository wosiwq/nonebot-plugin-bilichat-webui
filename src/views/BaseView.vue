<template>
  <ElContainer v-loading="isLoading" class="bg-gray-100 dark:bg-[#0d1117] min-h-screen">
    <ElHeader
      class="flex items-center justify-between bg-blue-700 dark:bg-[#010409] text-white p-4">
      <div>
        <span class="font-bold text-lg">BILICHAT</span>
        <span class="font-bold hidden sm:inline text-lg">&nbsp;WEB UI v{{ version }}</span>
      </div>

      <div>
        <ElButton @click="handleManageCookie" :color="getButtonColor()" :dark="isDark">
          管理cookie
        </ElButton>
        <ElSwitch
          class="ml-2"
          v-model="isDark"
          style="--el-switch-on-color: #2c2c2c"
          width="55"
          :active-action-icon="Dark"
          :inactive-action-icon="Light"></ElSwitch>
      </div>
    </ElHeader>
    <ElMain class="h-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start h-full">
        <ElCard style="border-radius: 0.5rem">
          <h2 class="text-lg font-bold mb-2 mt-0">配置文件</h2>
          <Codemirror
            v-if="formattedBilichat"
            @change="handleFormattedBilichatChange"
            v-model="formattedBilichat"
            placeholder="等待配置文件载入"
            :extensions="getExtensions()"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :phrases="chinesePhrases"
            style="max-height: 600px"></Codemirror>
          <div v-if="error" class="error">{{ error }}</div>
          <ElButton class="mt-2 mb-2" @click="saveChange">保存修改</ElButton>
        </ElCard>

        <ElCard ref="formDiv" style="border-radius: 0.5rem">
          <ElScrollbar>
            <h2 class="text-lg font-bold mt-0 mb-2">可视化修改</h2>
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
        </ElCard>
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
        <QrcodeVue :value="qrcodeUrl" :size="300" :margin="2"></QrcodeVue>
      </div>
    </ElDialog>
  </ElDialog>
</template>
<script lang="ts" setup>
import Minus from '@/assets/Minus.vue'
import Plus from '@/assets/Plus.vue'
import Dark from '@/assets/dark.vue'
import Light from '@/assets/light.vue'
import type {
  AuthInfo,
  BiliChat,
  BiliChatUserSubscriptions,
  BiliChatUsers,
  BiliResponse,
  PlatformOption,
  Qrcode
} from '@/types'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { useDark, useDebounceFn } from '@vueuse/core'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import { Codemirror } from 'vue-codemirror'
import { version } from '../../package.json'

const isManageCookieDialogVisible = ref(false)
const isQrcodeDialogVisible = ref(false)
const isPopoverVisible = ref(false)
const isLoading = ref(false)
const isDark = useDark({ disableTransition: false })

const formDiv: Ref<HTMLElement | undefined> = ref()
const inputUid = ref<number>()
const qrcodeUrl = ref()
const authCode = ref()
const error = ref()

const timer = ref()
const bilichat = ref<BiliChat>()
const formattedBilichat = ref<string>()
const authInfo = ref<AuthInfo[]>()

const platformOption = ref<PlatformOption[]>()

const chinesePhrases = {
  // @codemirror/view
  'Control character': '控制字符',
  // @codemirror/commands
  'Selection deleted': '选定删除',
  // @codemirror/language
  'Folded lines': '折叠块',
  'Unfolded lines': '展开快',
  to: '至',
  'folded code': '折叠代码',
  unfold: '展开',
  'Fold line': '折叠',
  'Unfold line': '展开',
  // @codemirror/search
  'Go to line': '转到行',
  go: '去',
  Find: '查找',
  Replace: '替换为',
  next: '下一个',
  previous: '前一个',
  all: '全部',
  'match case': '区分大小写',
  'by word': '全词匹配',
  replace: '替换',
  'replace all': '全部替换',
  close: '关闭',
  'current match': '当前匹配',
  'replaced $ matches': '替换了 $ 个匹配',
  'replaced match on line $': '在第 $ 行替换匹配',
  'on line': '在行',
  // @codemirror/autocomplete
  Completions: '补全',
  // @codemirror/lint
  Diagnostics: '诊断',
  'No diagnostics': '无诊断'
}

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

const handleFormattedBilichatChange = useDebounceFn((val: string) => {
  try {
    bilichat.value = JSON.parse(val) as BiliChat
    error.value = undefined
    formattedBilichat.value = JSON.stringify(bilichat.value, null, 2)
  } catch (e) {
    ElMessage.error('JSON格式错误')
    error.value = 'JSON格式错误：' + e
    // formattedBilichat.value = JSON.stringify(bilichat.value, null, 2)
  }
}, 1000)

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

const getExtensions = () => {
  if (isDark.value) {
    return [json(), oneDark]
  }
  return [json()]
}
const getButtonColor = () => {
  if (isDark.value) {
    return 'rgb(25 50 100 / var(--un-bg-opacity))'
  }
  return 'rgb(59 130 246 / var(--un-bg-opacity))'
}
</script>
<style scoped lang="css">
.error {
  /* 文本样式 */
  color: #721c24; /* 深红色，表示错误 */
  background-color: #f8d7da; /* 浅红色背景 */
  border-color: #f5c6cb; /* 边框颜色 */
  font-size: 1em; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  padding: 10px 15px; /* 内部填充 */
  margin: 10px 0; /* 外部间距 */
  border-radius: 5px; /* 边框圆角 */
  border: 1px solid transparent; /* 边框样式 */

  /* 布局与盒子模型 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 轻微的阴影效果 */
  text-align: center; /* 文本居中对齐 */

  /* 动画效果 */
  transition: all 0.3s ease-in-out; /* 平滑过渡效果 */
}

/* 当鼠标悬停在错误提示上时的样式 */
.error:hover {
  background-color: #f5c6cb; /* 鼠标悬停时的背景颜色变化 */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); /* 增加阴影 */
  cursor: pointer; /* 鼠标样式变为手形 */
}
</style>
