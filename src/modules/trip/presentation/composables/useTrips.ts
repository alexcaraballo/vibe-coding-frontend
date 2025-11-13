import { ref, readonly } from 'vue'
import { TripServiceContainer } from '@/modules/trip/infrastructure/di/container'
import type { Trip, CreateTripData, UpdateTripData, TripSearchFilters } from '@/modules/trip/domain/models/Trip'
import { TripValidator } from '@/modules/trip/domain/models/Trip'

export function useTrips() {
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)

  const repository = TripServiceContainer.getTripRepository()

  const createTrip = async (data: CreateTripData): Promise<Trip | null> => {
    if (!TripValidator.isValidSeats(data.availableSeats)) {
      error.value = 'Número de plazas inválido'
      return null
    }

    if (data.pricePerSeat !== undefined && !TripValidator.isValidPrice(data.pricePerSeat)) {
      error.value = 'Precio inválido'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newTrip = await repository.create(data)
      trips.value.push(newTrip)
      return newTrip
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al crear viaje'
      console.error('Error creating trip:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTripById = async (id: number): Promise<Trip | null> => {
    loading.value = true
    error.value = null

    try {
      currentTrip.value = await repository.getById(id)
      return currentTrip.value
    } catch (err: any) {
      error.value = 'Error al cargar viaje'
      console.error('Error fetching trip:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTrips = async (skip = 0, limit = 100, status?: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await repository.getAll(skip, limit, status)
      trips.value = response.trips
      total.value = response.total
    } catch (err: any) {
      error.value = 'Error al cargar viajes'
      console.error('Error fetching trips:', err)
    } finally {
      loading.value = false
    }
  }

  const searchTrips = async (filters: TripSearchFilters) => {
    loading.value = true
    error.value = null

    try {
      const response = await repository.search(filters)
      trips.value = response.trips
      total.value = response.total
    } catch (err: any) {
      error.value = 'Error al buscar viajes'
      console.error('Error searching trips:', err)
    } finally {
      loading.value = false
    }
  }

  const updateTrip = async (id: number, data: UpdateTripData): Promise<Trip | null> => {
    loading.value = true
    error.value = null

    try {
      const updated = await repository.update(id, data)
      const index = trips.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        trips.value[index] = updated
      }
      if (currentTrip.value?.id === id) {
        currentTrip.value = updated
      }
      return updated
    } catch (err: any) {
      error.value = 'Error al actualizar viaje'
      console.error('Error updating trip:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteTrip = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await repository.delete(id)
      trips.value = trips.value.filter((t) => t.id !== id)
      return true
    } catch (err: any) {
      error.value = 'Error al eliminar viaje'
      console.error('Error deleting trip:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchDriverTrips = async (driverId: number, skip = 0, limit = 100) => {
    loading.value = true
    error.value = null

    try {
      const response = await repository.getByDriver(driverId, skip, limit)
      trips.value = response.trips
      total.value = response.total
    } catch (err: any) {
      error.value = 'Error al cargar viajes del conductor'
      console.error('Error fetching driver trips:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    trips: readonly(trips),
    currentTrip: readonly(currentTrip),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    createTrip,
    fetchTripById,
    fetchTrips,
    searchTrips,
    updateTrip,
    deleteTrip,
    fetchDriverTrips
  }
}
