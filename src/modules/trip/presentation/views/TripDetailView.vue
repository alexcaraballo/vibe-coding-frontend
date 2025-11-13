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
    <div class="max-w-4xl mx-auto">
      <LoadingSpinner v-if="tripLoading" full-screen />

      <div v-else-if="currentTrip" class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            {{ currentTrip.origin }} → {{ currentTrip.destination }}
          </h1>
          <p class="text-xl text-gray-600 mb-6">{{ formatDate(currentTrip.departureDate) }}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold text-gray-700 mb-2">Detalles del Viaje</h3>
              <div class="space-y-2 text-gray-600">
                <p>Salida: {{ formatTime(currentTrip.departureTime) }}</p>
                <p v-if="currentTrip.estimatedArrivalTime">
                  Llegada estimada: {{ formatTime(currentTrip.estimatedArrivalTime) }}
                </p>
                <p>Plazas disponibles: {{ currentTrip.availableSeats }} / {{ currentTrip.totalSeats }}</p>
                <p v-if="currentTrip.pricePerSeat">Precio: {{ currentTrip.pricePerSeat }}€ / plaza</p>
              </div>
            </div>

            <div v-if="currentTrip.description">
              <h3 class="font-semibold text-gray-700 mb-2">Descripción</h3>
              <p class="text-gray-600">{{ currentTrip.description }}</p>
            </div>
          </div>

          <!-- Mapa de ruta -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-4">Ruta del Viaje</h3>
            <LoadingSpinner v-if="routeLoading" />
            <RouteMap v-else-if="currentRoute" :route="currentRoute" height="500px" />
            <div v-else class="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
              No se pudo cargar la ruta del viaje
            </div>
          </div>

          <!-- Impacto de CO₂ -->
          <div class="mb-6">
            <LoadingSpinner v-if="impactLoading" />
            <CO2Impact v-else-if="tripImpact" :impact="tripImpact" />
          </div>

          <ErrorBanner :message="tripError || bookingError" />

          <!-- Booking Panel -->
          <div v-if="currentTrip.status === 'active' && currentTrip.availableSeats > 0" class="border-t pt-6">
            <h3 class="font-semibold text-gray-700 mb-4">Reservar Plaza</h3>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Número de plazas
                </label>
                <select
                  v-model="seatsRequested"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option v-for="n in currentTrip.availableSeats" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  v-model="passengerNotes"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Información adicional..."
                ></textarea>
              </div>

              <button
                @click="handleBooking"
                :disabled="bookingLoading || user?.id === currentTrip.driverId"
                class="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
              >
                <LoadingSpinner v-if="bookingLoading" size="sm" color="white" />
                <span v-else-if="user?.id === currentTrip.driverId">No puedes reservar tu propio viaje</span>
                <span v-else>Solicitar Plaza</span>
              </button>
            </div>
          </div>
          <div v-else class="border-t pt-6">
            <p class="text-center text-gray-500">Este viaje ya no está disponible</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
