<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Route } from '@/modules/maps/domain/models/Route'

const props = defineProps<{
  route: Route | null
  height?: string
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null

const initMap = () => {
  if (!mapContainer.value || !props.route) return

  // Si ya existe un mapa, eliminarlo
  if (map) {
    map.remove()
  }

  // Crear el mapa centrado en el origen
  const originCoords = props.route.origin.coordinates
  map = L.map(mapContainer.value).setView([originCoords.latitude, originCoords.longitude], 10)

  // Añadir capa de tiles de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Añadir marcador de origen
  L.marker([originCoords.latitude, originCoords.longitude])
    .addTo(map)
    .bindPopup(`<b>Origen:</b> ${props.route.origin.name}`)

  // Añadir marcador de destino
  const destCoords = props.route.destination.coordinates
  L.marker([destCoords.latitude, destCoords.longitude])
    .addTo(map)
    .bindPopup(`<b>Destino:</b> ${props.route.destination.name}`)

  // Si hay polyline, dibujar la ruta
  if (props.route.polyline && props.route.polyline.length > 0) {
    const latLngs = props.route.polyline.map(coord => [coord.latitude, coord.longitude] as [number, number])
    const polyline = L.polyline(latLngs, {
      color: 'var(--primary-color, #001547)',
      weight: 4,
      opacity: 0.7
    }).addTo(map)

    // Ajustar el zoom para ver toda la ruta
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
  } else {
    // Si no hay polyline, ajustar para ver origen y destino
    const bounds = L.latLngBounds(
      [originCoords.latitude, originCoords.longitude],
      [destCoords.latitude, destCoords.longitude]
    )
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}

onMounted(() => {
  if (props.route) {
    initMap()
  }
})

watch(() => props.route, (newRoute) => {
  if (newRoute) {
    initMap()
  }
}, { deep: true })
</script>

<template>
  <div class="route-map">
    <div
      ref="mapContainer"
      :style="{ height: height || '400px' }"
      class="rounded-lg shadow-md"
    ></div>

    <div v-if="route" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div class="bg-white p-3 rounded-lg shadow">
        <span class="font-semibold text-gray-700">Origen:</span>
        <p class="text-gray-600">{{ route.origin.name }}</p>
      </div>
      <div class="bg-white p-3 rounded-lg shadow">
        <span class="font-semibold text-gray-700">Destino:</span>
        <p class="text-gray-600">{{ route.destination.name }}</p>
      </div>
      <div class="bg-white p-3 rounded-lg shadow">
        <span class="font-semibold text-gray-700">Distancia:</span>
        <p class="text-gray-600">
          {{ route.distanceKm ? `${route.distanceKm.toFixed(1)} km` : 'N/A' }}
          {{ route.durationMinutes ? ` (${route.durationMinutes} min)` : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-map {
  width: 100%;
}

/* Fix para íconos de Leaflet */
:global(.leaflet-default-icon-path) {
  background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png');
}
</style>
