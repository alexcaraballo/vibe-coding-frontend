import type { IAuthRepository } from '@/modules/auth/domain/repositories/IAuthRepository'
import { ApiAuthService } from '../services/ApiAuthService'

/**
 * Contenedor de inyección de dependencias para Auth
 */
export class AuthServiceContainer {
  private static authRepository: IAuthRepository | null = null

  static getAuthRepository(): IAuthRepository {
    if (!this.authRepository) {
      this.authRepository = new ApiAuthService()
    }
    return this.authRepository
  }

  // Para testing: permite reemplazar con mocks
  static setAuthRepository(repository: IAuthRepository): void {
    this.authRepository = repository
  }

  // Resetea el contenedor (útil para tests)
  static reset(): void {
    this.authRepository = null
  }
}
