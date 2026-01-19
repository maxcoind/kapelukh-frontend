import type { SurveyRead } from '../api/surveys.types'
import type { TelegramUserRead } from '../api/telegram-user.types'

export type EventType = 'created' | 'updated' | 'deleted'
export type Topic = 'payment' | 'telegram_user' | 'survey'

export interface SubscribeParams {
  event_types?: Array<EventType>
}

export interface SubscribeMessage {
  type: 'subscribe'
  topic: Topic
  params?: SubscribeParams
}

export interface UnsubscribeMessage {
  type: 'unsubscribe'
  topic: Topic
}

export interface PingMessage {
  type: 'ping'
}

export type ClientMessage = SubscribeMessage | UnsubscribeMessage | PingMessage

export interface SubscribedData {
  items?: Array<PaymentRead>
  total: number
}

export interface SubscribedMessage {
  type: 'subscribed'
  topic: Topic
  subscription_id: string
  timestamp: string
  data: SubscribedData
}

export interface UnsubscribedMessage {
  type: 'unsubscribed'
  topic: Topic
  subscription_id: string
  timestamp: string
}

export interface PaymentRead {
  id: number
  customer_id: number
  amount: number
  date: string
}

export interface PaymentEventMessage {
  type: 'event'
  topic: 'payment'
  event_type: EventType
  subscription_id: string
  data: PaymentRead
  timestamp: string
}

export interface TelegramUserEventMessage {
  type: 'event'
  topic: 'telegram_user'
  event_type: EventType
  subscription_id: string
  data: TelegramUserRead
  timestamp: string
}

export interface SurveyEventMessage {
  type: 'event'
  topic: 'survey'
  event_type: EventType
  subscription_id: string
  data: SurveyRead
  timestamp: string
}

export type EventMessage =
  | PaymentEventMessage
  | TelegramUserEventMessage
  | SurveyEventMessage

export interface PongMessage {
  type: 'pong'
  timestamp: string
}

export interface ErrorMessage {
  type: 'error'
  timestamp: string
  message: string
  code: string
}

export type ServerMessage =
  | SubscribedMessage
  | UnsubscribedMessage
  | EventMessage
  | PongMessage
  | ErrorMessage

export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

export interface WebSocketConfig {
  url: string
  token?: string | null
  reconnectInterval?: number
  pingInterval?: number
}

export interface SubscriptionInfo {
  subscriptionId: string
  topic: Topic
  eventTypes: Array<EventType>
  initialData: Array<any>
}
