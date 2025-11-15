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
    <div class="publish-container">
      <div class="publish-card">
        <h1 class="page-title">Publicar Viaje</h1>

        <ErrorBanner :message="error" @dismiss="error = null" />

        <form @submit.prevent="handlePublish" class="publish-form">
          <div class="form-section">
            <h2 class="section-title">Ubicaciones</h2>
            <div class="form-grid">
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
          </div>

          <div class="form-section">
            <h2 class="section-title">Fecha y Hora</h2>
            <div class="form-grid form-grid-2">
              <div class="form-field">
                <label for="date" class="field-label">Fecha *</label>
                <input
                  id="date"
                  v-model="departureDate"
                  type="date"
                  required
                  class="field-input"
                />
              </div>

              <div class="form-field">
                <label for="time" class="field-label">Hora *</label>
                <input
                  id="time"
                  v-model="departureTime"
                  type="time"
                  required
                  class="field-input"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Detalles del Viaje</h2>
            <div class="form-grid form-grid-2">
              <div class="form-field">
                <label for="seats" class="field-label">Plazas disponibles *</label>
                <input
                  id="seats"
                  v-model="availableSeats"
                  type="number"
                  min="1"
                  max="10"
                  required
                  class="field-input"
                />
              </div>

              <div class="form-field">
                <label for="price" class="field-label">Precio por plaza (€)</label>
                <input
                  id="price"
                  v-model="pricePerSeat"
                  type="number"
                  min="0"
                  step="0.01"
                  class="field-input"
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">Configuración Adicional</h2>
            <div class="form-grid form-grid-2">
              <div class="form-field">
                <label for="detour" class="field-label">Desvío máximo (minutos)</label>
                <input
                  id="detour"
                  v-model="maxDetourMinutes"
                  type="number"
                  min="0"
                  max="120"
                  class="field-input"
                  placeholder="30"
                />
                <p class="field-hint">
                  Tiempo máximo de desvío para recoger pasajeros
                </p>
              </div>

              <div class="form-field">
                <label for="vehicle" class="field-label">Tipo de vehículo *</label>
                <select
                  id="vehicle"
                  v-model="vehicleType"
                  required
                  class="field-input"
                >
                  <option value="gasoline">🚗 Gasolina</option>
                  <option value="diesel">🚙 Diésel</option>
                  <option value="hybrid">⚡ Híbrido</option>
                  <option value="electric">🔋 Eléctrico</option>
                </select>
                <p class="field-hint">
                  Ayuda a calcular el impacto ambiental
                </p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-field">
              <label for="description" class="field-label">Descripción</label>
              <textarea
                id="description"
                v-model="description"
                rows="4"
                class="field-input field-textarea"
                placeholder="Información adicional sobre el viaje..."
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="submit-button"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" />
            <template v-else>
              <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Publicar Viaje</span>
            </template>
          </button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Container */
.publish-container {
  max-width: 900px;
  margin: 0 auto;
}

.publish-card {
  background-color: var(--white-color);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

/* Page Title */
.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--primary-text);
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.02em;
}

/* Form */
.publish-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Form Sections */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--light-gray);
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.form-grid-2 {
  gap: 1rem;
}

/* Form Fields */
.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-text);
  margin-bottom: 0.5rem;
}

.field-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--light-gray);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: var(--primary-text);
  background-color: var(--white-color);
  outline: none;
  transition: all 0.2s ease;
}

.field-input::placeholder {
  color: var(--muted-color);
}

.field-input:focus {
  border-color: var(--tertiary-color);
  box-shadow: 0 0 0 3px rgba(0, 53, 181, 0.1);
}

.field-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--muted-color);
  margin-top: 0.375rem;
  line-height: 1.4;
}

/* Submit Button */
.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 239, 156, 0.3);
  min-height: 48px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 239, 156, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Tablet */
@media (min-width: 768px) {
  .publish-card {
    padding: 2rem;
  }

  .page-title {
    font-size: 2.25rem;
    margin-bottom: 2rem;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .publish-card {
    padding: 2.5rem;
  }

  .page-title {
    font-size: 2.5rem;
  }
}
</style>
