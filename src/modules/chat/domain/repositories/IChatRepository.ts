import type { ChatMessage, ChatConversation, SendMessageData } from '../models/ChatMessage'

export interface IChatRepository {
  sendMessage(data: SendMessageData): Promise<ChatMessage>
  getConversation(bookingId: number, skip?: number, limit?: number): Promise<ChatConversation>
  deleteMessage(messageId: number): Promise<void>
}
