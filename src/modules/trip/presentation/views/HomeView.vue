<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrips } from '../composables/useTrips'
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const router = useRouter()
const { trips, loading, error, searchTrips } = useTrips()
const { initFromStorage } = useAuth()

const origin = ref('')
const destination = ref('')
const dateFrom = ref('')

onMounted(() => {
  initFromStorage()
  // Cargar viajes activos por defecto
  searchTrips({})
})

const handleSearch = () => {
  searchTrips({
    origin: origin.value || undefined,
    destination: destination.value || undefined,
    dateFrom: dateFrom.value || undefined
  })
}

const viewTripDetail = (tripId: number) => {
  router.push(`/trips/${tripId}`)
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
  return time.substring(0, 5) // HH:MM
}
</script>

<template>
  <AppLayout>
    <div class="home-container">
      <h1 class="page-title">Búsqueda de Viajes</h1>

      <!-- Search Panel -->
      <div class="search-panel">
        <form @submit.prevent="handleSearch" class="search-form">
          <div class="form-field">
            <label for="origin" class="field-label">Origen</label>
            <input
              id="origin"
              v-model="origin"
              type="text"
              class="field-input"
              placeholder="Ciudad origen"
            />
          </div>

          <div class="form-field">
            <label for="destination" class="field-label">Destino</label>
            <input
              id="destination"
              v-model="destination"
              type="text"
              class="field-input"
              placeholder="Ciudad destino"
            />
          </div>

          <div class="form-field">
            <label for="date" class="field-label">Fecha</label>
            <input
              id="date"
              v-model="dateFrom"
              type="date"
              class="field-input"
            />
          </div>

          <div class="form-field form-submit">
            <button
              type="submit"
              :disabled="loading"
              class="search-button"
            >
              <svg v-if="!loading" class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <span>Buscar</span>
            </button>
          </div>
        </form>
      </div>

      <ErrorBanner :message="error" @dismiss="error = null" />

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" />

      <!-- Empty State -->
      <div v-else-if="!loading && trips.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="empty-text">No hay viajes disponibles</p>
        <p class="empty-hint">Intenta ajustar tus criterios de búsqueda</p>
      </div>

      <!-- Trips Grid -->
      <div v-else class="trips-grid">
        <div
          v-for="trip in trips"
          :key="trip.id"
          class="trip-card"
          @click="viewTripDetail(trip.id)"
        >
          <div class="card-header">
            <div class="route-info">
              <h3 class="route-title">
                {{ trip.origin }} → {{ trip.destination }}
              </h3>
              <p class="route-date">{{ formatDate(trip.departureDate) }}</p>
            </div>
            <span
              class="status-badge"
              :class="{
                'status-active': trip.status === 'active',
                'status-inactive': trip.status !== 'active'
              }"
            >
              {{ trip.status === 'active' ? 'Activo' : trip.status }}
            </span>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="detail-text">Salida: {{ formatTime(trip.departureTime) }}</span>
            </div>
            <div v-if="trip.estimatedArrivalTime" class="detail-row">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="detail-text">Llegada: {{ formatTime(trip.estimatedArrivalTime) }}</span>
            </div>
            <div class="detail-row">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="detail-text">Plazas disponibles: {{ trip.availableSeats }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="price-container">
              <span v-if="trip.pricePerSeat" class="price-amount">
                {{ trip.pricePerSeat }}€
              </span>
              <span v-else class="price-text">Precio a consultar</span>
            </div>
            <button
              @click.stop="viewTripDetail(trip.id)"
              class="view-button"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Container */
.home-container {
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

/* Search Panel */
.search-panel {
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-submit {
  margin-top: 0.5rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
}

.field-input {
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

.field-input::placeholder {
  color: var(--muted-color);
}

.field-input:focus {
  border-color: var(--tertiary-color);
  box-shadow: 0 0 0 3px rgba(0, 53, 181, 0.1);
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
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

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 239, 156, 0.4);
}

.search-button:active {
  transform: translateY(0);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
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

/* Trips Grid */
.trips-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Trip Card */
.trip-card {
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.trip-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.route-info {
  flex: 1;
}

.route-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.route-date {
  font-size: 0.8125rem;
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

.status-active {
  background-color: var(--success-color);
  color: var(--primary-color);
}

.status-inactive {
  background-color: var(--light-gray);
  color: var(--secondary-text);
}

/* Card Details */
.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--light-gray);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--tertiary-color);
  flex-shrink: 0;
}

.detail-text {
  font-size: 0.875rem;
  color: var(--secondary-text);
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.price-container {
  flex: 1;
}

.price-amount {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--tertiary-color);
}

.price-text {
  font-size: 0.875rem;
  color: var(--muted-color);
}

.view-button {
  padding: 0.625rem 1.25rem;
  background-color: var(--primary-color);
  color: var(--tertiary-text);
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 44px;
}

.view-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Tablet */
@media (min-width: 768px) {
  .page-title {
    font-size: 2.25rem;
    margin-bottom: 2rem;
  }

  .search-panel {
    padding: 2rem;
  }

  .search-form {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-submit {
    margin-top: 0;
  }

  .trips-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .route-title {
    font-size: 1.25rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-title {
    font-size: 2.5rem;
  }

  .search-form {
    grid-template-columns: repeat(4, 1fr);
  }

  .trips-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
