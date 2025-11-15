<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMatching } from '../composables/useMatching'
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import LocationPicker, { type LocationData } from '@/shared/components/LocationPicker.vue'
import type { CreateTravelRequestData } from '../../domain/models/TravelRequest'

const router = useRouter()
const {
  travelRequests,
  matches,
  loading,
  error,
  createTravelRequest,
  getMyTravelRequests,
  findMatches,
  acceptMatch
} = useMatching()
const { isAuthenticated, initFromStorage } = useAuth()

const step = ref<'create' | 'matches' | 'list'>('list')
const currentRequestId = ref<number | null>(null)

// Formulario de nueva solicitud
const originLocation = ref<LocationData | null>(null)
const destinationLocation = ref<LocationData | null>(null)
const travelDate = ref('')
const timeFrom = ref<string | undefined>(undefined)
const timeTo = ref<string | undefined>(undefined)
const seatsRequested = ref(1)
const passengerNotes = ref('')

onMounted(async () => {
  initFromStorage()
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  await getMyTravelRequests()
})

const handleCreateRequest = async () => {
  if (!originLocation.value || !destinationLocation.value) {
    return
  }

  const requestData: CreateTravelRequestData = {
    originAddress: originLocation.value.address,
    destinationAddress: destinationLocation.value.address,
    originLat: originLocation.value.lat,
    originLng: originLocation.value.lng,
    destinationLat: destinationLocation.value.lat,
    destinationLng: destinationLocation.value.lng,
    travelDate: travelDate.value,
    timeFrom: timeFrom.value,
    timeTo: timeTo.value,
    seatsRequested: seatsRequested.value,
    passengerNotes: passengerNotes.value
  }

  const request = await createTravelRequest(requestData)
  if (request) {
    currentRequestId.value = request.id
    await findMatches(request.id)
    step.value = 'matches'
  }
}

const handleFindMatches = async (requestId: number) => {
  currentRequestId.value = requestId
  await findMatches(requestId)
  step.value = 'matches'
}

const handleAcceptMatch = async (tripId: number) => {
  if (!currentRequestId.value) return

  const success = await acceptMatch(currentRequestId.value, tripId)
  if (success) {
    alert('¡Reserva aceptada! Redirigiendo a tus reservas...')
    router.push('/my-bookings')
  }
}

const resetForm = () => {
  originLocation.value = null
  destinationLocation.value = null
  travelDate.value = ''
  timeFrom.value = undefined
  timeTo.value = undefined
  seatsRequested.value = 1
  passengerNotes.value = ''
  step.value = 'list'
  currentRequestId.value = null
}
</script>

<template>
  <AppLayout>
    <div class="matching-container">
      <h1 class="page-title">Sistema de Matching Inteligente</h1>

      <ErrorBanner :message="error" />

      <!-- Step: List -->
      <div v-if="step === 'list'" class="list-view">
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Mis Solicitudes de Viaje</h2>
            <button @click="step = 'create'" class="new-button">
              <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="button-text">Nueva</span>
            </button>
          </div>

          <LoadingSpinner v-if="loading" />

          <div v-else-if="travelRequests.length === 0" class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="empty-text">No tienes solicitudes de viaje</p>
            <p class="empty-hint">Crea una nueva solicitud para encontrar viajes compatibles</p>
          </div>

          <div v-else class="requests-list">
            <div v-for="request in travelRequests" :key="request.id" class="request-card">
              <div class="request-header">
                <div class="request-info">
                  <h3 class="request-route">
                    {{ request.originAddress }} → {{ request.destinationAddress }}
                  </h3>
                  <p class="request-date">
                    {{ new Date(request.travelDate).toLocaleDateString('es-ES') }}
                    <span v-if="request.timeFrom && request.timeTo">
                      ({{ request.timeFrom.substring(0, 5) }} - {{ request.timeTo.substring(0, 5) }})
                    </span>
                  </p>
                  <p class="request-meta">
                    Plazas: {{ request.seatsRequested }} | Estado: {{ request.status }}
                  </p>
                </div>
                <button @click="handleFindMatches(request.id)" class="matches-button">
                  Ver Coincidencias
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Create -->
      <div v-else-if="step === 'create'" class="create-view">
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Nueva Solicitud de Viaje</h2>
            <button @click="resetForm" class="cancel-button">
              Cancelar
            </button>
          </div>

          <form @submit.prevent="handleCreateRequest" class="matching-form">
            <div class="form-section">
              <h3 class="section-title">Ubicaciones</h3>
              <div class="form-grid">
                <LocationPicker
                  v-model="originLocation"
                  label="Origen"
                  placeholder="Ej: Cádiz, España"
                  :required="true"
                />

                <LocationPicker
                  v-model="destinationLocation"
                  label="Destino"
                  placeholder="Ej: Sevilla, España"
                  :required="true"
                />
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Detalles</h3>
              <div class="form-grid form-grid-2">
                <div class="form-field">
                  <label for="date" class="field-label">Fecha del viaje *</label>
                  <input
                    id="date"
                    v-model="travelDate"
                    type="date"
                    required
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label for="seats" class="field-label">Plazas necesarias</label>
                  <input
                    id="seats"
                    v-model.number="seatsRequested"
                    type="number"
                    min="1"
                    max="10"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label for="timeFrom" class="field-label">Hora desde (opcional)</label>
                  <input
                    id="timeFrom"
                    v-model="timeFrom"
                    type="time"
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label for="timeTo" class="field-label">Hora hasta (opcional)</label>
                  <input
                    id="timeTo"
                    v-model="timeTo"
                    type="time"
                    class="field-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-field">
                <label for="notes" class="field-label">Notas adicionales (opcional)</label>
                <textarea
                  id="notes"
                  v-model="passengerNotes"
                  rows="3"
                  class="field-input field-textarea"
                  placeholder="Información adicional..."
                ></textarea>
              </div>
            </div>

            <button type="submit" :disabled="loading" class="submit-button">
              <LoadingSpinner v-if="loading" size="sm" color="white" />
              <template v-else>
                <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span>Buscar Viajes Compatibles</span>
              </template>
            </button>
          </form>
        </div>
      </div>

      <!-- Step: Matches -->
      <div v-else-if="step === 'matches'" class="matches-view">
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Viajes Compatibles</h2>
            <button @click="resetForm" class="back-button">
              Volver
            </button>
          </div>

          <LoadingSpinner v-if="loading" />

          <div v-else-if="matches.length === 0" class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="empty-text">No se encontraron viajes compatibles</p>
            <p class="empty-hint">Intenta ajustar tus criterios de búsqueda</p>
          </div>

          <div v-else class="matches-list">
            <div
              v-for="match in matches.filter(m => m.isCompatible)"
              :key="match.tripId"
              class="match-card"
            >
              <div class="match-header">
                <div class="match-info">
                  <h3 class="match-route">
                    {{ match.tripOrigin }} → {{ match.tripDestination }}
                  </h3>
                  <p class="match-time">Salida: {{ match.departureTime.substring(0, 5) }}</p>
                </div>
                <div v-if="match.matchScore" class="match-score">
                  <p class="score-value">{{ Math.round(match.matchScore.score) }}%</p>
                  <p class="score-label">Compatibilidad</p>
                </div>
              </div>

              <div class="match-details">
                <div class="detail-item">
                  <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>Plazas: {{ match.availableSeats }}</span>
                </div>
                <div class="detail-item">
                  <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Desvío: {{ match.additionalDetourMinutes || 0 }} min</span>
                </div>
                <div class="detail-item">
                  <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  <span>Total: {{ match.projectedTotalDetour || 0 }} / {{ match.maxDetourMinutes }} min</span>
                </div>
              </div>

              <div class="match-actions">
                <button
                  @click="handleAcceptMatch(match.tripId)"
                  :disabled="loading"
                  class="accept-button"
                >
                  Aceptar y Reservar
                </button>
                <button
                  @click="$router.push(`/trips/${match.tripId}`)"
                  class="details-button"
                >
                  Ver Detalles
                </button>
              </div>
            </div>

            <!-- Incompatible matches -->
            <div v-if="matches.filter(m => !m.isCompatible).length > 0" class="incompatible-section">
              <h3 class="incompatible-title">
                Viajes no compatibles ({{ matches.filter(m => !m.isCompatible).length }})
              </h3>
              <details class="incompatible-details">
                <summary class="incompatible-summary">Ver motivos</summary>
                <div class="incompatible-list">
                  <div
                    v-for="match in matches.filter(m => !m.isCompatible)"
                    :key="match.tripId"
                    class="incompatible-card"
                  >
                    <p class="incompatible-route">
                      {{ match.tripOrigin }} → {{ match.tripDestination }}
                    </p>
                    <p class="incompatible-reason">{{ match.reason }}</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Container */
.matching-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Title */
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

/* Content Card */
.content-card {
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-text);
}

/* Buttons */
.new-button,
.matches-button,
.accept-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 44px;
}

.new-button:hover,
.matches-button:hover,
.accept-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.cancel-button,
.back-button {
  padding: 0.625rem 1rem;
  background-color: var(--light-gray);
  color: var(--primary-text);
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.details-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: var(--tertiary-text);
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.button-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.button-text {
  display: none;
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

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  border: 2px solid var(--light-gray);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.request-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.request-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-info {
  flex: 1;
}

.request-route {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.375rem;
  line-height: 1.4;
}

.request-date,
.request-meta {
  font-size: 0.8125rem;
  color: var(--secondary-text);
  margin-bottom: 0.25rem;
}

/* Form */
.matching-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--light-gray);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.form-grid-2 {
  gap: 1rem;
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

.field-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.submit-button {
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

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 239, 156, 0.4);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Matches List */
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-card {
  border: 2px solid var(--light-gray);
  border-radius: 0.75rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.match-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.match-info {
  flex: 1;
}

.match-route {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.375rem;
  line-height: 1.4;
}

.match-time {
  font-size: 0.8125rem;
  color: var(--secondary-text);
}

.match-score {
  text-align: right;
  padding: 0.75rem 1rem;
  background-color: var(--success-color);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.score-label {
  font-size: 0.625rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

/* Match Details */
.match-details {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--light-gray);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--secondary-text);
}

.detail-icon {
  width: 1rem;
  height: 1rem;
  color: var(--tertiary-color);
  flex-shrink: 0;
}

/* Match Actions */
.match-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* Incompatible Section */
.incompatible-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--light-gray);
}

.incompatible-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--muted-color);
  margin-bottom: 0.75rem;
}

.incompatible-details {
  cursor: pointer;
}

.incompatible-summary {
  font-size: 0.875rem;
  color: var(--secondary-text);
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.incompatible-summary:hover {
  background-color: var(--background-color);
}

.incompatible-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.incompatible-card {
  padding: 0.875rem;
  border: 2px solid var(--light-gray);
  border-radius: 0.5rem;
}

.incompatible-route {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.375rem;
}

.incompatible-reason {
  font-size: 0.8125rem;
  color: var(--error-color);
}

/* Tablet */
@media (min-width: 768px) {
  .page-title {
    font-size: 2.25rem;
    margin-bottom: 2rem;
  }

  .content-card {
    padding: 2rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .button-text {
    display: inline;
  }

  .request-header {
    flex-direction: row;
    align-items: center;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .match-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-title {
    font-size: 2.5rem;
  }

  .content-card {
    padding: 2.5rem;
  }
}
</style>
