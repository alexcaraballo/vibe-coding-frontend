export interface ChatMessage {
  id: number
  bookingId: number
  senderId: number
  message: string
  sentAt: Date
  isRead: boolean
  readAt: Date | null
}

export interface ChatConversation {
  bookingId: number
  messages: ChatMessage[]
  totalMessages: number
  unreadCount: number
}

export interface SendMessageData {
  bookingId: number
  message: string
}
