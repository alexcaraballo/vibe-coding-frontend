export interface CO2ImpactResponseDTO {
  trip_id: number
  vehicle_type: string
  distance_km: number | null
  co2_saved_per_passenger_kg: number | null
  total_co2_saved_kg: number | null
  passengers_count: number
  equivalences: {
    trees: string
    km: string
  }
}

export interface UserCO2StatsResponseDTO {
  user_id: number
  total_co2_saved_kg: number
  trips_as_driver: number
  trips_as_passenger: number
  total_trips: number
  average_co2_per_trip_kg: number
  equivalence_trees: number
  equivalence_km_not_driven: number
  description: {
    trees: string
    km: string
  }
}
