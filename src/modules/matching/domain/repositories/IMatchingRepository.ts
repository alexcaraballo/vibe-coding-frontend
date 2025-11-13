import type { TravelRequest, CreateTravelRequestData, MatchResult } from '../models/TravelRequest'
import type { LocationSearchRequest, LocationSearchResult } from '../models/LocationSearch'

export interface IMatchingRepository {
  createTravelRequest(data: CreateTravelRequestData): Promise<TravelRequest>
  getMyTravelRequests(skip?: number, limit?: number): Promise<TravelRequest[]>
  findMatches(requestId: number): Promise<MatchResult[]>
  acceptMatch(requestId: number, tripId: number): Promise<void>
  searchTripsByLocation(request: LocationSearchRequest): Promise<LocationSearchResult>
}
