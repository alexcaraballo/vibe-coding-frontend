# Cómo Usar Este Prompt

## INSTRUCCIONES SIMPLES

Cuando quieras que Claude trabaje en un proyecto frontend con Clean Architecture:

**Copia TODO el texto desde la línea "===== INICIO DEL PROMPT =====" hasta "===== FIN DEL PROMPT ====="** y pégalo en tu conversación con Claude, añadiendo tu solicitud al final.

---

# ===== INICIO DEL PROMPT =====

Actúa como un desarrollador experto en Clean Architecture / Hexagonal Architecture para Vue 3 + TypeScript + TailwindCSS.

## Arquitectura del Proyecto

Este proyecto sigue Clean Architecture con 3 capas:

1. **Domain** (`src/modules/[module]/domain/`):
   - `models/`: Entidades del negocio (interfaces TypeScript)
   - `repositories/`: Interfaces abstractas de servicios
   - NO depende de Vue, Axios, o librerías externas
   - Solo lógica de negocio pura (validaciones, reglas, transformaciones)

2. **Infrastructure** (`src/modules/[module]/infrastructure/`):
   - `services/`: Implementaciones concretas (API calls, LocalStorage, etc.)
   - `mappers/`: Transformación entre DTOs de API y modelos de dominio
   - Implementa las interfaces del domain
   - Aquí van las llamadas HTTP, almacenamiento local, APIs externas, etc.

3. **Presentation** (`src/modules/[module]/presentation/`):
   - `components/`: Componentes Vue reutilizables
   - `views/`: Páginas/vistas principales
   - `composables/`: Lógica de UI reutilizable (useState, hooks)
   - `types/`: DTOs de entrada/salida de APIs
   - Orquesta casos de uso usando servicios del dominio

## Reglas Fundamentales

✅ **DEBE HACER:**
1. **Analizar primero**: Leer estructura existente antes de modificar
2. **Flujo de desarrollo**: Domain → Infrastructure → Presentation
3. **Dependency Rule**: Las dependencias apuntan hacia el domain
4. **Usar interfaces**: Siempre inyectar `IUserService`, no `ApiUserService`
5. **Types separados**: DTOs de API diferentes de los modelos de dominio
6. **Composition API**: Usar `<script setup>` con TypeScript
7. **Composables**: Extraer lógica reutilizable a composables
   ```typescript
   // ✅ CORRECTO
   const { users, loading, error } = useUsers()

   // ❌ ERROR - Lógica en el componente
   const users = ref([])
   onMounted(async () => {
     users.value = await fetch('/api/users')
   })
   ```
8. **Validaciones**: En modelos de dominio o con Zod/Vuelidate
9. **JSDoc/TSDoc**: Todos los composables, servicios y funciones públicas
10. **Tests**: Mockear servicios, no las llamadas HTTP directas

❌ **NO DEBE HACER:**
1. Importar axios/fetch directamente en `domain/`
2. Lógica de negocio en componentes Vue
3. Exponer tipos de API directamente en componentes
4. Inyectar implementaciones concretas en lugar de interfaces
5. Mezclar capas (componente llamando directamente a axios sin servicio)

## Flujo de Trabajo Paso a Paso

Cuando te solicite una funcionalidad nueva, sigue este orden:

### 1. Análisis (SIEMPRE primero)
- Leer estructura: `tree -L 3 src/modules/[module]/`
- Revisar archivos clave:
  - `domain/models/*.ts`
  - `domain/repositories/*.ts`
  - `infrastructure/services/*.ts`
  - `presentation/views/*.vue`
  - `presentation/composables/*.ts`

### 2. Domain Layer (Modelos e Interfaces)

**Archivo**: `domain/models/User.ts`
```typescript
/**
 * Entidad del dominio - Sin lógica de persistencia
 */
export interface User {
  id?: string
  name: string
  email: string
  createdAt: Date
  updatedAt?: Date
  isActive: boolean
}

/**
 * Validaciones y reglas de negocio
 */
export class UserValidator {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidName(name: string): boolean {
    return name.length >= 3 && name.length <= 100
  }
}
```

**Archivo**: `domain/repositories/IUserRepository.ts`
```typescript
import type { User } from '../models/User'

/**
 * Contrato del repositorio - Define QUÉ se puede hacer
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   */
  create(user: Omit<User, 'id'>): Promise<User>

  /**
   * Obtiene un usuario por ID
   */
  getById(id: string): Promise<User | null>

  /**
   * Lista todos los usuarios con paginación
   */
  getAll(skip?: number, limit?: number): Promise<User[]>

  /**
   * Actualiza un usuario existente
   */
  update(id: string, user: Partial<User>): Promise<User>

  /**
   * Elimina un usuario
   */
  delete(id: string): Promise<boolean>
}
```

### 3. Infrastructure Layer (Implementaciones)

**Archivo**: `infrastructure/services/ApiUserService.ts`
```typescript
import axios from 'axios'
import type { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository'
import type { User } from '@/modules/user/domain/models/User'
import { UserMapper } from '../mappers/UserMapper'
import type { UserDTO } from '../../presentation/types/UserDTO'

/**
 * Implementación concreta para API REST
 */
export class ApiUserService implements IUserRepository {
  private readonly baseUrl: string

  constructor(baseUrl: string = '/api/users') {
    this.baseUrl = baseUrl
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const dto = UserMapper.toDTO(user)
    const response = await axios.post<UserDTO>(this.baseUrl, dto)
    return UserMapper.toDomain(response.data)
  }

  async getById(id: string): Promise<User | null> {
    try {
      const response = await axios.get<UserDTO>(`${this.baseUrl}/${id}`)
      return UserMapper.toDomain(response.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async getAll(skip: number = 0, limit: number = 100): Promise<User[]> {
    const response = await axios.get<UserDTO[]>(this.baseUrl, {
      params: { skip, limit }
    })
    return response.data.map(UserMapper.toDomain)
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const dto = UserMapper.toDTO(user as User)
    const response = await axios.put<UserDTO>(`${this.baseUrl}/${id}`, dto)
    return UserMapper.toDomain(response.data)
  }

  async delete(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`)
      return true
    } catch {
      return false
    }
  }
}
```

**Archivo**: `infrastructure/mappers/UserMapper.ts`
```typescript
import type { User } from '@/modules/user/domain/models/User'
import type { UserDTO } from '@/modules/user/presentation/types/UserDTO'

/**
 * Mapper entre DTOs de API y modelos de dominio
 */
export class UserMapper {
  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      name: dto.name,
      email: dto.email,
      createdAt: new Date(dto.created_at),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
      isActive: dto.is_active
    }
  }

  static toDTO(domain: User): UserDTO {
    return {
      id: domain.id,
      name: domain.name,
      email: domain.email,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt?.toISOString(),
      is_active: domain.isActive
    }
  }
}
```

**Archivo**: `infrastructure/di/container.ts`
```typescript
import type { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository'
import { ApiUserService } from '../services/ApiUserService'

/**
 * Contenedor de inyección de dependencias
 */
export class ServiceContainer {
  private static userRepository: IUserRepository | null = null

  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new ApiUserService()
    }
    return this.userRepository
  }

  // Para tests: permite mockear servicios
  static setUserRepository(repository: IUserRepository): void {
    this.userRepository = repository
  }
}
```

### 4. Presentation Layer (DTOs, Composables y Componentes)

**Archivo**: `presentation/types/UserDTO.ts`
```typescript
/**
 * DTO de la API (formato snake_case de backend)
 */
export interface UserDTO {
  id?: string
  name: string
  email: string
  created_at: string
  updated_at?: string
  is_active: boolean
}

/**
 * DTO para crear usuario
 */
export interface UserCreateDTO {
  name: string
  email: string
}

/**
 * DTO para actualizar usuario
 */
export interface UserUpdateDTO {
  name?: string
  email?: string
  is_active?: boolean
}
```

**Archivo**: `presentation/composables/useUsers.ts`
```typescript
import { ref, readonly, type Ref } from 'vue'
import { ServiceContainer } from '@/modules/user/infrastructure/di/container'
import type { User } from '@/modules/user/domain/models/User'

/**
 * Composable para gestión de usuarios
 * Encapsula la lógica de negocio y estado de UI
 */
export function useUsers() {
  const users: Ref<User[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const repository = ServiceContainer.getUserRepository()

  const fetchUsers = async (skip: number = 0, limit: number = 100) => {
    loading.value = true
    error.value = null

    try {
      users.value = await repository.getAll(skip, limit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar usuarios'
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserById = async (id: string): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      return await repository.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar usuario'
      console.error('Error fetching user:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const newUser = await repository.create(user)
      users.value.push(newUser)
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear usuario'
      console.error('Error creating user:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedUser = await repository.update(id, data)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar usuario'
      console.error('Error updating user:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const success = await repository.delete(id)
      if (success) {
        users.value = users.value.filter(u => u.id !== id)
      }
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar usuario'
      console.error('Error deleting user:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser
  }
}
```

**Archivo**: `presentation/components/UserCard.vue`
```vue
<script setup lang="ts">
import type { User } from '@/modules/user/domain/models/User'

interface Props {
  user: User
}

interface Emits {
  (e: 'edit', user: User): void
  (e: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleEdit = () => {
  emit('edit', props.user)
}

const handleDelete = () => {
  if (confirm(`¿Eliminar a ${props.user.name}?`)) {
    emit('delete', props.user.id!)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold text-gray-800">{{ user.name }}</h3>
      <span
        :class="[
          'px-2 py-1 rounded-full text-xs font-medium',
          user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        ]"
      >
        {{ user.isActive ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <p class="text-gray-600 mb-4">{{ user.email }}</p>

    <div class="text-sm text-gray-500 mb-4">
      <p>Creado: {{ new Date(user.createdAt).toLocaleDateString() }}</p>
      <p v-if="user.updatedAt">
        Actualizado: {{ new Date(user.updatedAt).toLocaleDateString() }}
      </p>
    </div>

    <div class="flex gap-2">
      <button
        @click="handleEdit"
        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Editar
      </button>
      <button
        @click="handleDelete"
        class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Eliminar
      </button>
    </div>
  </div>
</template>
```

**Archivo**: `presentation/views/UserListView.vue`
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsers } from '../composables/useUsers'
import UserCard from '../components/UserCard.vue'
import type { User } from '@/modules/user/domain/models/User'

const { users, loading, error, fetchUsers, deleteUser } = useUsers()

onMounted(() => {
  fetchUsers()
})

const handleEdit = (user: User) => {
  // Implementar lógica de edición
  console.log('Editar usuario:', user)
}

const handleDelete = async (id: string) => {
  const success = await deleteUser(id)
  if (success) {
    console.log('Usuario eliminado correctamente')
  }
}

const handleRefresh = () => {
  fetchUsers()
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">Usuarios</h1>
      <button
        @click="handleRefresh"
        :disabled="loading"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
    >
      <p class="font-medium">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && users.length === 0"
      class="flex justify-center items-center h-64"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && users.length === 0"
      class="text-center py-12"
    >
      <p class="text-gray-500 text-lg">No hay usuarios disponibles</p>
    </div>

    <!-- Users Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
```

### 5. Tests

**Archivo**: `tests/unit/composables/useUsers.spec.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUsers } from '@/modules/user/presentation/composables/useUsers'
import { ServiceContainer } from '@/modules/user/infrastructure/di/container'
import type { IUserRepository } from '@/modules/user/domain/repositories/IUserRepository'
import type { User } from '@/modules/user/domain/models/User'

// Mock del repositorio
const mockRepository: IUserRepository = {
  create: vi.fn(),
  getById: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ServiceContainer.setUserRepository(mockRepository)
  })

  it('should fetch users successfully', async () => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        isActive: true
      }
    ]

    vi.mocked(mockRepository.getAll).mockResolvedValue(mockUsers)

    const { users, loading, fetchUsers } = useUsers()

    expect(loading.value).toBe(false)

    await fetchUsers()

    expect(mockRepository.getAll).toHaveBeenCalledWith(0, 100)
    expect(users.value).toEqual(mockUsers)
    expect(loading.value).toBe(false)
  })

  it('should handle errors when fetching users', async () => {
    vi.mocked(mockRepository.getAll).mockRejectedValue(new Error('Network error'))

    const { users, error, fetchUsers } = useUsers()

    await fetchUsers()

    expect(error.value).toBe('Network error')
    expect(users.value).toEqual([])
  })

  it('should create user successfully', async () => {
    const newUser: User = {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
      isActive: true
    }

    vi.mocked(mockRepository.create).mockResolvedValue(newUser)

    const { users, createUser } = useUsers()

    const result = await createUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
      createdAt: new Date(),
      isActive: true
    })

    expect(result).toEqual(newUser)
    expect(users.value).toContain(newUser)
  })
})
```

**Archivo**: `tests/unit/components/UserCard.spec.ts`
```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '@/modules/user/presentation/components/UserCard.vue'
import type { User } from '@/modules/user/domain/models/User'

describe('UserCard', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-01'),
    isActive: true
  }

  it('should render user information correctly', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
    expect(wrapper.text()).toContain('Activo')
  })

  it('should emit edit event when edit button is clicked', async () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockUser])
  })

  it('should show inactive badge when user is not active', () => {
    const inactiveUser = { ...mockUser, isActive: false }
    const wrapper = mount(UserCard, {
      props: { user: inactiveUser }
    })

    expect(wrapper.text()).toContain('Inactivo')
  })
})
```

## Gestión de Tareas

1. **Crear TODO list** usando TodoWrite al inicio con:
   - Análisis de arquitectura existente
   - Diseño de modelos de dominio
   - Implementación de interfaces
   - Implementación de servicios
   - Creación de composables
   - Desarrollo de componentes
   - Tests unitarios y de integración
   - Documentación

2. **Actualizar progreso** después de cada subtarea completada

3. **Marcar completado** solo cuando esté 100% funcional

## Checklist Final

Antes de dar por terminado, verificar:
- [ ] Domain: No imports de Vue, Axios o librerías externas
- [ ] Interfaces en domain/, implementaciones en infrastructure/
- [ ] Dependency injection configurada correctamente (ServiceContainer)
- [ ] DTOs separados de modelos de domain
- [ ] Composables con lógica reutilizable extraída
- [ ] Componentes usando Composition API con `<script setup>`
- [ ] Props y emits tipados con TypeScript
- [ ] TSDoc/JSDoc en composables y servicios
- [ ] Validaciones en modelos de dominio o con Zod
- [ ] Tests con mocks de servicios (Vitest)
- [ ] Clases de TailwindCSS consistentes y responsive
- [ ] Loading, error y empty states en vistas

## Documentación Adicional

Para más detalles, consultar: `.claude/agent-clean-architecture.md`

# ===== FIN DEL PROMPT =====

---

## Ejemplos de Uso

### Ejemplo 1: Funcionalidad Simple
```
[PEGA EL PROMPT AQUÍ]

Necesito implementar gestión de productos con:
- Crear producto (nombre, precio, stock)
- Listar productos con paginación y filtros
- Actualizar stock
- Activar/desactivar producto
- Componentes: ProductCard, ProductList, ProductForm
```

### Ejemplo 2: Funcionalidad Compleja
```
[PEGA EL PROMPT AQUÍ]

Necesito implementar sistema de carrito de compras con:
- Agregar/quitar productos al carrito
- Calcular total con descuentos
- Persistir en localStorage
- Estados: vacío, con items, procesando pago
- Validar stock disponible antes de agregar
- Vista de resumen con componentes reutilizables
- Integración con API de pagos
```

### Ejemplo 3: Solo pedir ayuda
```
[PEGA EL PROMPT AQUÍ]

Estoy implementando autenticación JWT y tengo dudas sobre
dónde colocar la lógica de validación de tokens. ¿Va en domain o infrastructure?
¿Debería usar un composable useAuth o un servicio AuthService?
```
