<script setup lang="ts">
import { useAuth } from '@/modules/auth/presentation/composables/useAuth'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const { user, isAuthenticated, isDriver, logout, initFromStorage } = useAuth()
const mobileMenuOpen = ref(false)

onMounted(() => {
  initFromStorage()
})

const handleLogout = () => {
  logout()
  router.push('/login')
  mobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo y Brand -->
      <div class="brand">
        <router-link to="/" class="brand-link" @click="closeMobileMenu">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17C9.85038 16.3697 10.8846 16 12 16C13.1154 16 14.1496 16.3697 15 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M6.5 13.5C7.78551 12.7842 9.32689 12.25 11 12.25C12.6731 12.25 14.2145 12.7842 15.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3 10C5.48276 8.5 8.5 7.5 12 7.5C15.5 7.5 18.5172 8.5 21 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 20L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="brand-name">CeleringGo</span>
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <router-link to="/" class="nav-link">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Buscar
        </router-link>

        <template v-if="isAuthenticated">
          <router-link to="/matching" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Matching
          </router-link>

          <router-link v-if="isDriver" to="/trips/publish" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Publicar
          </router-link>

          <router-link to="/my-bookings" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Reservas
          </router-link>

          <router-link v-if="isDriver" to="/my-trips" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Mis Viajes
          </router-link>

          <router-link to="/profile" class="nav-link-profile">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="truncate">{{ user?.name }}</span>
          </router-link>

          <button @click="handleLogout" class="btn-logout">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </template>

        <template v-else>
          <router-link to="/login" class="btn-primary">
            Iniciar Sesión
          </router-link>
          <router-link to="/register" class="btn-secondary">
            Registrarse
          </router-link>
        </template>
      </nav>

      <!-- Mobile Menu Button -->
      <button @click="toggleMobileMenu" class="mobile-menu-button">
        <svg v-if="!mobileMenuOpen" class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg v-else class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-fade">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
            <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Buscar Viajes</span>
          </router-link>

          <template v-if="isAuthenticated">
            <router-link to="/matching" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Matching Inteligente</span>
            </router-link>

            <router-link v-if="isDriver" to="/trips/publish" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Publicar Viaje</span>
            </router-link>

            <router-link to="/my-bookings" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span>Mis Reservas</span>
            </router-link>

            <router-link v-if="isDriver" to="/my-trips" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Mis Viajes</span>
            </router-link>

            <router-link to="/profile" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>{{ user?.name }}</span>
            </router-link>

            <div class="mobile-divider"></div>

            <button @click="handleLogout" class="mobile-nav-link mobile-logout">
              <svg class="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </template>

          <template v-else>
            <router-link to="/login" class="mobile-btn-primary" @click="closeMobileMenu">
              Iniciar Sesión
            </router-link>
            <router-link to="/register" class="mobile-btn-secondary" @click="closeMobileMenu">
              Registrarse
            </router-link>
          </template>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Header */
.app-header {
  background-color: var(--white-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Brand */
.brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.brand-link:hover {
  transform: scale(1.05);
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  color: var(--secondary-color);
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: -0.02em;
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 0.5rem;
}

.nav-link,
.nav-link-profile {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: var(--primary-text);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link-profile:hover {
  background-color: var(--background-color);
  color: var(--tertiary-color);
}

.nav-link.router-link-active,
.nav-link-profile.router-link-active {
  background-color: var(--tertiary-color);
  color: var(--tertiary-text);
}

.nav-link-profile {
  max-width: 150px;
}

.nav-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: transparent;
  border: 2px solid var(--error-color);
  border-radius: 0.5rem;
  color: var(--error-color);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background-color: var(--error-color);
  color: var(--tertiary-text);
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--tertiary-text);
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--primary-color);
}

.btn-secondary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  color: var(--primary-text);
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-menu-button:hover {
  background-color: var(--background-color);
}

.menu-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Mobile Menu */
.mobile-menu {
  background-color: var(--white-color);
  border-top: 1px solid var(--light-gray);
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.mobile-nav {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--primary-text);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  background-color: var(--background-color);
}

.mobile-nav-link.router-link-active {
  background-color: var(--tertiary-color);
  color: var(--tertiary-text);
}

.mobile-nav-link.mobile-logout {
  color: var(--error-color);
  background-color: transparent;
  border: 2px solid var(--error-color);
  cursor: pointer;
}

.mobile-nav-link.mobile-logout:hover {
  background-color: var(--error-color);
  color: var(--tertiary-text);
}

.mobile-nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.mobile-divider {
  height: 1px;
  background-color: var(--light-gray);
  margin: 0.5rem 0;
}

.mobile-btn-primary,
.mobile-btn-secondary {
  display: block;
  text-align: center;
  padding: 0.75rem;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.mobile-btn-primary {
  background-color: var(--primary-color);
  color: var(--tertiary-text);
}

.mobile-btn-secondary {
  background-color: var(--secondary-color);
  color: var(--primary-color);
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Tablet */
@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }

  .mobile-menu-button {
    display: none;
  }

  .brand-name {
    font-size: 1.75rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .header-container {
    padding: 1rem 1.5rem;
  }

  .desktop-nav {
    gap: 0.75rem;
  }

  .nav-link,
  .nav-link-profile {
    font-size: 0.9375rem;
    padding: 0.625rem 1rem;
  }
}
</style>
