<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface LocationData {
  address: string
  lat: number
  lng: number
}

const props = defineProps<{
  modelValue: LocationData | null
  label: string
  placeholder?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LocationData | null]
}>()

const addressInput = ref('')
const mapContainer = ref<HTMLElement | null>(null)
const showMap = ref(false)
let map: L.Map | null = null
let marker: L.Marker | null = null

// Initialize address input from modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    addressInput.value = newValue.address
  }
}, { immediate: true })

const initMap = async () => {
  await nextTick()

  if (!mapContainer.value || map) return

  // Default center (Spain)
  const defaultLat = props.modelValue?.lat || 40.4168
  const defaultLng = props.modelValue?.lng || -3.7038

  map = L.map(mapContainer.value).setView([defaultLat, defaultLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // Add marker if there's an existing location
  if (props.modelValue) {
    marker = L.marker([props.modelValue.lat, props.modelValue.lng], {
      draggable: true
    }).addTo(map)

    marker.on('dragend', handleMarkerDrag)
  }

  // Handle map clicks
  map.on('click', handleMapClick)

  // Fix map display issues
  setTimeout(() => {
    map?.invalidateSize()
  }, 100)
}

const handleMapClick = async (e: L.LeafletMouseEvent) => {
  const { lat, lng } = e.latlng

  // Remove existing marker
  if (marker) {
    map?.removeLayer(marker)
  }

  // Add new marker
  marker = L.marker([lat, lng], {
    draggable: true
  }).addTo(map!)

  marker.on('dragend', handleMarkerDrag)

  // Get address from coordinates (reverse geocoding)
  await updateLocationFromCoordinates(lat, lng)
}

const handleMarkerDrag = async () => {
  if (!marker) return

  const position = marker.getLatLng()
  await updateLocationFromCoordinates(position.lat, position.lng)
}

const updateLocationFromCoordinates = async (lat: number, lng: number) => {
  try {
    // Use Nominatim for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`
    )
    const data = await response.json()

    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    addressInput.value = address

    emit('update:modelValue', {
      address,
      lat,
      lng
    })
  } catch (error) {
    console.error('Error getting address:', error)
    // Fallback to coordinates
    const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    addressInput.value = address

    emit('update:modelValue', {
      address,
      lat,
      lng
    })
  }
}

const searchAddress = async () => {
  if (!addressInput.value.trim()) return

  try {
    // Use Nominatim for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput.value)}&accept-language=es&limit=1`
    )
    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      // Update map
      if (map) {
        map.setView([latitude, longitude], 13)

        // Remove existing marker
        if (marker) {
          map.removeLayer(marker)
        }

        // Add new marker
        marker = L.marker([latitude, longitude], {
          draggable: true
        }).addTo(map)

        marker.on('dragend', handleMarkerDrag)
      }

      addressInput.value = display_name

      emit('update:modelValue', {
        address: display_name,
        lat: latitude,
        lng: longitude
      })
    } else {
      alert('No se encontró la dirección. Intenta con otra búsqueda.')
    }
  } catch (error) {
    console.error('Error searching address:', error)
    alert('Error al buscar la dirección')
  }
}

const toggleMap = () => {
  showMap.value = !showMap.value

  if (showMap.value) {
    setTimeout(() => {
      initMap()
    }, 50)
  }
}

const handleAddressInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  addressInput.value = target.value
}
</script>

<template>
  <div class="location-picker">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="flex gap-2 mb-2">
      <input
        :value="addressInput"
        @input="handleAddressInput"
        type="text"
        :placeholder="placeholder || 'Ingresa una dirección'"
        :required="required"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        @keyup.enter="searchAddress"
      />
      <button
        type="button"
        @click="searchAddress"
        class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        🔍 Buscar
      </button>
      <button
        type="button"
        @click="toggleMap"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        {{ showMap ? '📍 Ocultar' : '🗺️ Mapa' }}
      </button>
    </div>

    <div v-if="showMap" class="map-container mb-2">
      <div ref="mapContainer" class="map-element"></div>
      <p class="text-xs text-gray-500 mt-2">
        💡 Haz clic en el mapa o arrastra el marcador para seleccionar una ubicación
      </p>
    </div>

    <div v-if="modelValue" class="text-xs text-gray-600">
      📍 Coordenadas: {{ modelValue.lat.toFixed(4) }}, {{ modelValue.lng.toFixed(4) }}
    </div>
  </div>
</template>

<style scoped>
.location-picker {
  width: 100%;
}

.map-container {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.map-element {
  width: 100%;
  height: 400px;
}
</style>
