/**
 * DTOs de la API - Formato del backend
 */

export interface UserDTO {
  id: number
  email: string
  name: string
  phone: string | null
  role: 'driver' | 'passenger' | 'both'
  is_active: boolean
  is_verified: boolean
  created_at: string
  vehicle_model?: string | null
  vehicle_plate?: string | null
  license_number?: string | null
}

export interface TokenResponseDTO {
  access_token: string
  token_type: string
  user: UserDTO
}

export interface RegisterRequestDTO {
  email: string
  password: string
  name: string
  phone: string
  role?: 'driver' | 'passenger' | 'both'
}

export interface UpdateProfileRequestDTO {
  name?: string
  phone?: string
  vehicle_model?: string
  vehicle_plate?: string
  license_number?: string
}
