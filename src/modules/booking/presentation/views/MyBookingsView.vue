<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBookings } from '../composables/useBookings'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import ChatWindow from '@/modules/chat/presentation/components/ChatWindow.vue'

const { bookings, loading, error, fetchMyBookings, cancelBooking } = useBookings()
const selectedBookingId = ref<number | null>(null)

onMounted(() => {
  fetchMyBookings()
})

const handleCancel = async (id: number) => {
  if (confirm('¿Estás seguro de cancelar esta reserva?')) {
    await cancelBooking(id)
  }
}

const toggleChat = (bookingId: number) => {
  if (selectedBookingId.value === bookingId) {
    selectedBookingId.value = null
  } else {
    selectedBookingId.value = bookingId
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (time: string) => {
  return time.substring(0, 5)
}
</script>

<template>
  <AppLayout>
    <div class="bookings-container">
      <h1 class="page-title">Mis Reservas</h1>

      <ErrorBanner :message="error" />

      <LoadingSpinner v-if="loading" />

      <div v-else-if="bookings.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="empty-text">No tienes reservas</p>
        <p class="empty-hint">Busca viajes disponibles y haz tu primera reserva</p>
      </div>

      <div v-else class="bookings-list">
        <div
          v-for="item in bookings"
          :key="item.booking.id"
          class="booking-card"
        >
          <div class="booking-header">
            <div class="booking-info">
              <h3 class="booking-route">
                {{ item.trip.origin }} → {{ item.trip.destination }}
              </h3>
              <p class="booking-date">{{ formatDate(item.trip.departureDate) }}</p>
            </div>
            <span
              class="status-badge"
              :class="{
                'status-confirmed': item.booking.status === 'confirmed',
                'status-cancelled': item.booking.status === 'cancelled',
                'status-completed': item.booking.status === 'completed'
              }"
            >
              {{ item.booking.status }}
            </span>
          </div>

          <div class="booking-details">
            <div class="detail-item">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Salida: {{ formatTime(item.trip.departureTime) }}</span>
            </div>
            <div class="detail-item">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span>Plazas: {{ item.booking.seatsBooked }}</span>
            </div>
            <div v-if="item.driver" class="detail-item">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Conductor: {{ item.driver.name }}</span>
            </div>
          </div>

          <div class="booking-actions">
            <button
              v-if="item.booking.status === 'confirmed'"
              @click="toggleChat(item.booking.id)"
              class="chat-button"
            >
              <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <span>{{ selectedBookingId === item.booking.id ? 'Cerrar Chat' : 'Abrir Chat' }}</span>
            </button>
            <button
              v-if="item.booking.status === 'confirmed'"
              @click="handleCancel(item.booking.id)"
              class="cancel-button"
            >
              <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>Cancelar</span>
            </button>
          </div>

          <!-- Chat Window -->
          <div v-if="selectedBookingId === item.booking.id" class="chat-container">
            <ChatWindow :booking-id="item.booking.id" />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Container */
.bookings-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Title */
.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.02em;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: var(--muted-color);
  margin: 0 auto 1rem;
}

.empty-text {
  font-size: 1.125rem;
  color: var(--secondary-text);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: var(--muted-color);
}

/* Bookings List */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Booking Card */
.booking-card {
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.booking-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--light-gray);
}

.booking-info {
  flex: 1;
}

.booking-route {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.375rem;
  line-height: 1.4;
}

.booking-date {
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-confirmed {
  background-color: var(--success-color);
  color: var(--primary-color);
}

.status-cancelled {
  background-color: var(--error-color);
  color: var(--white-color);
}

.status-completed {
  background-color: var(--light-gray);
  color: var(--secondary-text);
}

/* Booking Details */
.booking-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.detail-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--tertiary-color);
  flex-shrink: 0;
}

/* Booking Actions */
.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chat-button,
.cancel-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.chat-button {
  background-color: var(--tertiary-color);
  color: var(--white-color);
}

.chat-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.cancel-button {
  background-color: var(--error-color);
  color: var(--white-color);
}

.cancel-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button-icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* Chat Container */
.chat-container {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--light-gray);
}

/* Tablet */
@media (min-width: 768px) {
  .page-title {
    font-size: 2.25rem;
    margin-bottom: 2rem;
  }

  .booking-card {
    padding: 2rem;
  }

  .booking-route {
    font-size: 1.5rem;
  }

  .booking-actions {
    flex-direction: row;
  }

  .booking-details {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-title {
    font-size: 2.5rem;
  }
}
</style>
