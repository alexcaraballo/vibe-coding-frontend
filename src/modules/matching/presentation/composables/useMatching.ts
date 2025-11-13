import { ref } from 'vue'
import type { Ref } from 'vue'
import MatchingContainer from '../../infrastructure/di/container'
import type { TravelRequest, CreateTravelRequestData, MatchResult } from '../../domain/models/TravelRequest'
import type { LocationSearchRequest } from '../../domain/models/LocationSearch'

export function useMatching() {
  const matchingRepository = MatchingContainer.getInstance().getMatchingRepository()

  const travelRequests: Ref<TravelRequest[]> = ref([])
  const currentRequest: Ref<TravelRequest | null> = ref(null)
  const matches: Ref<MatchResult[]> = ref([])
  const locationTrips: Ref<any[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const createTravelRequest = async (data: CreateTravelRequestData): Promise<TravelRequest | null> => {
    loading.value = true
    error.value = null
    try {
      const request = await matchingRepository.createTravelRequest(data)
      currentRequest.value = request
      return request
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al crear la solicitud de viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const getMyTravelRequests = async (skip?: number, limit?: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      travelRequests.value = await matchingRepository.getMyTravelRequests(skip, limit)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener solicitudes'
      travelRequests.value = []
    } finally {
      loading.value = false
    }
  }

  const findMatches = async (requestId: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      matches.value = await matchingRepository.findMatches(requestId)
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al buscar coincidencias'
      matches.value = []
    } finally {
      loading.value = false
    }
  }

  const acceptMatch = async (requestId: number, tripId: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await matchingRepository.acceptMatch(requestId, tripId)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al aceptar coincidencia'
      return false
    } finally {
      loading.value = false
    }
  }

  const searchTripsByLocation = async (request: LocationSearchRequest): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const result = await matchingRepository.searchTripsByLocation(request)
      locationTrips.value = result.trips
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al buscar viajes por ubicación'
      locationTrips.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    travelRequests,
    currentRequest,
    matches,
    locationTrips,
    loading,
    error,
    createTravelRequest,
    getMyTravelRequests,
    findMatches,
    acceptMatch,
    searchTripsByLocation
  }
}
