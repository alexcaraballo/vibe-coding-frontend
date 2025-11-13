import type { Coordinates, Location, Route, Waypoint, RouteWithStops } from '../../domain/models/Route'
import type { CoordinatesDTO, LocationDTO, RouteResponseDTO, WaypointDTO, RouteWithStopsResponseDTO } from '../../presentation/types/MapsDTO'

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
}
