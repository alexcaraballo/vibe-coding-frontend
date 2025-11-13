import type { Trip, CreateTripData, UpdateTripData, TripSearchFilters } from '../models/Trip'

export interface TripListResponse {
  trips: Trip[]
  total: number
  skip: number
  limit: number
}

/**
 * Contrato del repositorio de viajes
 */
export interface ITripRepository {
  create(data: CreateTripData): Promise<Trip>
  getById(id: number): Promise<Trip>
  getAll(skip?: number, limit?: number, status?: string): Promise<TripListResponse>
  search(filters: TripSearchFilters): Promise<TripListResponse>
  update(id: number, data: UpdateTripData): Promise<Trip>
  delete(id: number): Promise<void>
  getByDriver(driverId: number, skip?: number, limit?: number): Promise<TripListResponse>
}
