import { ref } from 'vue'
import type { Ref } from 'vue'
import MapsContainer from '../../infrastructure/di/container'
import type { Coordinates, Route, RouteRequest, GeocodeRequest, RouteWithStops, PublicBookingsView } from '../../domain/models/Route'

export function useMaps() {
  const mapsRepository = MapsContainer.getInstance().getMapsRepository()

  const currentRoute: Ref<Route | null> = ref(null)
  const routeWithStops: Ref<RouteWithStops | null> = ref(null)
  const publicBookings: Ref<PublicBookingsView | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const geocodeAddress = async (request: GeocodeRequest): Promise<Coordinates | null> => {
    loading.value = true
    error.value = null
    try {
      return await mapsRepository.geocodeAddress(request)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al geocodificar dirección'
      return null
    } finally {
      loading.value = false
    }
  }

  const calculateRoute = async (request: RouteRequest): Promise<Route | null> => {
    loading.value = true
    error.value = null
    try {
      const route = await mapsRepository.calculateRoute(request)
      currentRoute.value = route
      return route
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al calcular ruta'
      return null
    } finally {
      loading.value = false
    }
  }

  const getTripRoute = async (tripId: number): Promise<Route | null> => {
    loading.value = true
    error.value = null
    try {
      const route = await mapsRepository.getTripRoute(tripId)
      currentRoute.value = route
      return route
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener ruta del viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const getTripRouteWithStops = async (tripId: number): Promise<RouteWithStops | null> => {
    loading.value = true
    error.value = null
    try {
      const route = await mapsRepository.getTripRouteWithStops(tripId)
      routeWithStops.value = route
      return route
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener ruta con paradas'
      return null
    } finally {
      loading.value = false
    }
  }

  const getPublicBookings = async (tripId: number): Promise<PublicBookingsView | null> => {
    loading.value = true
    error.value = null
    try {
      const bookings = await mapsRepository.getPublicBookings(tripId)
      publicBookings.value = bookings
      return bookings
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener visualización de reservas'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    currentRoute,
    routeWithStops,
    publicBookings,
    loading,
    error,
    geocodeAddress,
    calculateRoute,
    getTripRoute,
    getTripRouteWithStops,
    getPublicBookings
  }
}
