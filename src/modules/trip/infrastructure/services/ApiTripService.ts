import apiClient from '@/shared/utils/axios'
import type { ITripRepository, TripListResponse } from '@/modules/trip/domain/repositories/ITripRepository'
import type { Trip, CreateTripData, UpdateTripData, TripSearchFilters } from '@/modules/trip/domain/models/Trip'
import { TripMapper } from '../mappers/TripMapper'
import type { TripDTO, TripListResponseDTO, CreateTripRequestDTO, UpdateTripRequestDTO } from '@/modules/trip/presentation/types/TripDTO'

export class ApiTripService implements ITripRepository {
  private readonly basePath = '/trips'

  async create(data: CreateTripData): Promise<Trip> {
    const requestData: CreateTripRequestDTO = {
      origin: data.origin,
      destination: data.destination,
      departure_date: data.departureDate,
      departure_time: data.departureTime,
      available_seats: data.availableSeats,
      price_per_seat: data.pricePerSeat,
      description: data.description,
      max_detour_minutes: data.maxDetourMinutes,
      estimated_arrival_time: data.estimatedArrivalTime,
      vehicle_type: data.vehicleType,
      origin_lat: data.originLat,
      origin_lng: data.originLng,
      destination_lat: data.destinationLat,
      destination_lng: data.destinationLng
    }

    const response = await apiClient.post<TripDTO>(`${this.basePath}/`, requestData)
    return TripMapper.toDomain(response.data)
  }

  async getById(id: number): Promise<Trip> {
    const response = await apiClient.get<TripDTO>(`${this.basePath}/${id}`)
    return TripMapper.toDomain(response.data)
  }

  async getAll(skip = 0, limit = 100, status?: string): Promise<TripListResponse> {
    const params = { skip, limit, ...(status && { status }) }
    const response = await apiClient.get<TripListResponseDTO>(`${this.basePath}/`, { params })

    return {
      trips: response.data.trips.map(TripMapper.toDomain),
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit
    }
  }

  async search(filters: TripSearchFilters): Promise<TripListResponse> {
    const params = {
      origin: filters.origin,
      destination: filters.destination,
      date_from: filters.dateFrom,
      skip: filters.skip || 0,
      limit: filters.limit || 100
    }

    const response = await apiClient.get<TripListResponseDTO>(`${this.basePath}/search`, { params })

    return {
      trips: response.data.trips.map(TripMapper.toDomain),
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit
    }
  }

  async update(id: number, data: UpdateTripData): Promise<Trip> {
    const requestData: UpdateTripRequestDTO = {
      available_seats: data.availableSeats,
      price_per_seat: data.pricePerSeat,
      description: data.description,
      status: data.status,
      max_detour_minutes: data.maxDetourMinutes
    }

    const response = await apiClient.put<TripDTO>(`${this.basePath}/${id}`, requestData)
    return TripMapper.toDomain(response.data)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  async getByDriver(driverId: number, skip = 0, limit = 100): Promise<TripListResponse> {
    const params = { skip, limit }
    const response = await apiClient.get<TripListResponseDTO>(`${this.basePath}/driver/${driverId}`, { params })

    return {
      trips: response.data.trips.map(TripMapper.toDomain),
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit
    }
  }
}
