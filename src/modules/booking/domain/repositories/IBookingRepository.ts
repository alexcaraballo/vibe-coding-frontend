import type { Booking, BookingWithTrip, CreateBookingData } from '../models/Booking'

export interface IBookingRepository {
  create(data: CreateBookingData): Promise<Booking>
  getById(id: number): Promise<BookingWithTrip>
  getMyBookings(status?: string, skip?: number, limit?: number): Promise<BookingWithTrip[]>
  getTripBookings(tripId: number, skip?: number, limit?: number): Promise<Booking[]>
  cancel(id: number): Promise<void>
}
