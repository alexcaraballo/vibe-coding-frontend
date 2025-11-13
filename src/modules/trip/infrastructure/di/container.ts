import type { ITripRepository } from '@/modules/trip/domain/repositories/ITripRepository'
import { ApiTripService } from '../services/ApiTripService'

export class TripServiceContainer {
  private static tripRepository: ITripRepository | null = null

  static getTripRepository(): ITripRepository {
    if (!this.tripRepository) {
      this.tripRepository = new ApiTripService()
    }
    return this.tripRepository
  }

  static setTripRepository(repository: ITripRepository): void {
    this.tripRepository = repository
  }

  static reset(): void {
    this.tripRepository = null
  }
}
