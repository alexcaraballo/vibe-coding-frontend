import type { Trip } from '@/modules/trip/domain/models/Trip'
import type { User } from '@/modules/auth/domain/models/User'

export interface Booking {
  id: number
  tripId: number
  passengerId: number
  seatsBooked: number
  status: BookingStatus
  pickupLocation?: string | null
  dropoffLocation?: string | null
  pickupLat?: number | null
  pickupLng?: number | null
  dropoffLat?: number | null
  dropoffLng?: number | null
  passengerNotes?: string | null
  bookingDate: Date
  cancellationDate?: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed'

export interface BookingWithTrip {
  booking: Booking
  trip: Trip
  driver?: User | null
}

export interface CreateBookingData {
  tripId: number
  seatsRequested?: number
  passengerNotes?: string
  pickupLocation?: string
  dropoffLocation?: string
  pickupLat?: number
  pickupLng?: number
  dropoffLat?: number
  dropoffLng?: number
}

export class BookingValidator {
  static readonly MIN_SEATS = 1
  static readonly MAX_SEATS = 10

  static isValidSeats(seats: number): boolean {
    return seats >= this.MIN_SEATS && seats <= this.MAX_SEATS
  }

  static isConfirmed(booking: Booking): boolean {
    return booking.status === 'confirmed' && booking.isActive
  }
}
