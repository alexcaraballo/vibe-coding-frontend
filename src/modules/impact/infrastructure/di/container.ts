import type { IImpactRepository } from '../../domain/repositories/IImpactRepository'
import { ApiImpactService } from '../services/ApiImpactService'

class ImpactContainer {
  private static instance: ImpactContainer
  private impactRepository: IImpactRepository

  private constructor() {
    this.impactRepository = new ApiImpactService()
  }

  static getInstance(): ImpactContainer {
    if (!ImpactContainer.instance) {
      ImpactContainer.instance = new ImpactContainer()
    }
    return ImpactContainer.instance
  }

  getImpactRepository(): IImpactRepository {
    return this.impactRepository
  }
}

export default ImpactContainer
