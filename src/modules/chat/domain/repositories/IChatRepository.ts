import type { ChatMessage, CreateChatMessageData, ChatConversation } from '../models/ChatMessage'

export interface IChatRepository {
  sendMessage(bookingId: number, data: CreateChatMessageData): Promise<ChatMessage>
  getConversation(bookingId: number, skip?: number, limit?: number): Promise<ChatConversation>
  deleteMessage(messageId: number): Promise<void>
}
