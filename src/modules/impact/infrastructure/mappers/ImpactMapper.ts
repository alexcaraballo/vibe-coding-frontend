import type { CO2Impact, UserCO2Stats } from '../../domain/models/CO2Impact'
import type { CO2ImpactResponseDTO, UserCO2StatsResponseDTO } from '../../presentation/types/ImpactDTO'

export class ImpactMapper {
  static co2ImpactToDomain(dto: CO2ImpactResponseDTO): CO2Impact {
    return {
      tripId: dto.trip_id,
      vehicleType: dto.vehicle_type,
      distanceKm: dto.distance_km,
      co2SavedPerPassengerKg: dto.co2_saved_per_passenger_kg,
      totalCo2SavedKg: dto.total_co2_saved_kg,
      passengersCount: dto.passengers_count,
      equivalences: {
        trees: dto.equivalences.trees,
        km: dto.equivalences.km
      }
    }
  }

  static userStatsToDomain(dto: UserCO2StatsResponseDTO): UserCO2Stats {
    return {
      userId: dto.user_id,
      totalCo2SavedKg: dto.total_co2_saved_kg,
      tripsAsDriver: dto.trips_as_driver,
      tripsAsPassenger: dto.trips_as_passenger,
      totalTrips: dto.total_trips,
      averageCo2PerTripKg: dto.average_co2_per_trip_kg,
      equivalenceTrees: dto.equivalence_trees,
      equivalenceKmNotDriven: dto.equivalence_km_not_driven,
      description: {
        trees: dto.description.trees,
        km: dto.description.km
      }
    }
  }
}
