import type { TravelRequest, MatchResult, MatchScore, WaypointInsertion } from '../../domain/models/TravelRequest'
import type { TravelRequestDTO, MatchResultDTO, MatchScoreDTO, WaypointInsertionDTO } from '../../presentation/types/MatchingDTO'

export class MatchingMapper {
  static toDomain(dto: TravelRequestDTO): TravelRequest {
    return {
      id: dto.id,
      passengerId: dto.passenger_id,
      originLat: dto.origin_lat,
      originLng: dto.origin_lng,
      destinationLat: dto.destination_lat,
      destinationLng: dto.destination_lng,
      originAddress: dto.origin_address,
      destinationAddress: dto.destination_address,
      travelDate: new Date(dto.travel_date),
      timeFrom: dto.time_from,
      timeTo: dto.time_to,
      seatsRequested: dto.seats_requested,
      passengerNotes: dto.passenger_notes,
      status: dto.status,
      matchedTripId: dto.matched_trip_id,
      createdAt: new Date(dto.created_at),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined
    }
  }

  static matchResultToDomain(dto: MatchResultDTO): MatchResult {
    return {
      tripId: dto.trip_id,
      isCompatible: dto.is_compatible,
      reason: dto.reason,
      tripOrigin: dto.trip_origin,
      tripDestination: dto.trip_destination,
      departureTime: dto.departure_time,
      availableSeats: dto.available_seats,
      currentDetourMinutes: dto.current_detour_minutes,
      maxDetourMinutes: dto.max_detour_minutes,
      additionalDetourMinutes: dto.additional_detour_minutes,
      projectedTotalDetour: dto.projected_total_detour,
      proposedInsertion: dto.proposed_insertion ? this.waypointInsertionToDomain(dto.proposed_insertion) : undefined,
      matchScore: dto.match_score ? this.matchScoreToDomain(dto.match_score) : undefined,
      driverId: dto.driver_id
    }
  }

  static matchScoreToDomain(dto: MatchScoreDTO): MatchScore {
    return {
      tripId: dto.trip_id,
      score: dto.score,
      detourAdditional: dto.detour_additional,
      proximityScore: dto.proximity_score,
      timeCompatibilityScore: dto.time_compatibility_score
    }
  }

  static waypointInsertionToDomain(dto: WaypointInsertionDTO): WaypointInsertion {
    return {
      pickupIndex: dto.pickup_index,
      dropoffIndex: dto.dropoff_index,
      pickupLocation: dto.pickup_location,
      dropoffLocation: dto.dropoff_location,
      additionalDetourMinutes: dto.additional_detour_minutes
    }
  }
}
