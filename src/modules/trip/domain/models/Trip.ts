/**
 * Tipos de vehículo para cálculo de emisiones CO₂
 */
export type VehicleType = 'gasoline' | 'diesel' | 'hybrid' | 'electric'

/**
 * Entidad del dominio - Viaje/Trayecto
 */
export interface Trip {
  id: number
  origin: string
  destination: string
  departureDate: Date
  departureTime: string
  estimatedArrivalTime?: string | null
  availableSeats: number
  totalSeats: number
  driverId: number
  status: TripStatus
  originLat?: number | null
  originLng?: number | null
  destinationLat?: number | null
  destinationLng?: number | null
  maxDetourMinutes: number
  currentDetourMinutes: number
  pricePerSeat?: number | null
  description?: string | null
  vehicleType: VehicleType
  distanceKm?: number | null
  co2SavedPerPassengerKg?: number | null
  totalCo2SavedKg?: number | null
  createdAt: Date
  updatedAt?: Date | null
}

/**
 * Estados posibles de un viaje
 */
export type TripStatus = 'active' | 'completed' | 'cancelled'

/**
 * Datos para crear un viaje
 */
export interface CreateTripData {
  origin: string
  destination: string
  departureDate: string // YYYY-MM-DD
  departureTime: string // HH:MM:SS
  availableSeats: number
  pricePerSeat?: number
  description?: string
  maxDetourMinutes?: number
  estimatedArrivalTime?: string
  vehicleType?: VehicleType
  originLat?: number
  originLng?: number
  destinationLat?: number
  destinationLng?: number
}

/**
 * Datos para actualizar un viaje
 */
export interface UpdateTripData {
  availableSeats?: number
  pricePerSeat?: number
  description?: string
  status?: TripStatus
  maxDetourMinutes?: number
}

/**
 * Filtros para búsqueda de viajes
 */
export interface TripSearchFilters {
  origin?: string
  destination?: string
  dateFrom?: string // YYYY-MM-DD
  skip?: number
  limit?: number
}

/**
 * Validaciones y reglas de negocio
 */
export class TripValidator {
  static readonly MIN_SEATS = 1
  static readonly MAX_SEATS = 10
  static readonly MIN_PRICE = 0
  static readonly MAX_DETOUR_MINUTES = 120

  static isValidSeats(seats: number): boolean {
    return seats >= this.MIN_SEATS && seats <= this.MAX_SEATS
  }

  static isValidPrice(price: number): boolean {
    return price >= this.MIN_PRICE && Number.isFinite(price)
  }

  static isValidDetour(minutes: number): boolean {
    return minutes >= 0 && minutes <= this.MAX_DETOUR_MINUTES
  }

  static isActive(trip: Trip): boolean {
    return trip.status === 'active' && trip.availableSeats > 0
  }

  static canBeBooked(trip: Trip, seatsRequested: number): boolean {
    return this.isActive(trip) && trip.availableSeats >= seatsRequested
  }

  static isFutureTrip(trip: Trip): boolean {
    const now = new Date()
    const tripDate = new Date(trip.departureDate)
    return tripDate >= now
  }
}
