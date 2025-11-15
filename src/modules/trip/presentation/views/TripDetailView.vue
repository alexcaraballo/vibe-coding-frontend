<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrips } from '../composables/useTrips'
import { useBookings } from '@/modules/booking/presentation/composables/useBookings'
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import { useMaps } from '@/modules/maps/presentation/composables/useMaps'
import { useImpact } from '@/modules/impact/presentation/composables/useImpact'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import RouteMap from '@/shared/components/RouteMap.vue'
import CO2Impact from '@/modules/impact/presentation/components/CO2Impact.vue'
import LocationPicker, { type LocationData } from '@/shared/components/LocationPicker.vue'

const route = useRoute()
const router = useRouter()
const { currentTrip, loading: tripLoading, error: tripError, fetchTripById } = useTrips()
const { createBooking, loading: bookingLoading, error: bookingError } = useBookings()
const { isAuthenticated, user, initFromStorage } = useAuth()
const { currentRoute, loading: routeLoading, getTripRoute } = useMaps()
const { tripImpact, loading: impactLoading, getTripCO2Impact } = useImpact()

const seatsRequested = ref(1)
const passengerNotes = ref('')
const pickupLocation = ref<LocationData | null>(null)
const dropoffLocation = ref<LocationData | null>(null)

onMounted(async () => {
  initFromStorage()
  const tripId = Number(route.params.id)
  await fetchTripById(tripId)

  // Cargar la ruta del viaje
  await getTripRoute(tripId)

  // Cargar el impacto de CO₂
  await getTripCO2Impact(tripId)
})

const handleBooking = async () => {
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  if (!currentTrip.value) return

  const booking = await createBooking({
    tripId: currentTrip.value.id,
    seatsRequested: seatsRequested.value,
    passengerNotes: passengerNotes.value || undefined,
    pickupLocation: pickupLocation.value?.address,
    pickupLat: pickupLocation.value?.lat,
    pickupLng: pickupLocation.value?.lng,
    dropoffLocation: dropoffLocation.value?.address,
    dropoffLat: dropoffLocation.value?.lat,
    dropoffLng: dropoffLocation.value?.lng
  })

  if (booking) {
    alert('Reserva realizada con éxito')
    router.push('/my-bookings')
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time: string) => {
  return time.substring(0, 5)
}
</script>

<template>
  <AppLayout>
    <div class="detail-container">
      <LoadingSpinner v-if="tripLoading" full-screen />

      <div v-else-if="currentTrip" class="detail-content">
        <div class="detail-card">
          <div class="trip-header">
            <h1 class="trip-title">
              {{ currentTrip.origin }} → {{ currentTrip.destination }}
            </h1>
            <p class="trip-date">{{ formatDate(currentTrip.departureDate) }}</p>
          </div>

          <div class="trip-info-grid">
            <div class="info-section">
              <h3 class="section-title">Detalles del Viaje</h3>
              <div class="info-list">
                <div class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Salida: {{ formatTime(currentTrip.departureTime) }}</span>
                </div>
                <div v-if="currentTrip.estimatedArrivalTime" class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Llegada estimada: {{ formatTime(currentTrip.estimatedArrivalTime) }}</span>
                </div>
                <div class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>Plazas: {{ currentTrip.availableSeats }} / {{ currentTrip.totalSeats }}</span>
                </div>
                <div v-if="currentTrip.pricePerSeat" class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Precio: {{ currentTrip.pricePerSeat }}€ / plaza</span>
                </div>
              </div>
            </div>

            <div v-if="currentTrip.description" class="info-section">
              <h3 class="section-title">Descripción</h3>
              <p class="description-text">{{ currentTrip.description }}</p>
            </div>
          </div>

          <!-- Mapa de ruta -->
          <div class="route-section">
            <h3 class="section-title">Ruta del Viaje</h3>
            <LoadingSpinner v-if="routeLoading" />
            <RouteMap v-else-if="currentRoute" :route="currentRoute" height="500px" />
            <div v-else class="route-placeholder">
              <svg class="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <p>No se pudo cargar la ruta del viaje</p>
            </div>
          </div>

          <!-- Impacto de CO₂ -->
          <div class="impact-section">
            <LoadingSpinner v-if="impactLoading" />
            <CO2Impact v-else-if="tripImpact" :impact="tripImpact" />
          </div>

          <ErrorBanner :message="tripError || bookingError" />

          <!-- Booking Panel -->
          <div v-if="currentTrip.status === 'active' && currentTrip.availableSeats > 0" class="booking-section">
            <h3 class="booking-title">Reservar Plaza</h3>
            <div class="booking-form">
              <div class="form-field">
                <label for="seats" class="field-label">Número de plazas</label>
                <select
                  id="seats"
                  v-model="seatsRequested"
                  class="field-select"
                >
                  <option v-for="n in currentTrip.availableSeats" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>

              <div class="location-grid">
                <LocationPicker
                  v-model="pickupLocation"
                  label="Punto de recogida (opcional)"
                  placeholder="Ej: Estación de tren, Plaza..."
                  :required="false"
                />

                <LocationPicker
                  v-model="dropoffLocation"
                  label="Punto de bajada (opcional)"
                  placeholder="Ej: Universidad, Centro comercial..."
                  :required="false"
                />
              </div>

              <div class="form-field">
                <label for="notes" class="field-label">Notas (opcional)</label>
                <textarea
                  id="notes"
                  v-model="passengerNotes"
                  rows="3"
                  class="field-textarea"
                  placeholder="Información adicional..."
                ></textarea>
              </div>

              <button
                @click="handleBooking"
                :disabled="bookingLoading || user?.id === currentTrip.driverId"
                class="booking-button"
              >
                <LoadingSpinner v-if="bookingLoading" size="sm" color="white" />
                <template v-else>
                  <svg v-if="user?.id !== currentTrip.driverId" class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span v-if="user?.id === currentTrip.driverId">No puedes reservar tu propio viaje</span>
                  <span v-else>Solicitar Plaza</span>
                </template>
              </button>
            </div>
          </div>
          <div v-else class="unavailable-section">
            <svg class="unavailable-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p>Este viaje ya no está disponible</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Container */
.detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Detail Card */
.detail-card {
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

/* Trip Header */
.trip-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--light-gray);
}

.trip-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.trip-date {
  font-size: 1.125rem;
  color: var(--secondary-text);
}

/* Trip Info Grid */
.trip-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--secondary-text);
  font-size: 0.9375rem;
}

.info-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--tertiary-color);
  flex-shrink: 0;
}

.description-text {
  color: var(--secondary-text);
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* Route Section */
.route-section {
  margin-bottom: 2rem;
}

.route-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background-color: var(--background-color);
  border-radius: 0.75rem;
  text-align: center;
}

.placeholder-icon {
  width: 3rem;
  height: 3rem;
  color: var(--muted-color);
  margin-bottom: 1rem;
}

.route-placeholder p {
  color: var(--muted-color);
  font-size: 0.9375rem;
}

/* Impact Section */
.impact-section {
  margin-bottom: 2rem;
}

/* Booking Section */
.booking-section {
  padding-top: 2rem;
  border-top: 2px solid var(--light-gray);
}

.booking-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 1.5rem;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
}

.field-select,
.field-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--light-gray);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: var(--primary-text);
  background-color: var(--white-color);
  outline: none;
  transition: all 0.2s ease;
}

.field-select:focus,
.field-textarea:focus {
  border-color: var(--tertiary-color);
  box-shadow: 0 0 0 3px rgba(0, 53, 181, 0.1);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.field-textarea::placeholder {
  color: var(--muted-color);
}

.location-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.booking-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 239, 156, 0.3);
  min-height: 48px;
}

.booking-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 239, 156, 0.4);
}

.booking-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Unavailable Section */
.unavailable-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  background-color: var(--background-color);
  border-radius: 0.75rem;
  border-top: 2px solid var(--light-gray);
}

.unavailable-icon {
  width: 3rem;
  height: 3rem;
  color: var(--muted-color);
}

.unavailable-section p {
  color: var(--muted-color);
  font-size: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .detail-card {
    padding: 2rem;
  }

  .trip-title {
    font-size: 2.25rem;
  }

  .trip-date {
    font-size: 1.25rem;
  }

  .trip-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .location-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .detail-card {
    padding: 2.5rem;
  }

  .trip-title {
    font-size: 2.5rem;
  }
}
</style>
