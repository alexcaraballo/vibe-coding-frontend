<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const { login, loading, error } = useAuth()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await login({ username: email.value, password: password.value })

  if (success) {
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold mb-6 text-center" style="color: var(--primary-text)">
          Iniciar Sesión
        </h1>

        <ErrorBanner :message="error" @dismiss="error = null" />

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label
              for="email"
              class="block text-sm font-medium mb-2"
              style="color: var(--primary-text)"
            >
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style="border-color: var(--light-gray); --tw-ring-color: var(--primary-color)"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium mb-2"
              style="color: var(--primary-text)"
            >
              Contraseña
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style="border-color: var(--light-gray); --tw-ring-color: var(--primary-color)"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            style="background-color: var(--primary-color); color: var(--tertiary-text)"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" />
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>

        <p class="mt-6 text-center" style="color: var(--secondary-text)">
          ¿No tienes cuenta?
          <router-link
            to="/register"
            class="hover:opacity-80 font-medium"
            style="color: var(--primary-color)"
          >
            Regístrate
          </router-link>
        </p>
      </div>
    </div>
  </AppLayout>
</template>
