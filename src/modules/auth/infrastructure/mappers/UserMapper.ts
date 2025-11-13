import type { User } from '@/modules/auth/domain/models/User'
import type { UserDTO } from '@/modules/auth/presentation/types/AuthDTO'

/**
 * Mapper entre DTOs de API y modelos de dominio
 */
export class UserMapper {
  /**
   * Convierte DTO de API a modelo de dominio
   */
  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      role: dto.role,
      isActive: dto.is_active,
      isVerified: dto.is_verified,
      createdAt: new Date(dto.created_at),
      vehicleModel: dto.vehicle_model,
      vehiclePlate: dto.vehicle_plate,
      licenseNumber: dto.license_number
    }
  }

  /**
   * Convierte modelo de dominio a DTO de API (si fuera necesario)
   */
  static toDTO(domain: User): UserDTO {
    return {
      id: domain.id,
      email: domain.email,
      name: domain.name,
      phone: domain.phone,
      role: domain.role,
      is_active: domain.isActive,
      is_verified: domain.isVerified,
      created_at: domain.createdAt.toISOString(),
      vehicle_model: domain.vehicleModel,
      vehicle_plate: domain.vehiclePlate,
      license_number: domain.licenseNumber
    }
  }
}
