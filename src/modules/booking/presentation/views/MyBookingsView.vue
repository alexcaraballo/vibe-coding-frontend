<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookings } from '../composables/useBookings'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const { bookings, loading, error, fetchMyBookings, cancelBooking } = useBookings()

onMounted(() => {
  fetchMyBookings()
})

const handleCancel = async (id: number) => {
  if (confirm('¿Estás seguro de cancelar esta reserva?')) {
    await cancelBooking(id)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Mis Reservas</h1>

      <ErrorBanner :message="error" />
      <LoadingSpinner v-if="loading" />

      <div v-else-if="bookings.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No tienes reservas</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in bookings"
          :key="item.booking.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">
                {{ item.trip.origin }} → {{ item.trip.destination }}
              </h3>
              <p class="text-gray-600 mt-2">Fecha: {{ formatDate(item.trip.departureDate) }}</p>
              <p class="text-gray-600">Plazas: {{ item.booking.seatsBooked }}</p>
              <p v-if="item.driver" class="text-gray-600">Conductor: {{ item.driver.name }}</p>
            </div>
            <div class="text-right">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="{
                  'bg-green-100 text-green-800': item.booking.status === 'confirmed',
                  'bg-red-100 text-red-800': item.booking.status === 'cancelled',
                  'bg-gray-100 text-gray-800': item.booking.status === 'completed'
                }"
              >
                {{ item.booking.status }}
              </span>
              <button
                v-if="item.booking.status === 'confirmed'"
                @click="handleCancel(item.booking.id)"
                class="mt-4 block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
