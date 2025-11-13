<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrips } from '../composables/useTrips'
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const router = useRouter()
const { trips, loading, error, fetchDriverTrips } = useTrips()
const { user, initFromStorage } = useAuth()

onMounted(async () => {
  initFromStorage()
  if (user.value) {
    await fetchDriverTrips(user.value.id)
  }
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Mis Viajes Publicados</h1>
        <router-link
          to="/trips/publish"
          class="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
        >
          Publicar Nuevo Viaje
        </router-link>
      </div>

      <ErrorBanner :message="error" />
      <LoadingSpinner v-if="loading" />

      <div v-else-if="trips.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No has publicado ningún viaje</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="trip in trips"
          :key="trip.id"
          class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          @click="router.push(`/trips/${trip.id}`)"
        >
          <h3 class="text-xl font-semibold text-gray-800 mb-2">
            {{ trip.origin }} → {{ trip.destination }}
          </h3>
          <p class="text-gray-600">Fecha: {{ formatDate(trip.departureDate) }}</p>
          <p class="text-gray-600">Plazas: {{ trip.availableSeats }} / {{ trip.totalSeats }}</p>
          <span
            class="inline-block mt-4 px-3 py-1 rounded-full text-sm font-medium"
            :class="{
              'bg-green-100 text-green-800': trip.status === 'active',
              'bg-gray-100 text-gray-800': trip.status !== 'active'
            }"
          >
            {{ trip.status }}
          </span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
