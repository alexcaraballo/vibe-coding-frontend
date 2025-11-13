import type { TripDTO } from '@/modules/trip/presentation/types/TripDTO'
import type { UserDTO } from '@/modules/auth/presentation/types/AuthDTO'

export interface BookingDTO {
  id: number
  trip_id: number
  passenger_id: number
  seats_booked: number
  status: string
  pickup_location?: string | null
  dropoff_location?: string | null
  pickup_lat?: number | null
  pickup_lng?: number | null
  dropoff_lat?: number | null
  dropoff_lng?: number | null
  passenger_notes?: string | null
  booking_date: string
  cancellation_date?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

export interface BookingWithTripDTO {
  booking: BookingDTO
  trip: TripDTO
  driver?: UserDTO | null
}

export interface BookTripRequestDTO {
  seats_requested?: number
  passenger_notes?: string
  pickup_location?: string
  dropoff_location?: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_lat?: number
  dropoff_lng?: number
}
