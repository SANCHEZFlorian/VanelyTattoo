<script setup>
import { ref, onMounted } from 'vue'
import { useMessageStore } from '@/stores/message'
import { useNotificationStore } from '@/stores/notification'

const messageStore = useMessageStore()
const notificationStore = useNotificationStore()
import { useInfoStore } from '@/stores/info'
const infoStore = useInfoStore()

onMounted(() => {
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      'Contactez Vanely Tattoo à Lyon. Devis gratuit pour votre projet tatouage, questions sur les soins ou prise de rendez-vous.',
    )
  }
})

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  file: null,
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      notificationStore.addNotification(
        'Erreur de fichier',
        'La taille du fichier dépasse la limite de 5Mo',
        'error',
      )
      event.target.value = ''
      return
    }
    contactForm.value.file = file
  }
}

const submitContactForm = async () => {
  const success = await messageStore.sendMessage(contactForm.value)

  if (success) {
    notificationStore.addNotification(
      'Message envoyé',
      'Votre message a bien été transmis. Nous vous répondrons bientôt.',
      'success',
    )

    // Reset form
    contactForm.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      file: null,
    }

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  } else {
    notificationStore.addNotification(
      'Erreur',
      "Une erreur est survenue lors de l'envoi du message.",
      'error',
    )
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">
      Contactez Vanely Tattoo - Lyon
    </h1>
    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Contact Form -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <form @submit.prevent="submitContactForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input
              v-model="contactForm.name"
              type="text"
              required
              placeholder="Votre nom complet"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="contactForm.email"
              type="email"
              required
              placeholder="votre@email.com"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <input
              v-model="contactForm.phone"
              type="tel"
              placeholder="06 12 34 56 78"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
            <input
              v-model="contactForm.subject"
              type="text"
              required
              placeholder="Demande de renseignements"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              v-model="contactForm.message"
              rows="4"
              required
              maxlength="500"
              placeholder="Bonjour, je souhaiterais..."
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
            <div class="text-sm text-gray-500 mt-1">
              {{ 500 - contactForm.message.length }} caractères restants
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Pièce jointe (optionnel)</label
            >
            <input
              type="file"
              @change="handleFileUpload"
              accept="image/*,.pdf"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p class="text-sm text-gray-500 mt-1">Taille max : 5Mo. Formats : Images, PDF</p>
          </div>
          <button
            type="submit"
            class="w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
          >
            Envoyer le message
          </button>
        </form>
      </div>
      <!-- Contact Information -->
      <div class="space-y-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold mb-6">Informations du studio</h2>
          <div class="grid lg:grid-cols-2 gap-8">
            <!-- Info List -->
            <div class="space-y-4">
              <div class="flex items-start space-x-4">
                <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                <div>
                  <h3 class="font-medium">Adresse</h3>
                  <p class="text-gray-600">{{ infoStore.generalInfo.address }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <i class="fas fa-phone text-blue-400 mt-1"></i>
                <div>
                  <h3 class="font-medium">Téléphone</h3>
                  <p class="text-gray-600">{{ infoStore.generalInfo.phone }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <i class="fas fa-envelope text-blue-400 mt-1"></i>
                <div>
                  <h3 class="font-medium">Email</h3>
                  <p class="text-gray-600">{{ infoStore.generalInfo.email }}</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <i class="fas fa-clock text-blue-400 mt-1"></i>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium">Horaires</h3>
                  <div class="text-gray-600 space-y-3">
                    <div
                      v-for="(group, index) in infoStore.groupedOpeningHours"
                      :key="index"
                      class="border-b border-gray-100 pb-2 last:border-0"
                    >
                      <p class="font-bold text-gray-800 mb-0.5">{{ group.label }}</p>
                      <p class="text-sm pl-4 border-l-2 border-blue-400 text-gray-500">
                        {{ group.time }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Google Map (Moved here) -->
            <div class="rounded-lg overflow-hidden h-64 lg:h-auto bg-gray-200">
              <iframe
                width="100%"
                height="100%"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                :src="`https://maps.google.com/maps?q=${encodeURIComponent(
                  infoStore.generalInfo.address,
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`"
              ></iframe>
            </div>
          </div>
        </div>
        <!-- Social Media -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold mb-6">Suivez-nous</h2>
          <div class="flex space-x-4">
            <a
              href="#"
              class="w-12 h-12 bg-pink-400 text-white rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors"
            >
              <i class="fab fa-instagram"></i>
            </a>
            <a
              href="#"
              class="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
            >
              <i class="fab fa-tiktok"></i>
            </a>
            <a
              href="#"
              class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <i class="fab fa-facebook"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.\!rounded-button {
  border-radius: 9999px;
}
</style>
