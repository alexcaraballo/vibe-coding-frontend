import type { IMapsRepository } from '../../domain/repositories/IMapsRepository'
import { ApiMapsService } from '../services/ApiMapsService'

class MapsContainer {
  private static instance: MapsContainer
  private mapsRepository: IMapsRepository

  private constructor() {
    this.mapsRepository = new ApiMapsService()
  }

  static getInstance(): MapsContainer {
    if (!MapsContainer.instance) {
      MapsContainer.instance = new MapsContainer()
    }
    return MapsContainer.instance
  }

  getMapsRepository(): IMapsRepository {
    return this.mapsRepository
  }
}

export default MapsContainer
