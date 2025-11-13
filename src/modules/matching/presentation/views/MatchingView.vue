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
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center" style="color: var(--primary-text)">
        Sistema de Matching Inteligente
      </h1>

      <ErrorBanner :message="error" />

      <!-- Step: List -->
      <div v-if="step === 'list'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold" style="color: var(--primary-text)">
              Mis Solicitudes de Viaje
            </h2>
            <button
              @click="step = 'create'"
              class="px-6 py-3 rounded-lg font-medium transition-colors"
              style="background-color: var(--secondary-color); color: var(--primary-color)"
            >
              Nueva Solicitud
            </button>
          </div>

          <LoadingSpinner v-if="loading" />

          <div v-else-if="travelRequests.length === 0" class="text-center py-12">
            <p style="color: var(--secondary-text)" class="text-lg">
              No tienes solicitudes de viaje
            </p>
            <p style="color: var(--muted-color)" class="mt-2">
              Crea una nueva solicitud para encontrar viajes compatibles
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="request in travelRequests"
              :key="request.id"
              class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-semibold" style="color: var(--primary-text)">
                    {{ request.originAddress }} → {{ request.destinationAddress }}
                  </h3>
                  <p style="color: var(--secondary-text)">
                    {{ new Date(request.travelDate).toLocaleDateString('es-ES') }}
                    <span v-if="request.timeFrom && request.timeTo">
                      ({{ request.timeFrom.substring(0, 5) }} - {{ request.timeTo.substring(0, 5) }})
                    </span>
                  </p>
                  <p style="color: var(--muted-color)" class="mt-2">
                    Plazas: {{ request.seatsRequested }} | Estado: {{ request.status }}
                  </p>
                </div>
                <button
                  @click="handleFindMatches(request.id)"
                  class="px-4 py-2 rounded-lg font-medium"
                  style="background-color: var(--primary-color); color: var(--tertiary-text)"
                >
                  Ver Coincidencias
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Create -->
      <div v-else-if="step === 'create'" class="bg-white rounded-lg shadow-md p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold" style="color: var(--primary-text)">
            Nueva Solicitud de Viaje
          </h2>
          <button
            @click="resetForm"
            class="px-4 py-2 rounded-lg"
            style="background-color: var(--light-gray); color: var(--primary-text)"
          >
            Cancelar
          </button>
        </div>

        <form @submit.prevent="handleCreateRequest" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--primary-text)">
                Fecha del viaje *
              </label>
              <input
                v-model="travelDate"
                type="date"
                required
                class="w-full px-4 py-2 border rounded-lg"
                style="border-color: var(--light-gray)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--primary-text)">
                Plazas necesarias
              </label>
              <input
                v-model.number="seatsRequested"
                type="number"
                min="1"
                max="10"
                class="w-full px-4 py-2 border rounded-lg"
                style="border-color: var(--light-gray)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--primary-text)">
                Hora desde (opcional)
              </label>
              <input
                v-model="timeFrom"
                type="time"
                class="w-full px-4 py-2 border rounded-lg"
                style="border-color: var(--light-gray)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--primary-text)">
                Hora hasta (opcional)
              </label>
              <input
                v-model="timeTo"
                type="time"
                class="w-full px-4 py-2 border rounded-lg"
                style="border-color: var(--light-gray)"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--primary-text)">
              Notas adicionales (opcional)
            </label>
            <textarea
              v-model="passengerNotes"
              rows="3"
              class="w-full px-4 py-2 border rounded-lg"
              style="border-color: var(--light-gray)"
              placeholder="Información adicional..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            style="background-color: var(--secondary-color); color: var(--primary-color)"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" />
            <span v-else>Buscar Viajes Compatibles</span>
          </button>
        </form>
      </div>

      <!-- Step: Matches -->
      <div v-else-if="step === 'matches'" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold" style="color: var(--primary-text)">
              Viajes Compatibles Encontrados
            </h2>
            <button
              @click="resetForm"
              class="px-4 py-2 rounded-lg"
              style="background-color: var(--light-gray); color: var(--primary-text)"
            >
              Volver
            </button>
          </div>

          <LoadingSpinner v-if="loading" />

          <div v-else-if="matches.length === 0" class="text-center py-12">
            <p style="color: var(--secondary-text)" class="text-lg">
              No se encontraron viajes compatibles
            </p>
            <p style="color: var(--muted-color)" class="mt-2">
              Intenta ajustar tus criterios de búsqueda
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="match in matches.filter(m => m.isCompatible)"
              :key="match.tripId"
              class="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              :style="{ borderColor: 'var(--light-gray)' }"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-semibold" style="color: var(--primary-text)">
                    {{ match.tripOrigin }} → {{ match.tripDestination }}
                  </h3>
                  <p style="color: var(--secondary-text)">
                    Salida: {{ match.departureTime.substring(0, 5) }}
                  </p>
                </div>
                <div
                  v-if="match.matchScore"
                  class="text-right px-4 py-2 rounded-lg"
                  :style="{
                    backgroundColor: 'var(--success-color)',
                    color: 'var(--primary-color)'
                  }"
                >
                  <p class="text-2xl font-bold">{{ Math.round(match.matchScore.score) }}%</p>
                  <p class="text-xs">Compatibilidad</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-sm font-medium" style="color: var(--primary-text)">
                    Plazas disponibles
                  </p>
                  <p style="color: var(--secondary-text)">{{ match.availableSeats }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium" style="color: var(--primary-text)">
                    Desvío adicional
                  </p>
                  <p style="color: var(--secondary-text)">
                    {{ match.additionalDetourMinutes || 0 }} min
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium" style="color: var(--primary-text)">
                    Desvío total
                  </p>
                  <p style="color: var(--secondary-text)">
                    {{ match.projectedTotalDetour || 0 }} / {{ match.maxDetourMinutes }} min
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <button
                  @click="handleAcceptMatch(match.tripId)"
                  :disabled="loading"
                  class="flex-1 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style="background-color: var(--secondary-color); color: var(--primary-color)"
                >
                  Aceptar y Reservar
                </button>
                <button
                  @click="$router.push(`/trips/${match.tripId}`)"
                  class="flex-1 py-3 rounded-lg font-medium"
                  style="background-color: var(--primary-color); color: var(--tertiary-text)"
                >
                  Ver Detalles
                </button>
              </div>
            </div>

            <!-- Mostrar también los no compatibles -->
            <div v-if="matches.filter(m => !m.isCompatible).length > 0" class="mt-8">
              <h3 class="text-lg font-semibold mb-4" style="color: var(--muted-color)">
                Viajes no compatibles ({{ matches.filter(m => !m.isCompatible).length }})
              </h3>
              <details class="cursor-pointer">
                <summary class="text-sm" style="color: var(--secondary-text)">
                  Ver motivos
                </summary>
                <div class="mt-4 space-y-2">
                  <div
                    v-for="match in matches.filter(m => !m.isCompatible)"
                    :key="match.tripId"
                    class="border rounded-lg p-4"
                    style="border-color: var(--light-gray)"
                  >
                    <p style="color: var(--primary-text)">
                      {{ match.tripOrigin }} → {{ match.tripDestination }}
                    </p>
                    <p class="text-sm" style="color: var(--error-color)">
                      {{ match.reason }}
                    </p>
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
