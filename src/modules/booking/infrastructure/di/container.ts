import type { IBookingRepository } from '@/modules/booking/domain/repositories/IBookingRepository'
import { ApiBookingService } from '../services/ApiBookingService'

export class BookingServiceContainer {
  private static bookingRepository: IBookingRepository | null = null

  static getBookingRepository(): IBookingRepository {
    if (!this.bookingRepository) {
      this.bookingRepository = new ApiBookingService()
    }
    return this.bookingRepository
  }

  static setBookingRepository(repository: IBookingRepository): void {
    this.bookingRepository = repository
  }

  static reset(): void {
    this.bookingRepository = null
  }
}
