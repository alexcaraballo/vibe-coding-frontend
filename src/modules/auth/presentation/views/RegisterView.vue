<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AppLayout from '@/shared/components/AppLayout.vue'
import ErrorBanner from '@/shared/components/ErrorBanner.vue'
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'

const router = useRouter()
const { register, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const name = ref('')
const phone = ref('')
const role = ref<'passenger' | 'driver' | 'both'>('passenger')

const handleRegister = async () => {
  const success = await register({
    email: email.value,
    password: password.value,
    name: name.value,
    phone: phone.value,
    role: role.value
  })

  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Registrarse</h1>

        <ErrorBanner :message="error" @dismiss="error = null" />

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2"> Nombre </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2"> Email </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              id="phone"
              v-model="phone"
              type="tel"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+34600000000"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Rol </label>
            <div class="space-y-2">
              <label class="flex items-center cursor-pointer">
                <input v-model="role" type="radio" value="passenger" class="mr-2" />
                <span class="text-gray-800">Pasajero</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input v-model="role" type="radio" value="driver" class="mr-2" />
                <span class="text-gray-800">Conductor</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input v-model="role" type="radio" value="both" class="mr-2" />
                <span class="text-gray-800">Ambos</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" />
            <span v-else>Registrarse</span>
          </button>
        </form>

        <p class="mt-6 text-center text-gray-600">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Inicia sesión
          </router-link>
        </p>
      </div>
    </div>
  </AppLayout>
</template>
