import type { IChatRepository } from '../../domain/repositories/IChatRepository'
import { ApiChatService } from '../services/ApiChatService'

class ChatContainer {
  private static instance: ChatContainer
  private chatRepository: IChatRepository

  private constructor() {
    this.chatRepository = new ApiChatService()
  }

  static getInstance(): ChatContainer {
    if (!ChatContainer.instance) {
      ChatContainer.instance = new ChatContainer()
    }
    return ChatContainer.instance
  }

  getChatRepository(): IChatRepository {
    return this.chatRepository
  }
}

export default ChatContainer
