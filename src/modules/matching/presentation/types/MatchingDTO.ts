export interface TravelRequestDTO {
  id: number
  passenger_id: number
  origin_lat: number
  origin_lng: number
  destination_lat: number
  destination_lng: number
  origin_address: string
  destination_address: string
  travel_date: string
  time_from?: string
  time_to?: string
  seats_requested: number
  passenger_notes?: string
  status: string
  matched_trip_id?: number
  created_at: string
  updated_at?: string
}

export interface CreateTravelRequestDTO {
  origin_address: string
  destination_address: string
  origin_lat?: number
  origin_lng?: number
  destination_lat?: number
  destination_lng?: number
  travel_date: string
  time_from?: string
  time_to?: string
  seats_requested?: number
  passenger_notes?: string
}

export interface MatchResultDTO {
  trip_id: number
  is_compatible: boolean
  reason?: string
  trip_origin: string
  trip_destination: string
  departure_time: string
  available_seats: number
  current_detour_minutes: number
  max_detour_minutes: number
  additional_detour_minutes?: number
  projected_total_detour?: number
  proposed_insertion?: WaypointInsertionDTO
  match_score?: MatchScoreDTO
  driver_id: number
}

export interface WaypointInsertionDTO {
  pickup_index: number
  dropoff_index: number
  pickup_location: any
  dropoff_location: any
  additional_detour_minutes: number
}

export interface MatchScoreDTO {
  trip_id: number
  score: number
  detour_additional: number
  proximity_score: number
  time_compatibility_score: number
}

export interface MatchListResponseDTO {
  travel_request_id: number
  matches: MatchResultDTO[]
  total_matches: number
}

export interface AcceptMatchDTO {
  trip_id: number
}
