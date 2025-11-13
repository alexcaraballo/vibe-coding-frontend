<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTrips } from '../composables/useTrips'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import LocationPicker, { type LocationData } from '@/shared/components/LocationPicker.vue'

const router = useRouter()
const { createTrip, loading, error } = useTrips()

const originLocation = ref<LocationData | null>(null)
const destinationLocation = ref<LocationData | null>(null)
const departureDate = ref('')
const departureTime = ref('')
const availableSeats = ref(3)
const pricePerSeat = ref<number | undefined>(undefined)
const description = ref('')
const vehicleType = ref<'gasoline' | 'diesel' | 'hybrid' | 'electric'>('gasoline')
const maxDetourMinutes = ref(30)

const handlePublish = async () => {
  if (!originLocation.value || !destinationLocation.value) {
    alert('Por favor selecciona origen y destino en el mapa')
    return
  }

  const trip = await createTrip({
    origin: originLocation.value.address,
    destination: destinationLocation.value.address,
    originLat: originLocation.value.lat,
    originLng: originLocation.value.lng,
    destinationLat: destinationLocation.value.lat,
    destinationLng: destinationLocation.value.lng,
    departureDate: departureDate.value,
    departureTime: departureTime.value,
    availableSeats: availableSeats.value,
    pricePerSeat: pricePerSeat.value,
    description: description.value || undefined,
    vehicleType: vehicleType.value,
    maxDetourMinutes: maxDetourMinutes.value
  })

  if (trip) {
    alert('Viaje publicado con éxito')
    router.push('/my-trips')
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Publicar Viaje</h1>

        <ErrorBanner :message="error" @dismiss="error = null" />

        <form @submit.prevent="handlePublish" class="space-y-6">
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
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
              <input
                v-model="departureDate"
                type="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
              <input
                v-model="departureTime"
                type="time"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Plazas disponibles *</label>
              <input
                v-model="availableSeats"
                type="number"
                min="1"
                max="10"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Precio por plaza (€)</label>
              <input
                v-model="pricePerSeat"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Desvío máximo (minutos)</label>
              <input
                v-model="maxDetourMinutes"
                type="number"
                min="0"
                max="120"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
              <p class="text-sm text-gray-500 mt-1">
                Tiempo máximo de desvío que aceptas para recoger pasajeros
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de vehículo *</label>
              <select
                v-model="vehicleType"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="hybrid">Híbrido</option>
                <option value="electric">Eléctrico</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">
                Ayuda a calcular el impacto ambiental del viaje compartido
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Información adicional sobre el viaje..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" />
            <span v-else>Publicar Viaje</span>
          </button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
