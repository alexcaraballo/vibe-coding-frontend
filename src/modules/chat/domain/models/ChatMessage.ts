export interface ChatMessage {
  id: number
  bookingId: number
  senderId: number
  message: string
  sentAt: Date
  isRead: boolean
  readAt: Date | null
}

export interface CreateChatMessageData {
  message: string
}

export interface ChatConversation {
  bookingId: number
  messages: ChatMessage[]
  totalMessages: number
  unreadCount: number
}
