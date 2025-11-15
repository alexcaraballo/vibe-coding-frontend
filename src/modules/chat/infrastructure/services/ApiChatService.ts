import type { IChatRepository } from '../../domain/repositories/IChatRepository'
import type { ChatMessage, CreateChatMessageData, ChatConversation } from '../../domain/models/ChatMessage'
import apiClient from '@/shared/utils/axios'

export class ApiChatService implements IChatRepository {
  async sendMessage(bookingId: number, data: CreateChatMessageData): Promise<ChatMessage> {
    const response = await apiClient.post<{
      id: number
      booking_id: number
      sender_id: number
      message: string
      sent_at: string
      is_read: boolean
      read_at: string | null
    }>(`/trips/bookings/${bookingId}/chat`, data)

    return {
      id: response.data.id,
      bookingId: response.data.booking_id,
      senderId: response.data.sender_id,
      message: response.data.message,
      sentAt: new Date(response.data.sent_at),
      isRead: response.data.is_read,
      readAt: response.data.read_at ? new Date(response.data.read_at) : null
    }
  }

  async getConversation(bookingId: number, skip = 0, limit = 50): Promise<ChatConversation> {
    const response = await apiClient.get<{
      booking_id: number
      messages: Array<{
        id: number
        booking_id: number
        sender_id: number
        message: string
        sent_at: string
        is_read: boolean
        read_at: string | null
      }>
      total_messages: number
      unread_count: number
    }>(`/trips/bookings/${bookingId}/chat`, {
      params: { skip, limit }
    })

    return {
      bookingId: response.data.booking_id,
      messages: response.data.messages.map((msg: {
        id: number
        booking_id: number
        sender_id: number
        message: string
        sent_at: string
        is_read: boolean
        read_at: string | null
      }) => ({
        id: msg.id,
        bookingId: msg.booking_id,
        senderId: msg.sender_id,
        message: msg.message,
        sentAt: new Date(msg.sent_at),
        isRead: msg.is_read,
        readAt: msg.read_at ? new Date(msg.read_at) : null
      })),
      totalMessages: response.data.total_messages,
      unreadCount: response.data.unread_count
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/trips/chat/${messageId}`)
  }
}
