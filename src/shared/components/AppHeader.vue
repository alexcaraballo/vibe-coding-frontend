<script setup lang="ts">
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const { user, isAuthenticated, isDriver, logout, initFromStorage } = useAuth()

onMounted(() => {
  initFromStorage()
})

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-2xl font-bold text-primary-600"> CeleringGo </router-link>
        </div>

        <nav class="flex items-center space-x-4">
          <router-link
            to="/"
            class="hover:text-primary-600"
            style="color: var(--primary-text)"
          >
            Buscar Viajes
          </router-link>

          <template v-if="isAuthenticated">
            <router-link
              to="/matching"
              class="hover:text-primary-600"
              style="color: var(--primary-text)"
            >
              Matching Inteligente
            </router-link>
            <router-link
              v-if="isDriver"
              to="/trips/publish"
              class="hover:text-primary-600"
              style="color: var(--primary-text)"
            >
              Publicar Viaje
            </router-link>
            <router-link
              to="/my-bookings"
              class="hover:text-primary-600"
              style="color: var(--primary-text)"
            >
              Mis Reservas
            </router-link>
            <router-link
              v-if="isDriver"
              to="/my-trips"
              class="hover:text-primary-600"
              style="color: var(--primary-text)"
            >
              Mis Viajes
            </router-link>
            <router-link
              to="/profile"
              class="hover:text-primary-600"
              style="color: var(--primary-text)"
            >
              {{ user?.name }}
            </router-link>
            <button
              @click="handleLogout"
              class="px-4 py-2 rounded hover:opacity-80"
              style="background-color: var(--error-color); color: var(--tertiary-text)"
            >
              Cerrar Sesión
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="px-4 py-2 rounded hover:opacity-90"
              style="background-color: var(--primary-color); color: var(--tertiary-text)"
            >
              Iniciar Sesión
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 rounded hover:opacity-90"
              style="background-color: var(--secondary-color); color: var(--primary-color)"
            >
              Registrarse
            </router-link>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
