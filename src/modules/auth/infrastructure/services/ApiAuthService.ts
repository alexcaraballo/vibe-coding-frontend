import apiClient from '@/shared/utils/axios'
import type {
  IAuthRepository,
  AuthResponse,
  RegisterData,
  LoginData,
  UpdateProfileData
} from '@/modules/auth/domain/repositories/IAuthRepository'
import type { User } from '@/modules/auth/domain/models/User'
import { UserMapper } from '../mappers/UserMapper'
import type {
  TokenResponseDTO,
  RegisterRequestDTO,
  UpdateProfileRequestDTO,
  UserDTO
} from '@/modules/auth/presentation/types/AuthDTO'

/**
 * Implementación concreta para API REST
 */
export class ApiAuthService implements IAuthRepository {
  private readonly authPath = '/auth'

  async register(data: RegisterData): Promise<AuthResponse> {
    const requestData: RegisterRequestDTO = {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: data.role || 'passenger'
    }

    const response = await apiClient.post<TokenResponseDTO>(
      `${this.authPath}/register`,
      requestData
    )

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      user: UserMapper.toDomain(response.data.user)
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // API expects form-data for OAuth2
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)

    const response = await apiClient.post<TokenResponseDTO>(`${this.authPath}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      user: UserMapper.toDomain(response.data.user)
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserDTO>(`${this.authPath}/me`)
    return UserMapper.toDomain(response.data)
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const requestData: UpdateProfileRequestDTO = {
      name: data.name,
      phone: data.phone,
      vehicle_model: data.vehicleModel,
      vehicle_plate: data.vehiclePlate,
      license_number: data.licenseNumber
    }

    const response = await apiClient.put<UserDTO>('/users/me', requestData)
    return UserMapper.toDomain(response.data)
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<UserDTO>(`/users/${id}`)
    return UserMapper.toDomain(response.data)
  }

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }
}
