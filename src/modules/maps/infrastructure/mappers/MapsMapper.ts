import type { Coordinates, Location, Route, Waypoint, RouteWithStops, PublicBookingsView, PublicBooking } from '../../domain/models/Route'
import type { CoordinatesDTO, LocationDTO, RouteResponseDTO, WaypointDTO, RouteWithStopsResponseDTO, PublicBookingsViewDTO, PublicBookingDTO } from '../../presentation/types/MapsDTO'

export class MapsMapper {
  static coordinatesToDomain(dto: CoordinatesDTO): Coordinates {
    return {
      latitude: dto.latitude,
      longitude: dto.longitude
    }
  }

  static locationToDomain(dto: LocationDTO): Location {
    return {
      name: dto.name,
      coordinates: this.coordinatesToDomain(dto.coordinates)
    }
  }

  static routeToDomain(dto: RouteResponseDTO): Route {
    return {
      origin: this.locationToDomain(dto.origin),
      destination: this.locationToDomain(dto.destination),
      distanceKm: dto.distance_km,
      durationMinutes: dto.duration_minutes,
      polyline: dto.polyline?.map(this.coordinatesToDomain)
    }
  }

  static waypointToDomain(dto: WaypointDTO): Waypoint {
    return {
      type: dto.type,
      location: dto.location,
      lat: dto.lat,
      lng: dto.lng,
      bookingId: dto.booking_id,
      order: dto.order
    }
  }

  static routeWithStopsToDomain(dto: RouteWithStopsResponseDTO): RouteWithStops {
    return {
      tripId: dto.trip_id,
      origin: dto.origin,
      destination: dto.destination,
      totalDistanceKm: dto.total_distance_km,
      waypoints: dto.waypoints.map(this.waypointToDomain)
    }
  }

  static publicBookingToDomain(dto: PublicBookingDTO): PublicBooking {
    return {
      bookingId: dto.booking_id,
      seatsBooked: dto.seats_booked,
      pickupLocation: dto.pickup_location,
      dropoffLocation: dto.dropoff_location,
      pickupLat: dto.pickup_lat,
      pickupLng: dto.pickup_lng,
      dropoffLat: dto.dropoff_lat,
      dropoffLng: dto.dropoff_lng,
      bookingDate: new Date(dto.booking_date)
    }
  }

  static publicBookingsViewToDomain(dto: PublicBookingsViewDTO): PublicBookingsView {
    return {
      trip: {
        id: dto.trip.id,
        origin: dto.trip.origin,
        destination: dto.trip.destination,
        departureDate: new Date(dto.trip.departure_date),
        availableSeats: dto.trip.available_seats,
        totalSeats: dto.trip.total_seats
      },
      totalBookings: dto.total_bookings,
      totalSeatsBooked: dto.total_seats_booked,
      bookings: dto.bookings.map(this.publicBookingToDomain)
    }
  }
}
