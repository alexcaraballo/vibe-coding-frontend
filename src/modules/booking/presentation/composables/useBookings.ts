import { ref, readonly } from 'vue'
import { BookingServiceContainer } from '@/modules/booking/infrastructure/di/container'
import type { Booking, BookingWithTrip, CreateBookingData } from '@/modules/booking/domain/models/Booking'

export function useBookings() {
  const bookings = ref<BookingWithTrip[]>([])
  const currentBooking = ref<BookingWithTrip | null>(null)
  const tripBookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const repository = BookingServiceContainer.getBookingRepository()

  const createBooking = async (data: CreateBookingData): Promise<Booking | null> => {
    loading.value = true
    error.value = null

    try {
      const newBooking = await repository.create(data)
      return newBooking
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al crear reserva'
      console.error('Error creating booking:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchBookingById = async (id: number): Promise<BookingWithTrip | null> => {
    loading.value = true
    error.value = null

    try {
      currentBooking.value = await repository.getById(id)
      return currentBooking.value
    } catch (err: any) {
      error.value = 'Error al cargar reserva'
      console.error('Error fetching booking:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchMyBookings = async (status?: string, skip = 0, limit = 100) => {
    loading.value = true
    error.value = null

    try {
      bookings.value = await repository.getMyBookings(status, skip, limit)
    } catch (err: any) {
      error.value = 'Error al cargar tus reservas'
      console.error('Error fetching my bookings:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTripBookings = async (tripId: number, skip = 0, limit = 100) => {
    loading.value = true
    error.value = null

    try {
      tripBookings.value = await repository.getTripBookings(tripId, skip, limit)
    } catch (err: any) {
      error.value = 'Error al cargar reservas del viaje'
      console.error('Error fetching trip bookings:', err)
    } finally {
      loading.value = false
    }
  }

  const cancelBooking = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await repository.cancel(id)
      bookings.value = bookings.value.filter((b) => b.booking.id !== id)
      return true
    } catch (err: any) {
      error.value = 'Error al cancelar reserva'
      console.error('Error canceling booking:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    bookings: readonly(bookings),
    currentBooking: readonly(currentBooking),
    tripBookings: readonly(tripBookings),
    loading: readonly(loading),
    error: readonly(error),
    createBooking,
    fetchBookingById,
    fetchMyBookings,
    fetchTripBookings,
    cancelBooking
  }
}
