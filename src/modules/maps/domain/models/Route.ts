export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  name: string
  coordinates: Coordinates
}

export interface Route {
  origin: Location
  destination: Location
  distanceKm?: number
  durationMinutes?: number
  polyline?: Coordinates[]
}

export interface GeocodeRequest {
  address: string
}

export interface RouteRequest {
  originAddress?: string
  destinationAddress?: string
  originLat?: number
  originLng?: number
  destinationLat?: number
  destinationLng?: number
}

export interface Waypoint {
  type: 'origin' | 'destination' | 'pickup' | 'dropoff'
  location: string
  lat: number
  lng: number
  bookingId?: number
  order: number
}

export interface RouteWithStops {
  tripId: number
  origin: string
  destination: string
  totalDistanceKm: number | null
  waypoints: Waypoint[]
}

export interface PublicBooking {
  bookingId: number
  seatsBooked: number
  pickupLocation?: string | null
  dropoffLocation?: string | null
  pickupLat?: number | null
  pickupLng?: number | null
  dropoffLat?: number | null
  dropoffLng?: number | null
  bookingDate: Date
}

export interface PublicBookingsView {
  trip: {
    id: number
    origin: string
    destination: string
    departureDate: Date
    availableSeats: number
    totalSeats: number
  }
  totalBookings: number
  totalSeatsBooked: number
  bookings: PublicBooking[]
}
