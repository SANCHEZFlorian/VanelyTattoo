<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '../../stores/client'

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const router = useRouter()
const clientStore = useClientStore()

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Les mots de passe ne correspondent pas')
    return
  }

  loading.value = true
  const success = await clientStore.registerClient(
    email.value,
    password.value,
    fullName.value,
    phone.value,
  )

  if (success) {
    // Auto-login logic usually handled by Supabase signUp (if auto confirm on),
    // but strict flow might require email confirmation.
    // For now, redirect to login or dashboard.
    // If Supabase session is created immediately (config dependent), we can go to dashboard
    // But let's send to Login for safety/clarity unless we check session.
    router.push('/client/login')
  }
  loading.value = false
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Créer un compte</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link to="/client/login" class="font-medium text-purple-600 hover:text-purple-500">
            se connecter à un compte existant
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom complet</label>
          <input
            v-model="fullName"
            type="text"
            required
            class="mt-1 appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="mt-1 appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            v-model="phone"
            type="tel"
            class="mt-1 appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Confirmer mot de passe</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="mt-1 appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            S'inscrire
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
