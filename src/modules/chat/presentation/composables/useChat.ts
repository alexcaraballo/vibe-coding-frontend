import { ref } from 'vue'
import type { ChatMessage, ChatConversation, CreateChatMessageData } from '../../domain/models/ChatMessage'
import { ApiChatService } from '../../infrastructure/services/ApiChatService'

const chatService = new ApiChatService()

export function useChat() {
  const conversation = ref<ChatConversation | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sending = ref(false)

  const loadConversation = async (bookingId: number, skip = 0, limit = 50) => {
    loading.value = true
    error.value = null

    try {
      conversation.value = await chatService.getConversation(bookingId, skip, limit)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al cargar la conversación'
      console.error('Error loading conversation:', err)
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (bookingId: number, data: CreateChatMessageData): Promise<ChatMessage | null> => {
    sending.value = true
    error.value = null

    try {
      const message = await chatService.sendMessage(bookingId, data)
      
      // Add the new message to the conversation
      if (conversation.value) {
        conversation.value.messages.push(message)
        conversation.value.totalMessages += 1
      }

      return message
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al enviar el mensaje'
      console.error('Error sending message:', err)
      return null
    } finally {
      sending.value = false
    }
  }

  const deleteMessage = async (messageId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await chatService.deleteMessage(messageId)
      
      // Remove the message from the conversation
      if (conversation.value) {
        conversation.value.messages = conversation.value.messages.filter(msg => msg.id !== messageId)
        conversation.value.totalMessages -= 1
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al eliminar el mensaje'
      console.error('Error deleting message:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    conversation,
    loading,
    error,
    sending,
    loadConversation,
    sendMessage,
    deleteMessage,
    clearError
  }
}
