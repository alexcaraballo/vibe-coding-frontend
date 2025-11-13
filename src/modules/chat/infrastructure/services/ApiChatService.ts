import axios from '@/shared/utils/axios'
import type { IChatRepository } from '../../domain/repositories/IChatRepository'
import type { ChatMessage, ChatConversation, SendMessageData } from '../../domain/models/ChatMessage'
import type { ChatMessageDTO, ChatConversationResponseDTO, SendMessageRequestDTO } from '../../presentation/types/ChatDTO'
import { ChatMapper } from '../mappers/ChatMapper'

export class ApiChatService implements IChatRepository {
  private readonly basePath = '/trips/bookings'
  private readonly chatPath = '/trips/chat'

  async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    const dto: SendMessageRequestDTO = {
      message: data.message
    }
    const response = await axios.post<ChatMessageDTO>(`${this.basePath}/${data.bookingId}/chat`, dto)
    return ChatMapper.messageToDomain(response.data)
  }

  async getConversation(bookingId: number, skip: number = 0, limit: number = 100): Promise<ChatConversation> {
    const response = await axios.get<ChatConversationResponseDTO>(`${this.basePath}/${bookingId}/chat`, {
      params: { skip, limit }
    })
    return ChatMapper.conversationToDomain(response.data)
  }

  async deleteMessage(messageId: number): Promise<void> {
    await axios.delete(`${this.chatPath}/${messageId}`)
  }
}
