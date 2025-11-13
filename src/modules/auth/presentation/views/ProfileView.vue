<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useImpact } from '@/modules/impact/presentation/composables/useImpact'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
import CO2Stats from '@/modules/impact/presentation/components/CO2Stats.vue'

const { user, loading, error, updateProfile, initFromStorage } = useAuth()
const { userStats, loading: statsLoading, getMyCO2Stats } = useImpact()

const name = ref('')
const phone = ref('')
const vehicleModel = ref('')
const vehiclePlate = ref('')
const licenseNumber = ref('')

onMounted(async () => {
  initFromStorage()
  if (user.value) {
    name.value = user.value.name
    phone.value = user.value.phone || ''
    vehicleModel.value = user.value.vehicleModel || ''
    vehiclePlate.value = user.value.vehiclePlate || ''
    licenseNumber.value = user.value.licenseNumber || ''
  }

  // Cargar estadísticas de CO₂
  await getMyCO2Stats()
})

const handleUpdate = async () => {
  const success = await updateProfile({
    name: name.value,
    phone: phone.value,
    vehicleModel: vehicleModel.value || undefined,
    vehiclePlate: vehiclePlate.value || undefined,
    licenseNumber: licenseNumber.value || undefined
  })

  if (success) {
    alert('Perfil actualizado con éxito')
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

        <ErrorBanner :message="error" />

        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              :value="user?.email"
              type="email"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              v-model="name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              v-model="phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="border-t pt-4 mt-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Información del vehículo (para conductores)</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Modelo del vehículo</label>
                <input
                  v-model="vehicleModel"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                <input
                  v-model="vehiclePlate"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Número de licencia</label>
                <input
                  v-model="licenseNumber"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" />
            <span v-else>Actualizar Perfil</span>
          </button>
        </form>
      </div>

      <!-- Estadísticas de CO₂ -->
      <div class="mt-6">
        <LoadingSpinner v-if="statsLoading" />
        <CO2Stats v-else-if="userStats" :stats="userStats" />
      </div>
    </div>
  </AppLayout>
</template>
