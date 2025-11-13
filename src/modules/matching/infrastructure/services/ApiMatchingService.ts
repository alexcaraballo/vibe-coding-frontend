import axios from '@/shared/utils/axios'
import type { IMatchingRepository } from '../../domain/repositories/IMatchingRepository'
import type { TravelRequest, CreateTravelRequestData, MatchResult } from '../../domain/models/TravelRequest'
import type { LocationSearchRequest, LocationSearchResult } from '../../domain/models/LocationSearch'
import type { TravelRequestDTO, CreateTravelRequestDTO, MatchListResponseDTO, AcceptMatchDTO } from '../../presentation/types/MatchingDTO'
import { MatchingMapper } from '../mappers/MatchingMapper'

export class ApiMatchingService implements IMatchingRepository {
  private readonly baseUrl = '/matching/v1'

  async createTravelRequest(data: CreateTravelRequestData): Promise<TravelRequest> {
    const dto: CreateTravelRequestDTO = {
      origin_address: data.originAddress,
      destination_address: data.destinationAddress,
      origin_lat: data.originLat,
      origin_lng: data.originLng,
      destination_lat: data.destinationLat,
      destination_lng: data.destinationLng,
      travel_date: data.travelDate,
      time_from: data.timeFrom,
      time_to: data.timeTo,
      seats_requested: data.seatsRequested,
      passenger_notes: data.passengerNotes
    }

    const response = await axios.post<TravelRequestDTO>(`${this.baseUrl}/travel-requests`, dto)
    return MatchingMapper.toDomain(response.data)
  }

  async getMyTravelRequests(skip: number = 0, limit: number = 100): Promise<TravelRequest[]> {
    const response = await axios.get<TravelRequestDTO[]>(`${this.baseUrl}/my-travel-requests`, {
      params: { skip, limit }
    })
    return response.data.map(MatchingMapper.toDomain)
  }

  async findMatches(requestId: number): Promise<MatchResult[]> {
    const response = await axios.get<MatchListResponseDTO>(`${this.baseUrl}/travel-requests/${requestId}/matches`)
    return response.data.matches.map(MatchingMapper.matchResultToDomain)
  }

  async acceptMatch(requestId: number, tripId: number): Promise<void> {
    const dto: AcceptMatchDTO = { trip_id: tripId }
    await axios.post(`${this.baseUrl}/travel-requests/${requestId}/accept`, dto)
  }

  async searchTripsByLocation(request: LocationSearchRequest): Promise<LocationSearchResult> {
    const response = await axios.get(`${this.baseUrl}/search-by-location`, {
      params: {
        lat: request.lat,
        lng: request.lng,
        radius_km: request.radiusKm || 20
      }
    })
    return {
      trips: response.data,
      totalResults: response.data.length
    }
  }
}
