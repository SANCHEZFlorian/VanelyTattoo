<script setup>
import { ref, watch } from 'vue'
import { useMessageStore } from '../../stores/message'
import { usePromoStore } from '../../stores/promo'
import { useNotificationStore } from '../../stores/notification'
import { getImageUrl } from '../../utils/imageUtils'

const props = defineProps({
  isOpen: Boolean,
  item: Object,
  type: String,
  initialView: {
    type: String,
    default: 'details', // 'details' or 'booking'
  },
})

const emit = defineEmits(['close', 'book'])
const notificationStore = useNotificationStore()
const messageStore = useMessageStore()
const promoStore = usePromoStore()

const showBookingForm = ref(false)
const bookingForm = ref({
  name: '',
  email: '',
  phone: '',
  date: '', // Keeps calendar for specific availabilities
  time: '',
  message: '',
})

// Watch for modal opening to set initial state
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      showBookingForm.value = props.initialView === 'booking'
    }
  },
)

const closeModal = () => {
  showBookingForm.value = false
  bookingForm.value = { name: '', email: '', phone: '', date: '', time: '', message: '' }
  emit('close')
}

const isContactMode = ref(false)

const startBooking = (mode = 'booking') => {
  isContactMode.value = mode === 'contact'
  showBookingForm.value = true
}

const submitBooking = () => {
  if (!bookingForm.value.email && !bookingForm.value.phone) {
    notificationStore.addNotification(
      'Information manquante',
      'Veuillez renseigner au moins un email ou un numéro de téléphone.',
      'warning',
    )
    return
  }

  if (!isContactMode.value && !bookingForm.value.date) {
    notificationStore.addNotification('Date requise', 'Veuillez sélectionner une date.', 'warning')
    return
  }

  // Save as a message/inquiry linked to the item
  let msgContent = ''
  if (isContactMode.value) {
    msgContent = bookingForm.value.message || 'Je suis intéressé par ce flash.'
  } else {
    msgContent = `Date souhaitée: ${bookingForm.value.date} à ${bookingForm.value.time || 'Non spécifiée'}\n\n${bookingForm.value.message}`
  }

  messageStore.addMessage({
    from: bookingForm.value.name,
    email: bookingForm.value.email,
    phone: bookingForm.value.phone,
    subject: `Demande pour ${props.type === 'flash' ? 'Flash' : 'Projet'} : ${props.item.title}`,
    content: msgContent,
    relatedItemId: props.item.id, // Store ID link
    relatedItemType: props.type,
  })

  notificationStore.addNotification(
    'Demande envoyée',
    `Demande envoyée pour ${props.item.title} ! Nous vous recontacterons bientôt.`,
    'success',
  )
  closeModal()
}

const copyLink = () => {
  const url = `${window.location.origin}/flash?open=${props.item.id}`
  navigator.clipboard.writeText(url).then(() => {
    notificationStore.addNotification(
      'Lien copié',
      'Le lien vers ce flash a été copié dans le presse-papier.',
      'success',
    )
  })
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50 transition-opacity" @click="closeModal"></div>
      <div
        class="relative bg-white rounded-lg max-w-5xl w-full mx-auto shadow-xl transform transition-all"
      >
        <!-- Close button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 cursor-pointer whitespace-nowrap"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
        <!-- Modal content -->
        <div class="flex flex-col md:flex-row h-full md:h-auto">
          <!-- Left side - Image -->
          <div class="md:w-1/2 h-64 md:h-auto relative">
            <img
              :src="getImageUrl(item?.images?.[0])"
              :alt="item?.title"
              class="w-full h-full object-cover object-top rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>
          <!-- Right side - Details or Form -->
          <div class="md:w-1/2 p-8">
            <template v-if="!showBookingForm">
              <h2 class="text-3xl font-bold mb-4">{{ item?.title }}</h2>
              <!-- Flash tattoo specific content -->
              <div v-if="type === 'flash'" class="space-y-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="cat in item?.categories"
                    :key="cat"
                    class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm uppercase"
                  >
                    {{ cat }}
                  </span>
                </div>
                <div class="space-y-2">
                  <p class="text-gray-600">Taille: {{ item?.size }}</p>
                  <p class="text-gray-600">
                    Style:
                    {{ item?.color === 'color' ? 'Couleur' : 'Noir & Gris' }}
                  </p>
                  <p v-if="item?.description" class="text-gray-600 mt-2">{{ item.description }}</p>
                </div>
                <div class="flex items-center space-x-2 mt-4">
                  <span
                    v-if="
                      (item?.original_price && item?.original_price > item?.price) ||
                      (promoStore.activePromo && type === 'flash')
                    "
                    class="text-gray-400 line-through text-lg"
                    >{{ item?.original_price || item?.price }}€</span
                  >
                  <span class="text-3xl font-bold text-gray-800"
                    >{{
                      type === 'flash'
                        ? promoStore.activePromo
                          ? promoStore.getDiscountedPrice(item?.price, item?.id, item?.discount)
                          : item?.price
                        : item?.price
                    }}€</span
                  >
                  <span
                    v-if="
                      (item?.original_price && item?.original_price > item?.price) ||
                      (promoStore.activePromo && type === 'flash')
                    "
                    class="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold"
                  >
                    > -{{
                      promoStore.activePromo && type === 'flash'
                        ? promoStore.activePromo.discount_percent
                        : Math.round(
                            ((item?.original_price - item?.price) / item?.original_price) * 100,
                          )
                    }}%
                  </span>
                </div>
                <!-- Action Buttons: Booking & Contact -->
                <div class="flex flex-col gap-3 mt-6">
                  <button
                    @click="startBooking('booking')"
                    class="w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors cursor-pointer font-bold shadow-md"
                  >
                    Réserver ce Flash
                  </button>
                  <div class="flex gap-4">
                    <button
                      @click="startBooking('contact')"
                      class="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer font-bold text-center shadow-sm"
                    >
                      Contacter
                    </button>
                    <a
                      href="tel:+33612345678"
                      class="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer font-bold text-center shadow-sm flex items-center justify-center"
                    >
                      Appeler
                    </a>
                  </div>
                </div>
                <button
                  @click="copyLink"
                  class="mt-4 w-full bg-gray-100 text-gray-600 py-2 rounded-full hover:bg-gray-200 transition-colors !rounded-button cursor-pointer whitespace-nowrap font-medium text-sm flex items-center justify-center gap-2"
                >
                  <i class="fas fa-share-alt"></i> Partager le lien
                </button>
              </div>
              <!-- Gallery item specific content -->
              <div v-if="type === 'gallery'" class="space-y-4">
                <p class="text-gray-600">Catégorie: {{ item?.categories?.join(', ') }}</p>
                <div class="prose max-w-none text-gray-600">
                  <p>
                    Une pièce magnifique illustrant le style
                    {{ item?.categories ? item.categories.join(', ').toLowerCase() : '' }}. Ce
                    design démontre notre commitment à donner vie à vos personnages préférés.
                  </p>
                </div>
                <div class="flex flex-wrap gap-2 mt-4">
                  <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                    >Design Personnalisé</span
                  >
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="cat in item?.categories"
                      :key="cat"
                      class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm uppercase"
                    >
                      {{ cat }}
                    </span>
                  </div>
                </div>
                <button
                  @click="startBooking"
                  class="mt-6 w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap font-bold"
                >
                  Demander un projet similaire
                </button>
              </div>
            </template>

            <!-- Booking Form -->
            <template v-else>
              <div class="flex items-center mb-6">
                <button
                  @click="showBookingForm = false"
                  class="mr-3 text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <i class="fas fa-arrow-left"></i>
                </button>
                <h2 class="text-2xl font-bold">
                  {{
                    isContactMode
                      ? 'Contact / Question'
                      : type === 'gallery'
                        ? 'Demander un projet similaire'
                        : 'Réserver ce Flash'
                  }}
                </h2>
              </div>
              <form @submit.prevent="submitBooking" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    v-model="bookingForm.name"
                    type="text"
                    required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    v-model="bookingForm.email"
                    type="email"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    v-model="bookingForm.phone"
                    type="tel"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="06 12 34 56 78"
                  />
                  <p class="text-xs text-gray-500 mt-1">* Email ou Téléphone requis</p>
                </div>
                <div class="flex gap-4" v-if="!isContactMode">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Date souhaitée</label
                    >
                    <input
                      v-model="bookingForm.date"
                      type="date"
                      :required="!isContactMode"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Heure souhaitée</label
                    >
                    <input
                      v-model="bookingForm.time"
                      type="time"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Message (Optionnel)</label
                  >
                  <textarea
                    v-model="bookingForm.message"
                    rows="3"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Disponibilités, questions..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  class="w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap font-bold mt-2"
                >
                  Confirmer la demande
                </button>
              </form>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
