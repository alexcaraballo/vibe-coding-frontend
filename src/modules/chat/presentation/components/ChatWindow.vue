<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useChat } from '../composables/useChat'
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'

interface Props {
  bookingId: number
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true,
  refreshInterval: 5000 // 5 seconds
})

const { conversation, loading, error, sending, loadConversation, sendMessage, clearError } = useChat()
const { user } = useAuth()

const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
let refreshIntervalId: number | null = null

onMounted(async () => {
  await loadConversation(props.bookingId)
  scrollToBottom()

  // Auto-refresh conversation
  if (props.autoRefresh) {
    refreshIntervalId = window.setInterval(() => {
      loadConversation(props.bookingId)
    }, props.refreshInterval)
  }
})

// Cleanup interval on unmount
watch(() => props.bookingId, () => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId)
  }
})

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return

  const messageText = newMessage.value.trim()
  newMessage.value = ''

  const sent = await sendMessage(props.bookingId, { message: messageText })
  if (sent) {
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (date: Date) => {
  const messageDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (messageDate.toDateString() === today.toDateString()) {
    return 'Hoy'
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Ayer'
  } else {
    return messageDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }
}

const isMyMessage = (senderId: number) => {
  return user.value?.id === senderId
}
</script>

<template>
  <div class="chat-window">
    <div class="chat-header">
      <h3 class="chat-title">
        <svg class="chat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        Chat con {{ isMyMessage(conversation?.messages[0]?.senderId || 0) ? 'Pasajero' : 'Conductor' }}
      </h3>
      <div v-if="conversation && conversation.unreadCount > 0" class="unread-badge">
        {{ conversation.unreadCount }}
      </div>
    </div>

    <ErrorBanner :message="error" @dismiss="clearError" />

    <div v-if="loading && !conversation" class="chat-loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="conversation" class="chat-body">
      <div ref="messagesContainer" class="messages-container">
        <div v-if="conversation.messages.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="empty-text">No hay mensajes aún</p>
          <p class="empty-hint">Inicia la conversación enviando un mensaje</p>
        </div>

        <div
          v-for="(message, index) in conversation.messages"
          :key="message.id"
          class="message-wrapper"
        >
          <!-- Date separator -->
          <div
            v-if="index === 0 || formatDate(message.sentAt) !== formatDate(conversation.messages[index - 1].sentAt)"
            class="date-separator"
          >
            {{ formatDate(message.sentAt) }}
          </div>

          <div
            class="message"
            :class="{
              'message-sent': isMyMessage(message.senderId),
              'message-received': !isMyMessage(message.senderId)
            }"
          >
            <div class="message-content">
              <p class="message-text">{{ message.message }}</p>
              <span class="message-time">
                {{ formatTime(message.sentAt) }}
                <svg
                  v-if="isMyMessage(message.senderId) && message.isRead"
                  class="read-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <form @submit.prevent="handleSendMessage" class="chat-form">
          <input
            v-model="newMessage"
            type="text"
            class="chat-input"
            placeholder="Escribe un mensaje..."
            :disabled="sending"
            maxlength="1000"
          />
          <button
            type="submit"
            :disabled="!newMessage.trim() || sending"
            class="send-button"
          >
            <LoadingSpinner v-if="sending" size="sm" color="white" />
            <svg v-else class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 500px;
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--tertiary-color);
  color: var(--white-color);
  border-radius: 1rem 1rem 0 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.chat-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.unread-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.chat-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--muted-color);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  color: var(--secondary-text);
  margin-bottom: 0.25rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: var(--muted-color);
}

.date-separator {
  text-align: center;
  font-size: 0.75rem;
  color: var(--muted-color);
  margin: 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  max-width: 75%;
}

.message-sent {
  align-self: flex-end;
}

.message-received {
  align-self: flex-start;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;
}

.message-sent .message-content {
  background-color: var(--tertiary-color);
  color: var(--white-color);
  border-bottom-right-radius: 0.25rem;
}

.message-received .message-content {
  background-color: var(--light-gray);
  color: var(--primary-text);
  border-bottom-left-radius: 0.25rem;
}

.message-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.message-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  opacity: 0.7;
  align-self: flex-end;
}

.read-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.chat-input-container {
  padding: 1rem;
  border-top: 2px solid var(--light-gray);
  background-color: var(--background-color);
}

.chat-form {
  display: flex;
  gap: 0.75rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--light-gray);
  border-radius: 9999px;
  font-size: 0.9375rem;
  color: var(--primary-text);
  background-color: var(--white-color);
  outline: none;
  transition: all 0.2s ease;
}

.chat-input:focus {
  border-color: var(--tertiary-color);
  box-shadow: 0 0 0 3px rgba(0, 53, 181, 0.1);
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 239, 156, 0.3);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Scrollbar styling */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--muted-color);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-text);
}

/* Tablet */
@media (min-width: 768px) {
  .chat-window {
    height: 600px;
  }

  .message {
    max-width: 60%;
  }
}
</style>
