export interface TravelRequest {
  id: number
  passengerId: number
  originLat: number
  originLng: number
  destinationLat: number
  destinationLng: number
  originAddress: string
  destinationAddress: string
  travelDate: Date
  timeFrom?: string
  timeTo?: string
  seatsRequested: number
  passengerNotes?: string
  status: string
  matchedTripId?: number
  createdAt: Date
  updatedAt?: Date
}

export interface CreateTravelRequestData {
  originAddress: string
  destinationAddress: string
  originLat?: number
  originLng?: number
  destinationLat?: number
  destinationLng?: number
  travelDate: string
  timeFrom?: string
  timeTo?: string
  seatsRequested?: number
  passengerNotes?: string
}

export interface MatchResult {
  tripId: number
  isCompatible: boolean
  reason?: string
  tripOrigin: string
  tripDestination: string
  departureTime: string
  availableSeats: number
  currentDetourMinutes: number
  maxDetourMinutes: number
  additionalDetourMinutes?: number
  projectedTotalDetour?: number
  proposedInsertion?: WaypointInsertion
  matchScore?: MatchScore
  driverId: number
}

export interface WaypointInsertion {
  pickupIndex: number
  dropoffIndex: number
  pickupLocation: any
  dropoffLocation: any
  additionalDetourMinutes: number
}

export interface MatchScore {
  tripId: number
  score: number
  detourAdditional: number
  proximityScore: number
  timeCompatibilityScore: number
}
