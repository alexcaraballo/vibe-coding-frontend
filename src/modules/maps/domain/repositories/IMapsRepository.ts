import type { Coordinates, Route, RouteRequest, GeocodeRequest, RouteWithStops, PublicBookingsView } from '../models/Route'

export interface IMapsRepository {
  geocodeAddress(request: GeocodeRequest): Promise<Coordinates>
  calculateRoute(request: RouteRequest): Promise<Route>
  getTripRoute(tripId: number): Promise<Route>
  getTripRouteWithStops(tripId: number): Promise<RouteWithStops>
  getPublicBookings(tripId: number): Promise<PublicBookingsView>
}
