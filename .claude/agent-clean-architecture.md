# Agente de Desarrollo: Clean Architecture / Hexagonal Architecture (Frontend)

## Contexto

Este documento define cómo trabajar en proyectos frontend con **Clean Architecture** (también conocida como Hexagonal Architecture o Ports & Adapters). Esta arquitectura separa las preocupaciones en capas bien definidas para mantener el código mantenible, testeable y desacoplado usando **Vue 3 + TypeScript + TailwindCSS**.

## Estructura de Capas

```
src/
  └── modules/
      └── [module_name]/
          ├── domain/                    # Capa de Dominio (núcleo del negocio)
          │   ├── models/                # Entidades e interfaces TypeScript
          │   │   └── *.ts
          │   └── repositories/          # Interfaces (contratos)
          │       └── I*Repository.ts
          │
          ├── infrastructure/            # Capa de Infraestructura (implementaciones)
          │   ├── services/              # Implementaciones concretas (API, LocalStorage)
          │   │   └── *Service.ts
          │   ├── mappers/               # Transformadores DTO <-> Domain
          │   │   └── *Mapper.ts
          │   └── di/                    # Inyección de dependencias
          │       └── container.ts
          │
          └── presentation/              # Capa de Presentación (UI)
              ├── components/            # Componentes Vue reutilizables
              │   └── *.vue
              ├── views/                 # Vistas/páginas principales
              │   └── *.vue
              ├── composables/           # Lógica de UI reutilizable
              │   └── use*.ts
              └── types/                 # DTOs de API
                  └── *DTO.ts
```

## Principios de Clean Architecture

### 1. Dirección de Dependencias

**REGLA DE ORO**: Las dependencias siempre apuntan hacia adentro (hacia el dominio).

```
Presentation Layer → Infrastructure Layer → Domain Layer
     (usa)                (implementa)         (define)
   Components            Services/Mappers      Models/Interfaces
   Composables
```

- **Domain**: NO debe depender de nada externo (ni Vue, ni Axios, ni librerías de UI)
- **Infrastructure**: Depende del Domain (implementa sus interfaces)
- **Presentation**: Depende del Domain (usa sus interfaces) y de Infrastructure (vía DI container)

### 2. Separación de Responsabilidades

- **Domain/models/**: Entidades e interfaces puras del negocio (TypeScript)
- **Domain/repositories/**: Contratos (interfaces abstractas)
- **Infrastructure/services/**: Implementaciones concretas (API calls, LocalStorage)
- **Infrastructure/mappers/**: Transformadores entre DTOs y modelos
- **Presentation/types/**: DTOs para entrada/salida de APIs
- **Presentation/composables/**: Lógica de UI y estado
- **Presentation/components/**: Componentes Vue reutilizables
- **Presentation/views/**: Páginas/vistas principales

---

## Flujo de Trabajo para Nuevas Funcionalidades

### Paso 1: Analizar Arquitectura Existente

Antes de empezar, **SIEMPRE** analizar:

```bash
# Verificar estructura del proyecto
tree -L 4 src/modules/

# Leer archivos clave
- domain/models/*.ts           # Entidades existentes
- domain/repositories/*.ts     # Interfaces existentes
- infrastructure/services/*.ts # Implementaciones de servicios
- infrastructure/mappers/*.ts  # Mappers existentes
- presentation/views/*.vue     # Vistas actuales
- presentation/composables/*.ts # Composables existentes
- src/router/index.ts          # Rutas configuradas
```

**Preguntas a responder:**
- ¿Qué modelos de dominio existen?
- ¿Qué servicios/repositorios están definidos?
- ¿Qué API backend se consume?
- ¿Hay autenticación/autorización implementada?
- ¿Qué store (Pinia/Vuex) se usa para estado global?
- ¿Qué componentes UI reutilizables existen?

### Paso 2: Diseñar Modelo de Dominio

**Crear: `domain/models/Product.ts`**

```typescript
/**
 * Entidad del dominio - NO debe tener lógica de persistencia
 */
export interface Product {
  id?: string
  name: string
  price: number
  stock: number
  createdAt: Date
  updatedAt?: Date
  isActive: boolean
}

/**
 * Reglas de negocio y validaciones del dominio
 */
export class ProductValidator {
  static MIN_PRICE = 0
  static MAX_NAME_LENGTH = 100

  static isValidPrice(price: number): boolean {
    return price >= this.MIN_PRICE && Number.isFinite(price)
  }

  static isValidName(name: string): boolean {
    return name.trim().length > 0 && name.length <= this.MAX_NAME_LENGTH
  }

  static isInStock(product: Product): boolean {
    return product.stock > 0 && product.isActive
  }

  static canBePurchased(product: Product, quantity: number): boolean {
    return this.isInStock(product) && product.stock >= quantity
  }
}
```

**Buenas prácticas:**
- Usar interfaces TypeScript para entidades
- Incluir JSDoc descriptivos
- Crear clases Validator para reglas de negocio
- Tipos explícitos con anotaciones TypeScript
- NO importar nada de Vue, Axios o librerías de UI aquí

### Paso 3: Definir Interface del Repositorio

**Crear: `domain/repositories/IProductRepository.ts`**

```typescript
import type { Product } from '../models/Product'

/**
 * Contrato para el repositorio - Define QUÉ se puede hacer
 */
export interface IProductRepository {
  /**
   * Crea un nuevo producto
   */
  create(product: Omit<Product, 'id'>): Promise<Product>

  /**
   * Obtiene un producto por ID
   */
  getById(id: string): Promise<Product | null>

  /**
   * Lista todos los productos con paginación y filtros
   */
  getAll(params?: {
    skip?: number
    limit?: number
    search?: string
    isActive?: boolean
  }): Promise<Product[]>

  /**
   * Actualiza un producto existente
   */
  update(id: string, product: Partial<Product>): Promise<Product>

  /**
   * Elimina un producto
   */
  delete(id: string): Promise<boolean>

  /**
   * Actualiza el stock de un producto
   */
  updateStock(id: string, quantity: number): Promise<Product>
}
```

**Buenas prácticas:**
- Usar `interface` de TypeScript para contratos
- Documentar con JSDoc el comportamiento esperado
- Usar tipos del dominio (nunca tipos de DTO de API)
- Todos los métodos retornan Promises
- Usar `Partial<T>` y `Omit<T, K>` para operaciones parciales

### Paso 4: Implementar Servicio (Repositorio)

**Crear: `infrastructure/services/ApiProductService.ts`**

```typescript
import axios, { type AxiosInstance } from 'axios'
import type { IProductRepository } from '@/modules/product/domain/repositories/IProductRepository'
import type { Product } from '@/modules/product/domain/models/Product'
import { ProductMapper } from '../mappers/ProductMapper'
import type { ProductDTO } from '@/modules/product/presentation/types/ProductDTO'

/**
 * Implementación concreta para API REST
 */
export class ApiProductService implements IProductRepository {
  private readonly client: AxiosInstance

  constructor(baseURL: string = '/api/products') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const dto = ProductMapper.toDTO(product as Product)
    const response = await this.client.post<ProductDTO>('/', dto)
    return ProductMapper.toDomain(response.data)
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const response = await this.client.get<ProductDTO>(`/${id}`)
      return ProductMapper.toDomain(response.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async getAll(params?: {
    skip?: number
    limit?: number
    search?: string
    isActive?: boolean
  }): Promise<Product[]> {
    const response = await this.client.get<ProductDTO[]>('/', { params })
    return response.data.map(ProductMapper.toDomain)
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const dto = ProductMapper.toDTO(product as Product)
    const response = await this.client.put<ProductDTO>(`/${id}`, dto)
    return ProductMapper.toDomain(response.data)
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.client.delete(`/${id}`)
      return true
    } catch {
      return false
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const response = await this.client.patch<ProductDTO>(`/${id}/stock`, { quantity })
    return ProductMapper.toDomain(response.data)
  }
}
```

**Buenas prácticas:**
- Implementar TODOS los métodos de la interface
- Usar tipos del dominio en firmas
- Usar mappers para convertir DTOs <-> Domain
- Manejar errores HTTP apropiadamente (404, 500, etc.)
- NO exponer detalles de Axios fuera del servicio

### Paso 5: Crear Mapper y Configurar DI

**Crear: `infrastructure/mappers/ProductMapper.ts`**

```typescript
import type { Product } from '@/modules/product/domain/models/Product'
import type { ProductDTO } from '@/modules/product/presentation/types/ProductDTO'

/**
 * Mapper entre DTOs de API y modelos de dominio
 */
export class ProductMapper {
  /**
   * Convierte DTO de API a modelo de dominio
   */
  static toDomain(dto: ProductDTO): Product {
    return {
      id: dto.id,
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      createdAt: new Date(dto.created_at),
      updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
      isActive: dto.is_active
    }
  }

  /**
   * Convierte modelo de dominio a DTO de API
   */
  static toDTO(domain: Product): ProductDTO {
    return {
      id: domain.id,
      name: domain.name,
      price: domain.price,
      stock: domain.stock,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt?.toISOString(),
      is_active: domain.isActive
    }
  }
}
```

**Crear: `infrastructure/di/container.ts`**

```typescript
import type { IProductRepository } from '@/modules/product/domain/repositories/IProductRepository'
import { ApiProductService } from '../services/ApiProductService'

/**
 * Contenedor de inyección de dependencias
 */
export class ServiceContainer {
  private static productRepository: IProductRepository | null = null

  static getProductRepository(): IProductRepository {
    if (!this.productRepository) {
      this.productRepository = new ApiProductService()
    }
    return this.productRepository
  }

  // Para testing: permite reemplazar con mocks
  static setProductRepository(repository: IProductRepository): void {
    this.productRepository = repository
  }

  // Resetea el contenedor (útil para tests)
  static reset(): void {
    this.productRepository = null
  }
}
```

**Buenas prácticas:**
- Mappers estáticos para transformaciones
- Conversión explícita de fechas (string <-> Date)
- Nomenclatura: snake_case (API) <-> camelCase (Frontend)
- DI Container con pattern Singleton
- Método para mockear en tests

### Paso 6: Definir DTOs

**Crear: `presentation/types/ProductDTO.ts`**

```typescript
/**
 * DTO de la API - Formato del backend (snake_case)
 */
export interface ProductDTO {
  id?: string
  name: string
  price: number
  stock: number
  created_at: string  // ISO string
  updated_at?: string // ISO string
  is_active: boolean
}

/**
 * DTO para crear producto
 */
export interface ProductCreateDTO {
  name: string
  price: number
  stock: number
}

/**
 * DTO para actualizar producto
 */
export interface ProductUpdateDTO {
  name?: string
  price?: number
  stock?: number
  is_active?: boolean
}
```

**Buenas prácticas:**
- DTOs específicos para operaciones (Create, Update, Response)
- Usar snake_case si el backend usa Python/FastAPI
- Fechas como strings ISO en DTOs
- Tipos opcionales donde corresponda
- NO usar estos DTOs dentro del dominio

### Paso 7: Crear Composable

**Crear: `presentation/composables/useProducts.ts`**

```typescript
import { ref, readonly, computed, type Ref } from 'vue'
import { ServiceContainer } from '@/modules/product/infrastructure/di/container'
import type { Product } from '@/modules/product/domain/models/Product'
import { ProductValidator } from '@/modules/product/domain/models/Product'

/**
 * Composable para gestión de productos
 * Encapsula lógica de negocio y estado de UI
 */
export function useProducts() {
  const products: Ref<Product[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const repository = ServiceContainer.getProductRepository()

  // Computed: productos en stock
  const productsInStock = computed(() =>
    products.value.filter(p => ProductValidator.isInStock(p))
  )

  const fetchProducts = async (filters?: {
    skip?: number
    limit?: number
    search?: string
    isActive?: boolean
  }) => {
    loading.value = true
    error.value = null

    try {
      products.value = await repository.getAll(filters)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar productos'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    // Validaciones de dominio
    if (!ProductValidator.isValidName(product.name)) {
      error.value = 'Nombre inválido'
      return null
    }

    if (!ProductValidator.isValidPrice(product.price)) {
      error.value = 'Precio inválido'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newProduct = await repository.create(product)
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear producto'
      console.error('Error creating product:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: string, data: Partial<Product>): Promise<Product | null> => {
    loading.value = true
    error.value = null

    try {
      const updated = await repository.update(id, data)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar producto'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const success = await repository.delete(id)
      if (success) {
        products.value = products.value.filter(p => p.id !== id)
      }
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar producto'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    products: readonly(products),
    productsInStock: readonly(productsInStock),
    loading: readonly(loading),
    error: readonly(error),
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
```

**Buenas prácticas:**
- Usar composables para lógica reutilizable
- Devolver estados como `readonly` para prevenir mutación externa
- Validaciones de dominio antes de llamar al repositorio
- Manejo de errores consistente
- Computed properties para datos derivados
- JSDoc para documentación

### Paso 8: Crear Componentes y Vista

**Crear: `presentation/components/ProductCard.vue`** (Ver PROMPT_AGENT.md para ejemplo completo)

**Crear: `presentation/views/ProductListView.vue`** (Ver PROMPT_AGENT.md para ejemplo completo)

**Registrar ruta en: `src/router/index.ts`**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import ProductListView from '@/modules/product/presentation/views/ProductListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/products',
      name: 'products',
      component: ProductListView
    }
  ]
})

export default router
```

---

## Testing

### Estructura de Tests

**Archivo: `tests/unit/composables/useProducts.spec.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProducts } from '@/modules/product/presentation/composables/useProducts'
import { ServiceContainer } from '@/modules/product/infrastructure/di/container'
import type { IProductRepository } from '@/modules/product/domain/repositories/IProductRepository'
import type { Product } from '@/modules/product/domain/models/Product'

// Mock del repositorio
const mockRepository: IProductRepository = {
  create: vi.fn(),
  getById: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateStock: vi.fn()
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ServiceContainer.setProductRepository(mockRepository)
  })

  it('should fetch products successfully', async () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Product 1',
        price: 100,
        stock: 10,
        createdAt: new Date(),
        isActive: true
      }
    ]

    vi.mocked(mockRepository.getAll).mockResolvedValue(mockProducts)

    const { products, loading, fetchProducts } = useProducts()

    await fetchProducts()

    expect(mockRepository.getAll).toHaveBeenCalledOnce()
    expect(products.value).toEqual(mockProducts)
    expect(loading.value).toBe(false)
  })

  it('should validate product before creating', async () => {
    const { createProduct, error } = useProducts()

    const invalidProduct = {
      name: '',  // Nombre inválido
      price: 100,
      stock: 10,
      createdAt: new Date(),
      isActive: true
    }

    const result = await createProduct(invalidProduct)

    expect(result).toBeNull()
    expect(error.value).toBe('Nombre inválido')
    expect(mockRepository.create).not.toHaveBeenCalled()
  })
})
```

**Archivo: `tests/unit/components/ProductCard.spec.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '@/modules/product/presentation/components/ProductCard.vue'
import type { Product } from '@/modules/product/domain/models/Product'

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    stock: 5,
    createdAt: new Date(),
    isActive: true
  }

  it('should render product information', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })

    expect(wrapper.text()).toContain('Test Product')
    expect(wrapper.text()).toContain('99.99')
  })

  it('should emit delete event when delete button is clicked', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })

    // Mock de window.confirm
    window.confirm = vi.fn(() => true)

    await wrapper.find('[data-test="delete-btn"]').trigger('click')

    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]).toEqual(['1'])
  })
})
```

**Buenas prácticas:**
- Mockear servicios/repositorios, no las llamadas HTTP
- Tests por composable/componente
- Nombres descriptivos: `should <comportamiento esperado>`
- Verificar tanto estado como llamadas a mocks
- Usar Vitest + @vue/test-utils para Vue
- Tests de validaciones de dominio

---

## Checklist de Desarrollo

Usar este checklist para cada nueva funcionalidad:

- [ ] **Analizar** estructura existente del proyecto
- [ ] **Diseñar** modelo de dominio (`domain/models/*.ts`)
- [ ] **Definir** interface de repositorio (`domain/repositories/I*Repository.ts`)
- [ ] **Implementar** servicio concreto (`infrastructure/services/*Service.ts`)
- [ ] **Crear** mapper (`infrastructure/mappers/*Mapper.ts`)
- [ ] **Configurar** dependency injection (`infrastructure/di/container.ts`)
- [ ] **Definir** DTOs (`presentation/types/*DTO.ts`)
- [ ] **Crear** composable (`presentation/composables/use*.ts`)
- [ ] **Desarrollar** componentes (`presentation/components/*.vue`)
- [ ] **Crear** vistas (`presentation/views/*.vue`)
- [ ] **Registrar** ruta (`src/router/index.ts`)
- [ ] **Validar** con linters (ESLint, TypeScript)
- [ ] **Escribir** tests unitarios (`tests/unit/`)
- [ ] **Documentar** componentes (JSDoc/TSDoc + Storybook si aplica)
- [ ] **Verificar** responsive design y accesibilidad

---

## Errores Comunes a Evitar

### ❌ ERROR 1: Dependencias invertidas

```typescript
// MAL - Domain importa de Infrastructure
// domain/models/Product.ts
import axios from 'axios'  // ❌ NUNCA

// BIEN - Domain no importa nada externo
// domain/models/Product.ts
export interface Product { ... }  // ✅
```

### ❌ ERROR 2: Lógica de negocio en componentes

```vue
<!-- MAL - Lógica en el componente -->
<script setup lang="ts">
const createProduct = async () => {
  if (price.value < 0) {  // ❌ Validación de negocio aquí
    alert('Invalid price')
  }
}
</script>

<!-- BIEN - Validación en dominio -->
<script setup lang="ts">
import { ProductValidator } from '@/domain/models/Product'

const createProduct = async () => {
  if (!ProductValidator.isValidPrice(price.value)) {  // ✅
    error.value = 'Invalid price'
  }
}
</script>
```

### ❌ ERROR 3: Llamadas HTTP directas en componentes

```vue
<!-- MAL - Axios directo en componente -->
<script setup lang="ts">
import axios from 'axios'
const users = ref([])
onMounted(async () => {
  users.value = await axios.get('/api/users')  // ❌
})
</script>

<!-- BIEN - Usar composable -->
<script setup lang="ts">
const { users, fetchUsers } = useUsers()  // ✅
onMounted(() => fetchUsers())
</script>
```

### ❌ ERROR 4: Usar DTOs dentro del dominio

```typescript
// MAL - DTO en dominio
// domain/models/Product.ts
import type { ProductDTO } from '@/presentation/types/ProductDTO'  // ❌

// BIEN - Solo tipos de dominio
// domain/models/Product.ts
export interface Product { ... }  // ✅
```

### ❌ ERROR 5: No usar interfaces para servicios

```typescript
// MAL - Depender de implementación concreta
export function useProducts() {
  const service = new ApiProductService()  // ❌
}

// BIEN - Usar DI Container
export function useProducts() {
  const service = ServiceContainer.getProductRepository()  // ✅
}
```

---

## Comandos Útiles

```bash
# Estructura del proyecto
tree -L 4 -I 'node_modules|dist' src/modules/

# Buscar modelos de dominio
find src/ -type f -name "*.ts" -path "*/domain/models/*"

# Buscar interfaces de repositorios
find src/ -type f -name "I*Repository.ts"

# Buscar composables
find src/ -type f -name "use*.ts"

# Ejecutar tests
npm run test:unit
# o
pnpm test

# Linters y formatters
npm run lint
npm run format
npm run type-check

# Ejecutar dev server
npm run dev
```

---

## Referencias y Recursos

- **Clean Architecture** (Robert C. Martin): https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Hexagonal Architecture**: https://alistair.cockburn.us/hexagonal-architecture/
- **Vue 3 Composition API**: https://vuejs.org/guide/extras/composition-api-faq.html
- **Vue 3 TypeScript**: https://vuejs.org/guide/typescript/overview.html
- **TailwindCSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev/guide/

---

## Plantilla de Prompt para Claude

Cuando solicites ayuda en un proyecto con Clean Architecture, usa este prompt:

```
Estoy trabajando en un proyecto Vue 3 + TypeScript con Clean Architecture/Hexagonal Architecture.

Estructura:
- Domain: Modelos e interfaces (no depende de Vue/Axios)
- Infrastructure: Servicios, mappers y DI container
- Presentation: Componentes Vue, composables, vistas

Stack:
- Vue 3 + Composition API (<script setup>)
- TypeScript
- TailwindCSS
- Vitest para tests

Necesito implementar: [DESCRIPCIÓN DE LA FUNCIONALIDAD]

Por favor:
1. Analiza la arquitectura existente primero
2. Sigue el flujo: Domain → Infrastructure → Presentation
3. Mantén las capas desacopladas
4. Usa DI Container para servicios
5. Crea DTOs separados para API
6. Usa mappers para transformar DTOs ↔ Domain
7. Crea composables con lógica reutilizable
8. Componentes con TailwindCSS responsive
9. Props y emits tipados con TypeScript
10. Escribe tests con mocks de servicios

Archivos clave:
- src/modules/[module]/domain/models/*.ts
- src/modules/[module]/domain/repositories/*.ts
- src/modules/[module]/infrastructure/services/*.ts
- src/modules/[module]/presentation/composables/use*.ts
- src/modules/[module]/presentation/components/*.vue
```

---

## Versión

- **Versión**: 2.0 (Frontend - Vue 3)
- **Última actualización**: 2025-11-07
- **Adaptado para**: Vue 3 + TypeScript + TailwindCSS
- **Autor**: Celering Development Team
