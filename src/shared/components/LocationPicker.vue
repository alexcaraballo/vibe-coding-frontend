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
    <label class="location-label">
      {{ label }} <span v-if="required" class="required-indicator">*</span>
    </label>

    <div class="input-container">
      <input
        :value="addressInput"
        @input="handleAddressInput"
        type="text"
        :placeholder="placeholder || 'Ingresa una dirección'"
        :required="required"
        class="location-input"
        @keyup.enter="searchAddress"
      />
      <button
        type="button"
        @click="searchAddress"
        class="action-button search-button"
        title="Buscar dirección"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        @click="toggleMap"
        :class="['action-button', showMap ? 'map-button-close' : 'map-button-open']"
        :title="showMap ? 'Ocultar mapa' : 'Mostrar mapa'"
      >
        <svg v-if="!showMap" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div v-if="showMap" class="map-wrapper animate-fadeIn">
      <div ref="mapContainer" class="map-element"></div>
      <div class="map-hint">
        <svg xmlns="http://www.w3.org/2000/svg" class="hint-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <p class="hint-text">
          Haz clic en el mapa o arrastra el marcador para seleccionar una ubicación precisa
        </p>
      </div>
    </div>

    <div v-if="modelValue" class="coordinates-badge">
      <svg xmlns="http://www.w3.org/2000/svg" class="badge-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
      <span class="badge-label">Coordenadas:</span>
      <span class="badge-value">{{ modelValue.lat.toFixed(4) }}, {{ modelValue.lng.toFixed(4) }}</span>
    </div>
  </div>
</template>

<style scoped>
.location-picker {
  width: 100%;
}

/* Label */
.location-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.required-indicator {
  color: var(--error-color);
  margin-left: 0.25rem;
}

/* Input Container */
.input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.location-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--light-gray);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: var(--primary-text);
  background-color: var(--white-color);
  outline: none;
  transition: all 0.2s ease;
}

.location-input::placeholder {
  color: var(--muted-color);
}

.location-input:focus {
  border-color: var(--tertiary-color);
  box-shadow: 0 0 0 3px rgba(0, 53, 181, 0.1);
}

.location-input:hover {
  border-color: var(--secondary-text);
}

/* Action Buttons */
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  min-width: 48px;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: translateY(0);
}

.search-button {
  background-color: var(--secondary-color);
  color: var(--primary-color);
}

.search-button:hover {
  background-color: var(--success-color);
}

.map-button-open {
  background-color: var(--tertiary-color);
  color: var(--tertiary-text);
}

.map-button-close {
  background-color: var(--error-color);
  color: var(--tertiary-text);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Map Wrapper */
.map-wrapper {
  margin-bottom: 1rem;
  border: 2px solid var(--light-gray);
  border-radius: 1rem;
  overflow: hidden;
  background-color: var(--white-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.map-element {
  width: 100%;
  height: 400px;
}

/* Map Hint */
.map-hint {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(0, 53, 181, 0.05) 0%, rgba(0, 239, 156, 0.05) 100%);
  border-top: 2px solid var(--light-gray);
}

.hint-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--tertiary-color);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.hint-text {
  font-size: 0.8125rem;
  color: var(--secondary-text);
  line-height: 1.5;
  margin: 0;
}

/* Coordinates Badge */
.coordinates-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--background-color) 0%, var(--white-color) 100%);
  border: 2px solid var(--light-gray);
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.badge-icon {
  width: 1rem;
  height: 1rem;
  color: var(--tertiary-color);
  flex-shrink: 0;
}

.badge-label {
  font-weight: 600;
  color: var(--primary-text);
}

.badge-value {
  color: var(--secondary-text);
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Responsive */
@media (max-width: 640px) {
  .location-input {
    font-size: 0.875rem;
  }

  .action-button {
    padding: 0.625rem;
  }

  .map-element {
    height: 300px;
  }
}
</style>
