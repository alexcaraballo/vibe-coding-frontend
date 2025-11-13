import type { User } from '../models/User'

/**
 * Interface de autenticación - Define el contrato
 */
export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}

/**
 * Datos para registro de usuario
 */
export interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  role?: 'driver' | 'passenger' | 'both'
}

/**
 * Datos para login de usuario
 */
export interface LoginData {
  username: string // email
  password: string
}

/**
 * Datos para actualizar perfil
 */
export interface UpdateProfileData {
  name?: string
  phone?: string
  vehicleModel?: string
  vehiclePlate?: string
  licenseNumber?: string
}

/**
 * Contrato del repositorio de autenticación - Define QUÉ se puede hacer
 */
export interface IAuthRepository {
  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterData): Promise<AuthResponse>

  /**
   * Iniciar sesión
   */
  login(data: LoginData): Promise<AuthResponse>

  /**
   * Obtener perfil del usuario autenticado
   */
  getCurrentUser(): Promise<User>

  /**
   * Actualizar perfil del usuario autenticado
   */
  updateProfile(data: UpdateProfileData): Promise<User>

  /**
   * Obtener usuario por ID
   */
  getUserById(id: number): Promise<User>

  /**
   * Cerrar sesión (local)
   */
  logout(): void
}
