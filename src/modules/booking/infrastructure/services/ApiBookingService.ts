import apiClient from '@/shared/utils/axios'
import type { IBookingRepository } from '@/modules/booking/domain/repositories/IBookingRepository'
import type { Booking, BookingWithTrip, CreateBookingData } from '@/modules/booking/domain/models/Booking'
import { BookingMapper } from '../mappers/BookingMapper'
import type { BookingDTO, BookingWithTripDTO, BookTripRequestDTO } from '@/modules/booking/presentation/types/BookingDTO'

export class ApiBookingService implements IBookingRepository {
  private readonly basePath = '/trips'

  async create(data: CreateBookingData): Promise<Booking> {
    const requestData: BookTripRequestDTO = {
      seats_requested: data.seatsRequested || 1,
      passenger_notes: data.passengerNotes,
      pickup_location: data.pickupLocation,
      dropoff_location: data.dropoffLocation
    }

    const response = await apiClient.post<BookingDTO>(
      `${this.basePath}/${data.tripId}/book`,
      requestData
    )
    return BookingMapper.toDomain(response.data)
  }

  async getById(id: number): Promise<BookingWithTrip> {
    const response = await apiClient.get<BookingWithTripDTO>(`${this.basePath}/bookings/${id}`)
    return BookingMapper.toBookingWithTrip(response.data)
  }

  async getMyBookings(status?: string, skip = 0, limit = 100): Promise<BookingWithTrip[]> {
    const params = { status, skip, limit }
    const response = await apiClient.get<BookingWithTripDTO[]>(`${this.basePath}/bookings/my`, {
      params
    })
    return response.data.map(BookingMapper.toBookingWithTrip)
  }

  async getTripBookings(tripId: number, skip = 0, limit = 100): Promise<Booking[]> {
    const params = { skip, limit }
    const response = await apiClient.get<{ bookings: BookingDTO[] }>(
      `${this.basePath}/${tripId}/bookings`,
      { params }
    )
    return response.data.bookings.map(BookingMapper.toDomain)
  }

  async cancel(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/bookings/${id}`)
  }
}
