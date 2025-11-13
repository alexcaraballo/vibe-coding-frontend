import axios from '@/shared/utils/axios'
import type { IImpactRepository } from '../../domain/repositories/IImpactRepository'
import type { CO2Impact, UserCO2Stats } from '../../domain/models/CO2Impact'
import type { CO2ImpactResponseDTO, UserCO2StatsResponseDTO } from '../../presentation/types/ImpactDTO'
import { ImpactMapper } from '../mappers/ImpactMapper'

export class ApiImpactService implements IImpactRepository {
  private readonly basePath = '/trips'

  async getTripCO2Impact(tripId: number): Promise<CO2Impact> {
    const response = await axios.get<CO2ImpactResponseDTO>(`${this.basePath}/${tripId}/co2-impact`)
    return ImpactMapper.co2ImpactToDomain(response.data)
  }

  async getMyCO2Stats(): Promise<UserCO2Stats> {
    const response = await axios.get<UserCO2StatsResponseDTO>(`${this.basePath}/users/me/co2-stats`)
    return ImpactMapper.userStatsToDomain(response.data)
  }
}
