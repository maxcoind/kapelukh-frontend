import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createWebSocketClient } from '../lib/websocket'
import { useAuth } from './AuthContext'
import type { SurveyRead } from '../lib/api/surveys.types'
import type { TelegramUserRead } from '../lib/api/telegram-user.types'
import type {
  EventType,
  ServerMessage,
  SubscribeParams,
  SubscriptionInfo,
  Topic,
  WebSocketClient,
  WebSocketStatus,
} from '../lib/websocket'

interface WebSocketContextType {
  status: WebSocketStatus
  isConnected: boolean
  subscribe: (
    topic: Topic,
    params?: SubscribeParams,
  ) => Promise<SubscriptionInfo>
  unsubscribe: (subscriptionId: string) => void
  unsubscribeTopic: (topic: Topic) => void
  onTelegramUserEvent: (
    callback: (event: {
      type: EventType
      data: TelegramUserRead
      timestamp: string
    }) => void,
  ) => () => void
  onSurveyEvent: (
    callback: (event: {
      type: EventType
      data: SurveyRead
      timestamp: string
    }) => void,
  ) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [client, setClient] = useState<WebSocketClient | null>(null)
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setToken(null)
      console.log('[WebSocket] Not authenticated, clearing token')
      return
    }

    const storedToken = localStorage.getItem('access_token')
    setToken(storedToken)
    console.log('[WebSocket] Token loaded from localStorage:', !!storedToken)
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log(
        '[WebSocket] Not connecting - isAuthenticated:',
        isAuthenticated,
        'hasToken:',
        !!token,
      )
      setStatus('disconnected')
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
    console.log('[WebSocket] Connecting to:', wsUrl)

    const wsClient = createWebSocketClient({
      url: wsUrl,
      token,
      reconnectInterval: 5000,
      pingInterval: 30000,
    })

    setClient(wsClient)

    const unsubscribeStatus = wsClient.onStatus((newStatus) => {
      console.log('[WebSocket] Status changed:', newStatus)
      setStatus(newStatus)
    })

    wsClient.connect()

    return () => {
      console.log('[WebSocket] Cleaning up connection')
      wsClient.disconnect()
      unsubscribeStatus()
    }
  }, [isAuthenticated, token])

  const subscribe = useCallback(
    async (topic: Topic, params?: SubscribeParams) => {
      if (!client) {
        throw new Error('WebSocket client not available')
      }
      return client.subscribe(topic, params)
    },
    [client],
  )

  const unsubscribe = useCallback(
    (subscriptionId: string) => {
      client?.unsubscribe(subscriptionId)
    },
    [client],
  )

  const unsubscribeTopic = useCallback(
    (topic: Topic) => {
      client?.unsubscribeTopic(topic)
    },
    [client],
  )

  const onTelegramUserEvent = useCallback(
    (
      callback: (event: {
        type: EventType
        data: TelegramUserRead
        timestamp: string
      }) => void,
    ) => {
      if (!client) {
        return () => {}
      }

      const handleMessage = (message: ServerMessage) => {
        if (message.type === 'event' && message.topic === 'telegram_user') {
          callback({
            type: message.event_type,
            data: message.data,
            timestamp: message.timestamp,
          })
        }
      }

      return client.onMessage(handleMessage)
    },
    [client],
  )

  const onSurveyEvent = useCallback(
    (
      callback: (event: {
        type: EventType
        data: SurveyRead
        timestamp: string
      }) => void,
    ) => {
      if (!client) {
        return () => {}
      }

      const handleMessage = (message: ServerMessage) => {
        if (message.type === 'event' && message.topic === 'survey') {
          callback({
            type: message.event_type,
            data: message.data,
            timestamp: message.timestamp,
          })
        }
      }

      return client.onMessage(handleMessage)
    },
    [client],
  )

  const value = useMemo(
    () => ({
      status,
      isConnected: status === 'connected',
      subscribe,
      unsubscribe,
      unsubscribeTopic,
      onTelegramUserEvent,
      onSurveyEvent,
    }),
    [
      status,
      subscribe,
      unsubscribe,
      unsubscribeTopic,
      onTelegramUserEvent,
      onSurveyEvent,
    ],
  )

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
