export interface TripDTO {
  id: number
  origin: string
  destination: string
  departure_date: string
  departure_time: string
  estimated_arrival_time?: string | null
  available_seats: number
  total_seats: number
  driver_id: number
  status: string
  origin_lat?: number | null
  origin_lng?: number | null
  destination_lat?: number | null
  destination_lng?: number | null
  max_detour_minutes: number
  current_detour_minutes: number
  price_per_seat?: number | null
  description?: string | null
  vehicle_type: string
  distance_km?: number | null
  co2_saved_per_passenger_kg?: number | null
  total_co2_saved_kg?: number | null
  created_at: string
  updated_at?: string | null
}

export interface TripListResponseDTO {
  trips: TripDTO[]
  total: number
  skip: number
  limit: number
}

export interface CreateTripRequestDTO {
  origin: string
  destination: string
  departure_date: string
  departure_time: string
  available_seats: number
  price_per_seat?: number
  description?: string
  max_detour_minutes?: number
  estimated_arrival_time?: string
  vehicle_type?: string
  origin_lat?: number
  origin_lng?: number
  destination_lat?: number
  destination_lng?: number
}

export interface UpdateTripRequestDTO {
  available_seats?: number
  price_per_seat?: number
  description?: string
  status?: string
  max_detour_minutes?: number
}
