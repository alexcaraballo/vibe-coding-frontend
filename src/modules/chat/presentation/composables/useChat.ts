import { ref } from 'vue'
import type { Ref } from 'vue'
import ChatContainer from '../../infrastructure/di/container'
import type { ChatMessage, ChatConversation, SendMessageData } from '../../domain/models/ChatMessage'

export function useChat() {
  const chatRepository = ChatContainer.getInstance().getChatRepository()

  const conversation: Ref<ChatConversation | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const sendMessage = async (data: SendMessageData): Promise<ChatMessage | null> => {
    loading.value = true
    error.value = null
    try {
      const message = await chatRepository.sendMessage(data)
      // Agregar el mensaje a la conversación actual
      if (conversation.value && conversation.value.bookingId === data.bookingId) {
        conversation.value.messages.push(message)
        conversation.value.totalMessages++
      }
      return message
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al enviar mensaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const getConversation = async (bookingId: number, skip?: number, limit?: number): Promise<ChatConversation | null> => {
    loading.value = true
    error.value = null
    try {
      const conv = await chatRepository.getConversation(bookingId, skip, limit)
      conversation.value = conv
      return conv
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener conversación'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteMessage = async (messageId: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await chatRepository.deleteMessage(messageId)
      // Eliminar el mensaje de la conversación actual
      if (conversation.value) {
        conversation.value.messages = conversation.value.messages.filter(m => m.id !== messageId)
        conversation.value.totalMessages--
      }
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al eliminar mensaje'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    conversation,
    loading,
    error,
    sendMessage,
    getConversation,
    deleteMessage
  }
}
