<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useClientStore } from '../../stores/client'
import { usePromoStore } from '../../stores/promo'

const router = useRouter()
const authStore = useAuthStore()
const clientStore = useClientStore()
const promoStore = usePromoStore()

onMounted(async () => {
  // Ensure we have profile
  if (!clientStore.clientProfile) {
    await clientStore.fetchClientProfile()
  }
  // Fetch wishlist
  await clientStore.fetchWishlist()
  // Fetch promos for price calculation
  await promoStore.fetchPromotions()
  await promoStore.fetchActiveGlobalPromo()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/client/login')
}

const removeFromWishlist = async (flashId) => {
  await clientStore.removeFromWishlist(flashId)
}

const goToFlash = (id) => {
  router.push(`/flash?open=${id}`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Mon Espace</h1>
        <p v-if="clientStore.clientProfile" class="text-gray-600">
          Bonjour,
          <span class="font-semibold">{{
            clientStore.clientProfile.full_name || authStore.user?.email
          }}</span>
          !
        </p>
      </div>
      <button
        @click="handleLogout"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition-colors text-sm font-medium"
      >
        <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
      </button>
    </div>

    <!-- Wishlist Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
        <i class="fas fa-heart text-pink-500"></i> Ma Liste de Souhaits
      </h2>

      <div v-if="clientStore.wishlist.length === 0" class="text-center py-12 text-gray-500">
        <i class="far fa-heart text-4xl mb-4 text-gray-300"></i>
        <p>Votre liste de souhaits est vide.</p>
        <router-link to="/flash" class="text-purple-600 hover:underline mt-2 inline-block">
          Découvrir les flashs
        </router-link>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="flash in clientStore.wishlist"
          :key="flash.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 group"
        >
          <div class="relative cursor-pointer" @click="goToFlash(flash.id)">
            <img
              :src="
                flash.images && flash.images[0] ? flash.images[0] : '/images/generic_tattoo.png'
              "
              :alt="flash.title"
              class="w-full h-48 object-cover object-top"
            />
            <!-- Remove Button -->
            <button
              @click.stop="removeFromWishlist(flash.id)"
              class="absolute top-2 right-2 bg-white/90 text-red-500 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm z-10"
              title="Retirer des favoris"
            >
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-800 mb-1 truncate">{{ flash.title }}</h3>
            <div class="flex items-center space-x-2">
              <span
                v-if="
                  (flash.original_price && flash.original_price > flash.price) ||
                  promoStore.activePromo
                "
                class="text-gray-400 line-through text-xs"
              >
                {{ flash.original_price || flash.price }}€
              </span>
              <span class="font-bold text-purple-600">
                {{
                  promoStore.activePromo
                    ? promoStore.getDiscountedPrice(flash.price, flash.id, flash.discount)
                    : flash.price
                }}€
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
