import type {
  ServerMessage,
  SubscribeParams,
  SubscriptionInfo,
  Topic,
  WebSocketConfig,
  WebSocketStatus,
} from './types'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private status: WebSocketStatus = 'disconnected'
  private subscriptions: Map<string, SubscriptionInfo> = new Map()
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set()
  private messageListeners: Set<(message: ServerMessage) => void> = new Set()
  private errorListeners: Set<(error: Error) => void> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private subscriptionsByTopic: Map<Topic, Set<string>> = new Map()

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      pingInterval: 30000,
      ...config,
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.setStatus('connecting')

    try {
      const url = new URL(this.config.url)
      if (this.config.token) {
        url.searchParams.set('token', this.config.token)
      }

      this.ws = new WebSocket(url.toString())

      this.ws.onopen = () => {
        this.setStatus('connected')
        this.startPing()
        this.reconnectTimer && clearTimeout(this.reconnectTimer)
      }

      this.ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        this.setStatus('error')
      }

      this.ws.onclose = () => {
        this.setStatus('disconnected')
        this.stopPing()
        this.clearSubscriptions()

        if (this.status !== 'error') {
          this.scheduleReconnect()
        }
      }
    } catch (err) {
      this.setStatus('error')
      this.notifyError(
        err instanceof Error ? err : new Error('Connection failed'),
      )
    }
  }

  disconnect(): void {
    this.stopPing()
    this.reconnectTimer && clearTimeout(this.reconnectTimer)

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.setStatus('disconnected')
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status
    this.statusListeners.forEach((listener) => {
      void listener(status)
    })
  }

  private handleMessage(message: ServerMessage): void {
    this.messageListeners.forEach((listener) => {
      void listener(message)
    })

    if (message.type === 'subscribed') {
      const subscription: SubscriptionInfo = {
        subscriptionId: message.subscription_id,
        topic: message.topic,
        eventTypes: [],
        initialData: message.data.items ?? [],
      }

      this.subscriptions.set(message.subscription_id, subscription)

      if (!this.subscriptionsByTopic.has(message.topic)) {
        this.subscriptionsByTopic.set(message.topic, new Set())
      }
      this.subscriptionsByTopic.get(message.topic)!.add(message.subscription_id)
    }

    if (message.type === 'unsubscribed') {
      this.subscriptions.delete(message.subscription_id)

      const topicSubscriptions = this.subscriptionsByTopic.get(message.topic)
      if (topicSubscriptions) {
        topicSubscriptions.delete(message.subscription_id)
        if (topicSubscriptions.size === 0) {
          this.subscriptionsByTopic.delete(message.topic)
        }
      }
    }

    if (message.type === 'error') {
      const error = new Error(message.message)
      this.notifyError(error)
    }
  }

  private notifyError(error: Error): void {
    this.errorListeners.forEach((listener) => {
      void listener(error)
    })
  }

  subscribe(topic: Topic, params?: SubscribeParams): Promise<SubscriptionInfo> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'))
        return
      }

      const message = {
        type: 'subscribe' as const,
        topic,
        params,
      }

      this.ws.send(JSON.stringify(message))

      const timeout = setTimeout(() => {
        reject(new Error('Subscription timeout'))
      }, 10000)

      const unsubscribe = this.onMessage((msg) => {
        if (msg.type === 'subscribed' && msg.topic === topic) {
          clearTimeout(timeout)
          unsubscribe()

          const subscription: SubscriptionInfo = {
            subscriptionId: msg.subscription_id,
            topic: msg.topic,
            eventTypes: params?.event_types ?? [
              'created',
              'updated',
              'deleted',
            ],
            initialData: msg.data.items ?? [],
          }
          resolve(subscription)
        } else if (msg.type === 'error') {
          clearTimeout(timeout)
          unsubscribe()
          reject(new Error(msg.message))
        }
      })
    })
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (!subscription || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }

    const message = {
      type: 'unsubscribe' as const,
      topic: subscription.topic,
    }

    this.ws.send(JSON.stringify(message))
  }

  unsubscribeTopic(topic: Topic): void {
    const subscriptionIds = this.subscriptionsByTopic.get(topic)
    if (subscriptionIds) {
      subscriptionIds.forEach((id) => {
        void this.unsubscribe(id)
      })
    }
  }

  private sendPing(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = { type: 'ping' as const }
      this.ws.send(JSON.stringify(message))
    }
  }

  private startPing(): void {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      this.sendPing()
    }, this.config.pingInterval)
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval)
  }

  private clearSubscriptions(): void {
    this.subscriptions.clear()
    this.subscriptionsByTopic.clear()
  }

  onStatus(listener: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  onMessage(listener: (message: ServerMessage) => void): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.add(listener)
    return () => this.errorListeners.delete(listener)
  }

  getStatus(): WebSocketStatus {
    return this.status
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getSubscriptions(): Array<SubscriptionInfo> {
    return Array.from(this.subscriptions.values())
  }

  hasSubscription(topic: Topic): boolean {
    const topicSubscriptions = this.subscriptionsByTopic.get(topic)
    return topicSubscriptions ? topicSubscriptions.size > 0 : false
  }
}

export function createWebSocketClient(
  config: WebSocketConfig,
): WebSocketClient {
  return new WebSocketClient(config)
}
