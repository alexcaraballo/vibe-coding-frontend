export interface CO2Impact {
  tripId: number
  vehicleType: string
  distanceKm: number | null
  co2SavedPerPassengerKg: number | null
  totalCo2SavedKg: number | null
  passengersCount: number
  equivalences: CO2Equivalences
}

export interface CO2Equivalences {
  trees: string
  km: string
}

export interface UserCO2Stats {
  userId: number
  totalCo2SavedKg: number
  tripsAsDriver: number
  tripsAsPassenger: number
  totalTrips: number
  averageCo2PerTripKg: number
  equivalenceTrees: number
  equivalenceKmNotDriven: number
  description: CO2Equivalences
}
