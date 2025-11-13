import axios from '@/shared/utils/axios'
import type { IMapsRepository } from '../../domain/repositories/IMapsRepository'
import type { Coordinates, Route, RouteRequest, GeocodeRequest, RouteWithStops } from '../../domain/models/Route'
import type { CoordinatesDTO, RouteResponseDTO, GeocodeRequestDTO, RouteRequestDTO, RouteWithStopsResponseDTO } from '../../presentation/types/MapsDTO'
import { MapsMapper } from '../mappers/MapsMapper'

export class ApiMapsService implements IMapsRepository {
  private readonly baseUrl = '/maps/v1'
  private readonly tripsPath = '/trips'

  async geocodeAddress(request: GeocodeRequest): Promise<Coordinates> {
    const dto: GeocodeRequestDTO = {
      address: request.address
    }
    const response = await axios.post<CoordinatesDTO>(`${this.baseUrl}/geocode`, dto)
    return MapsMapper.coordinatesToDomain(response.data)
  }

  async calculateRoute(request: RouteRequest): Promise<Route> {
    const dto: RouteRequestDTO = {
      origin_address: request.originAddress,
      destination_address: request.destinationAddress,
      origin_lat: request.originLat,
      origin_lng: request.originLng,
      destination_lat: request.destinationLat,
      destination_lng: request.destinationLng
    }
    const response = await axios.post<RouteResponseDTO>(`${this.baseUrl}/route`, dto)
    return MapsMapper.routeToDomain(response.data)
  }

  async getTripRoute(tripId: number): Promise<Route> {
    const response = await axios.get<RouteResponseDTO>(`${this.baseUrl}/trip/${tripId}/route`)
    return MapsMapper.routeToDomain(response.data)
  }

  async getTripRouteWithStops(tripId: number): Promise<RouteWithStops> {
    const response = await axios.get<RouteWithStopsResponseDTO>(`${this.tripsPath}/${tripId}/route-with-stops`)
    return MapsMapper.routeWithStopsToDomain(response.data)
  }
}
