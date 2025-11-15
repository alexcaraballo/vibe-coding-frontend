export interface CoordinatesDTO {
  latitude: number
  longitude: number
}

export interface LocationDTO {
  name: string
  coordinates: CoordinatesDTO
}

export interface RouteResponseDTO {
  origin: LocationDTO
  destination: LocationDTO
  distance_km?: number
  duration_minutes?: number
  polyline?: CoordinatesDTO[]
}

export interface GeocodeRequestDTO {
  address: string
}

export interface RouteRequestDTO {
  origin_address?: string
  destination_address?: string
  origin_lat?: number
  origin_lng?: number
  destination_lat?: number
  destination_lng?: number
}

export interface WaypointDTO {
  type: 'origin' | 'destination' | 'pickup' | 'dropoff'
  location: string
  lat: number
  lng: number
  booking_id?: number
  order: number
}

export interface RouteWithStopsResponseDTO {
  trip_id: number
  origin: string
  destination: string
  total_distance_km: number | null
  waypoints: WaypointDTO[]
}

export interface PublicBookingDTO {
  booking_id: number
  seats_booked: number
  pickup_location?: string | null
  dropoff_location?: string | null
  pickup_lat?: number | null
  pickup_lng?: number | null
  dropoff_lat?: number | null
  dropoff_lng?: number | null
  booking_date: string
}

export interface PublicBookingsViewDTO {
  trip: {
    id: number
    origin: string
    destination: string
    departure_date: string
    available_seats: number
    total_seats: number
  }
  total_bookings: number
  total_seats_booked: number
  bookings: PublicBookingDTO[]
}
