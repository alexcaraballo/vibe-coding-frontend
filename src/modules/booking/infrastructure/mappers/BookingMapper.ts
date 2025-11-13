import type { Booking, BookingWithTrip, BookingStatus } from '@/modules/booking/domain/models/Booking'
import type { BookingDTO, BookingWithTripDTO } from '@/modules/booking/presentation/types/BookingDTO'
import { TripMapper } from '@/modules/trip/infrastructure/mappers/TripMapper'
import { UserMapper } from '@/modules/auth/infrastructure/mappers/UserMapper'

export class BookingMapper {
  static toDomain(dto: BookingDTO): Booking {
    return {
      id: dto.id,
      tripId: dto.trip_id,
      passengerId: dto.passenger_id,
      seatsBooked: dto.seats_booked,
      status: dto.status as BookingStatus,
      pickupLocation: dto.pickup_location,
      dropoffLocation: dto.dropoff_location,
      pickupLat: dto.pickup_lat,
      pickupLng: dto.pickup_lng,
      dropoffLat: dto.dropoff_lat,
      dropoffLng: dto.dropoff_lng,
      passengerNotes: dto.passenger_notes,
      bookingDate: new Date(dto.booking_date),
      cancellationDate: dto.cancellation_date ? new Date(dto.cancellation_date) : undefined,
      isActive: dto.is_active,
      createdAt: new Date(dto.created_at),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined
    }
  }

  static toBookingWithTrip(dto: BookingWithTripDTO): BookingWithTrip {
    return {
      booking: BookingMapper.toDomain(dto.booking),
      trip: TripMapper.toDomain(dto.trip),
      driver: dto.driver ? UserMapper.toDomain(dto.driver) : undefined
    }
  }
}
