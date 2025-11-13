<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChat } from '../composables/useChat'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const props = defineProps<{
  bookingId: number
  currentUserId: number
}>()

const { conversation, loading, error, sendMessage, getConversation, deleteMessage } = useChat()
const newMessage = ref('')
const sendingMessage = ref(false)

onMounted(async () => {
  await getConversation(props.bookingId)
})

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value) return

  sendingMessage.value = true
  const message = await sendMessage({
    bookingId: props.bookingId,
    message: newMessage.value.trim()
  })

  if (message) {
    newMessage.value = ''
  }
  sendingMessage.value = false
}

const handleDeleteMessage = async (messageId: number) => {
  if (confirm('\u00bfEstas seguro de que quieres eliminar este mensaje?')) {
    await deleteMessage(messageId)
  }
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isOwnMessage = (senderId: number) => {
  return senderId === props.currentUserId
}
</script>

<template>
  <div class="chat-window bg-white rounded-lg shadow-md">
    <div class="chat-header p-4 border-b">
      <h3 class="text-lg font-semibold text-gray-800">Chat de la Reserva</h3>
      <p class="text-sm text-gray-500">
        {{ conversation?.unreadCount ? `${conversation.unreadCount} mensaje(s) sin leer` : 'Sin mensajes nuevos' }}
      </p>
    </div>

    <div class="chat-messages p-4 h-96 overflow-y-auto bg-gray-50">
      <LoadingSpinner v-if="loading && !conversation" />

      <div v-else-if="error" class="text-center text-red-500">
        {{ error }}
      </div>

      <div v-else-if="conversation && conversation.messages.length > 0" class="space-y-4">
        <div
          v-for="message in conversation.messages"
          :key="message.id"
          :class="[
            'flex',
            isOwnMessage(message.senderId) ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-xs px-4 py-2 rounded-lg shadow',
              isOwnMessage(message.senderId)
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-800'
            ]"
          >
            <p class="text-sm">{{ message.message }}</p>
            <div class="flex items-center justify-between mt-2 text-xs" :class="isOwnMessage(message.senderId) ? 'text-primary-100' : 'text-gray-500'">
              <span>{{ formatTime(message.sentAt) }}</span>
              <button
                v-if="isOwnMessage(message.senderId)"
                @click="handleDeleteMessage(message.id)"
                class="ml-2 hover:text-red-300"
                title="Eliminar mensaje"
              >
                \u00d7
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 mt-8">
        No hay mensajes todav\u00eda. \u00a1Inicia la conversaci\u00f3n!
      </div>
    </div>

    <div class="chat-input p-4 border-t">
      <form @submit.prevent="handleSendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Escribe un mensaje..."
          :disabled="sendingMessage"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          maxlength="1000"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || sendingMessage"
          class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LoadingSpinner v-if="sendingMessage" size="sm" color="white" />
          <span v-else>Enviar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  max-width: 600px;
  margin: 0 auto;
}
</style>
