/**
 * Entidad del dominio - Usuario
 * NO debe tener lógica de persistencia
 */
export interface User {
  id: number
  email: string
  name: string
  phone: string | null
  role: UserRole
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  vehicleModel?: string | null
  vehiclePlate?: string | null
  licenseNumber?: string | null
}

/**
 * Roles de usuario en el sistema
 */
export type UserRole = 'driver' | 'passenger' | 'both'

/**
 * Datos para actualizar el perfil de usuario
 */
export interface UpdateUserData {
  name?: string
  phone?: string
  vehicleModel?: string
  vehiclePlate?: string
  licenseNumber?: string
}

/**
 * Perfil público de usuario (datos expuestos públicamente)
 */
export interface PublicUserProfile {
  id: number
  name: string
  role: UserRole
  createdAt: Date
}

/**
 * Validaciones y reglas de negocio del dominio
 */
export class UserValidator {
  static readonly MIN_PASSWORD_LENGTH = 8
  static readonly MAX_PASSWORD_LENGTH = 100
  static readonly MIN_NAME_LENGTH = 2
  static readonly MAX_NAME_LENGTH = 100

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidPassword(password: string): boolean {
    return (
      password.length >= this.MIN_PASSWORD_LENGTH &&
      password.length <= this.MAX_PASSWORD_LENGTH
    )
  }

  static isValidName(name: string): boolean {
    return name.length >= this.MIN_NAME_LENGTH && name.length <= this.MAX_NAME_LENGTH
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  static isDriver(user: User): boolean {
    return user.role === 'driver' || user.role === 'both'
  }

  static isPassenger(user: User): boolean {
    return user.role === 'passenger' || user.role === 'both'
  }
}
