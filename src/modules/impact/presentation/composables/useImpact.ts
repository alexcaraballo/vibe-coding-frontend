import { ref } from 'vue'
import type { Ref } from 'vue'
import ImpactContainer from '../../infrastructure/di/container'
import type { CO2Impact, UserCO2Stats } from '../../domain/models/CO2Impact'

export function useImpact() {
  const impactRepository = ImpactContainer.getInstance().getImpactRepository()

  const tripImpact: Ref<CO2Impact | null> = ref(null)
  const userStats: Ref<UserCO2Stats | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const getTripCO2Impact = async (tripId: number): Promise<CO2Impact | null> => {
    loading.value = true
    error.value = null
    try {
      const impact = await impactRepository.getTripCO2Impact(tripId)
      tripImpact.value = impact
      return impact
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener el impacto de CO₂'
      return null
    } finally {
      loading.value = false
    }
  }

  const getMyCO2Stats = async (): Promise<UserCO2Stats | null> => {
    loading.value = true
    error.value = null
    try {
      const stats = await impactRepository.getMyCO2Stats()
      userStats.value = stats
      return stats
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al obtener las estadísticas de CO₂'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    tripImpact,
    userStats,
    loading,
    error,
    getTripCO2Impact,
    getMyCO2Stats
  }
}
