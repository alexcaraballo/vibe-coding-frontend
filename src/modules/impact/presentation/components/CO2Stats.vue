<script setup lang="ts">
import { computed } from 'vue'
import type { UserCO2Stats } from '../../domain/models/CO2Impact'

const props = defineProps<{
  stats: UserCO2Stats
}>()

const hasStats = computed(() => {
  return props.stats.totalTrips > 0
})
</script>

<template>
  <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
    <div class="flex items-center mb-6">
      <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: var(--success-color)">
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Tu Impacto Ambiental</h2>
        <p class="text-sm text-gray-600">Estadísticas de CO₂ ahorrado</p>
      </div>
    </div>

    <div v-if="hasStats">
      <!-- CO2 Total ahorrado - destacado -->
      <div class="bg-white rounded-lg p-6 shadow-md mb-6">
        <p class="text-sm text-gray-500 mb-2">Total de CO₂ ahorrado</p>
        <p class="text-5xl font-bold" style="color: var(--success-color)">
          {{ stats.totalCo2SavedKg.toFixed(1) }} kg
        </p>
      </div>

      <!-- Estadísticas de viajes -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-xs text-gray-500 mb-1">Total viajes</p>
          <p class="text-2xl font-bold" style="color: var(--primary-color)">
            {{ stats.totalTrips }}
          </p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-xs text-gray-500 mb-1">Como conductor</p>
          <p class="text-2xl font-bold text-blue-600">
            {{ stats.tripsAsDriver }}
          </p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm">
          <p class="text-xs text-gray-500 mb-1">Como pasajero</p>
          <p class="text-2xl font-bold text-purple-600">
            {{ stats.tripsAsPassenger }}
          </p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-sm col-span-2 md:col-span-3">
          <p class="text-xs text-gray-500 mb-1">Promedio de CO₂ por viaje</p>
          <p class="text-2xl font-bold" style="color: var(--secondary-color)">
            {{ stats.averageCo2PerTripKg.toFixed(1) }} kg
          </p>
        </div>
      </div>

      <!-- Equivalencias -->
      <div class="bg-white rounded-lg p-5 shadow-sm">
        <p class="text-sm font-semibold mb-4" style="color: var(--primary-color)">
          Tu impacto equivale a:
        </p>

        <div class="space-y-4">
          <!-- Árboles -->
          <div class="flex items-start">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style="background-color: rgba(16, 185, 129, 0.1)">
              <svg class="w-6 h-6" style="color: var(--success-color)" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ stats.equivalenceTrees.toFixed(1) }} árboles</p>
              <p class="text-sm text-gray-600">{{ stats.description.trees }}</p>
            </div>
          </div>

          <!-- Kilómetros no conducidos -->
          <div class="flex items-start">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style="background-color: rgba(16, 185, 129, 0.1)">
              <svg class="w-6 h-6" style="color: var(--success-color)" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ stats.equivalenceKmNotDriven.toFixed(0) }} km</p>
              <p class="text-sm text-gray-600">{{ stats.description.km }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje motivacional -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 italic">
          ¡Sigue compartiendo viajes y ayudando al planeta!
        </p>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500 mb-2">Aún no tienes estadísticas de CO₂</p>
      <p class="text-sm text-gray-400">Comienza a compartir viajes para ver tu impacto ambiental</p>
    </div>
  </div>
</template>
