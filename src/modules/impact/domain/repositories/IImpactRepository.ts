import type { CO2Impact, UserCO2Stats } from '../models/CO2Impact'

export interface IImpactRepository {
  getTripCO2Impact(tripId: number): Promise<CO2Impact>
  getMyCO2Stats(): Promise<UserCO2Stats>
}
