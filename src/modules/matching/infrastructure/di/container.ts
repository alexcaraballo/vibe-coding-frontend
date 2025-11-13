import type { IMatchingRepository } from '../../domain/repositories/IMatchingRepository'
import { ApiMatchingService } from '../services/ApiMatchingService'

class MatchingContainer {
  private static instance: MatchingContainer
  private matchingRepository: IMatchingRepository

  private constructor() {
    this.matchingRepository = new ApiMatchingService()
  }

  static getInstance(): MatchingContainer {
    if (!MatchingContainer.instance) {
      MatchingContainer.instance = new MatchingContainer()
    }
    return MatchingContainer.instance
  }

  getMatchingRepository(): IMatchingRepository {
    return this.matchingRepository
  }
}

export default MatchingContainer
