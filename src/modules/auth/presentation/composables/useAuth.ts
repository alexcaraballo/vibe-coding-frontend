import { ref, readonly, computed } from 'vue'
import { AuthServiceContainer } from '@/modules/auth/infrastructure/di/container'
import type { User } from '@/modules/auth/domain/models/User'
import type {
  RegisterData,
  LoginData,
  UpdateProfileData
} from '@/modules/auth/domain/repositories/IAuthRepository'
import { UserValidator } from '@/modules/auth/domain/models/User'

/**
 * Composable para gestión de autenticación
 * Encapsula lógica de negocio y estado de UI
 */
export function useAuth() {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const repository = AuthServiceContainer.getAuthRepository()

  // Computed: verificar si el usuario está autenticado
  const isAuthenticated = computed(() => user.value !== null)
  const isDriver = computed(() => (user.value ? UserValidator.isDriver(user.value) : false))
  const isPassenger = computed(() => (user.value ? UserValidator.isPassenger(user.value) : false))

  /**
   * Registrar nuevo usuario
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    // Validaciones de dominio
    if (!UserValidator.isValidEmail(data.email)) {
      error.value = 'Email inválido'
      return false
    }

    if (!UserValidator.isValidPassword(data.password)) {
      error.value = `La contraseña debe tener al menos ${UserValidator.MIN_PASSWORD_LENGTH} caracteres`
      return false
    }

    if (!UserValidator.isValidName(data.name)) {
      error.value = 'Nombre inválido'
      return false
    }

    if (!UserValidator.isValidPhone(data.phone)) {
      error.value = 'Teléfono inválido'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const response = await repository.register(data)
      user.value = response.user

      // Guardar token en localStorage
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('user', JSON.stringify(response.user))

      return true
    } catch (err: any) {
      if (err.response?.status === 400) {
        error.value = 'El email ya está registrado'
      } else {
        error.value = err.response?.data?.detail || 'Error al registrar usuario'
      }
      console.error('Error registering user:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Iniciar sesión
   */
  const login = async (data: LoginData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await repository.login(data)
      user.value = response.user

      // Guardar token en localStorage
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('user', JSON.stringify(response.user))

      return true
    } catch (err: any) {
      if (err.response?.status === 401) {
        error.value = 'Email o contraseña incorrectos'
      } else {
        error.value = err.response?.data?.detail || 'Error al iniciar sesión'
      }
      console.error('Error logging in:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  const fetchCurrentUser = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      user.value = await repository.getCurrentUser()
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    } catch (err: any) {
      error.value = 'Error al obtener perfil de usuario'
      console.error('Error fetching current user:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const updatedUser = await repository.updateProfile(data)
      user.value = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Error al actualizar perfil'
      console.error('Error updating profile:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener usuario por ID
   */
  const fetchUserById = async (id: number): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      return await repository.getUserById(id)
    } catch (err: any) {
      error.value = 'Error al obtener usuario'
      console.error('Error fetching user:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = (): void => {
    repository.logout()
    user.value = null
  }

  /**
   * Inicializar desde localStorage
   */
  const initFromStorage = (): void => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        user.value = JSON.parse(userData)
      } catch (err) {
        console.error('Error parsing user data from localStorage:', err)
        logout()
      }
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isDriver,
    isPassenger,
    register,
    login,
    fetchCurrentUser,
    updateProfile,
    fetchUserById,
    logout,
    initFromStorage
  }
}
