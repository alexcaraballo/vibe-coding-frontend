import type { ChatMessage, ChatConversation } from '../../domain/models/ChatMessage'
import type { ChatMessageDTO, ChatConversationResponseDTO } from '../../presentation/types/ChatDTO'

export class ChatMapper {
  static messageToDomain(dto: ChatMessageDTO): ChatMessage {
    return {
      id: dto.id,
      bookingId: dto.booking_id,
      senderId: dto.sender_id,
      message: dto.message,
      sentAt: new Date(dto.sent_at),
      isRead: dto.is_read,
      readAt: dto.read_at ? new Date(dto.read_at) : null
    }
  }

  static conversationToDomain(dto: ChatConversationResponseDTO): ChatConversation {
    return {
      bookingId: dto.booking_id,
      messages: dto.messages.map(this.messageToDomain),
      totalMessages: dto.total_messages,
      unreadCount: dto.unread_count
    }
  }
}
