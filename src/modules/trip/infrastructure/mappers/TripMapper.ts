import type { Trip, TripStatus, VehicleType } from '@/modules/trip/domain/models/Trip'
import type { TripDTO } from '@/modules/trip/presentation/types/TripDTO'

export class TripMapper {
  static toDomain(dto: TripDTO): Trip {
    return {
      id: dto.id,
      origin: dto.origin,
      destination: dto.destination,
      departureDate: new Date(dto.departure_date),
      departureTime: dto.departure_time,
      estimatedArrivalTime: dto.estimated_arrival_time,
      availableSeats: dto.available_seats,
      totalSeats: dto.total_seats,
      driverId: dto.driver_id,
      status: dto.status as TripStatus,
      originLat: dto.origin_lat,
      originLng: dto.origin_lng,
      destinationLat: dto.destination_lat,
      destinationLng: dto.destination_lng,
      maxDetourMinutes: dto.max_detour_minutes,
      currentDetourMinutes: dto.current_detour_minutes,
      pricePerSeat: dto.price_per_seat,
      description: dto.description,
      vehicleType: dto.vehicle_type as VehicleType,
      distanceKm: dto.distance_km,
      co2SavedPerPassengerKg: dto.co2_saved_per_passenger_kg,
      totalCo2SavedKg: dto.total_co2_saved_kg,
      createdAt: new Date(dto.created_at),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined
    }
  }
}
