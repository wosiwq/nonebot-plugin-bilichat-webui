export interface BiliChat {
  config: BiliChatConfig
  uploaders: BiliChatUploaders[]
  users: BiliChatUsers[]
}
export interface BiliChatConfig {
  dynamic_grpc: boolean
  dynamic_interval: number
  live_interval: number
  push_delay: number
  subs_limit: number
}
export interface BiliChatUploaders {
  dyn_offset: number
  living: number
  nickname: string
  uid: number
}
export interface BiliChatUsers {
  at_all: boolean
  platform: string
  subscriptions: BiliChatUserSubscriptions[]
  user_id: string
}
export interface BiliChatUserSubscriptions {
  dynamic: boolean
  dynamic_at_all: boolean
  live: boolean
  live_at_all: boolean
  uid: number
}

export interface BiliResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface AuthInfo {
  id: number
  token_expired: number
  cookie_expired: number
}

export interface Qrcode {
  qrcode_url: string
  auth_code: string
}
