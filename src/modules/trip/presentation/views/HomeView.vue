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
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">Búsqueda de Viajes</h1>

      <!-- Search Panel -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <form @submit.prevent="handleSearch" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="origin" class="block text-sm font-medium text-gray-700 mb-2">
              Origen
            </label>
            <input
              id="origin"
              v-model="origin"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ciudad origen"
            />
          </div>

          <div>
            <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
              Destino
            </label>
            <input
              id="destination"
              v-model="destination"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ciudad destino"
            />
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2"> Fecha </label>
            <input
              id="date"
              v-model="dateFrom"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="flex items-end">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      <ErrorBanner :message="error" @dismiss="error = null" />

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" />

      <!-- Empty State -->
      <div v-else-if="!loading && trips.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No hay viajes disponibles</p>
        <p class="text-gray-400 mt-2">Intenta ajustar tus criterios de búsqueda</p>
      </div>

      <!-- Trips Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="trip in trips"
          :key="trip.id"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTripDetail(trip.id)"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ trip.origin }} → {{ trip.destination }}
              </h3>
              <p class="text-sm text-gray-500">{{ formatDate(trip.departureDate) }}</p>
            </div>
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': trip.status === 'active',
                'bg-gray-100 text-gray-800': trip.status !== 'active'
              }"
            >
              {{ trip.status === 'active' ? 'Activo' : trip.status }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center text-gray-600">
              <span class="text-sm">Salida: {{ formatTime(trip.departureTime) }}</span>
            </div>
            <div v-if="trip.estimatedArrivalTime" class="flex items-center text-gray-600">
              <span class="text-sm">Llegada: {{ formatTime(trip.estimatedArrivalTime) }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <span class="text-sm">Plazas disponibles: {{ trip.availableSeats }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <span v-if="trip.pricePerSeat" class="text-2xl font-bold text-primary-600">
              {{ trip.pricePerSeat }}€
            </span>
            <span v-else class="text-sm text-gray-500">Precio a consultar</span>
            <button
              @click.stop="viewTripDetail(trip.id)"
              class="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
