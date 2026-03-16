<script setup>
import BaseModal from '../ui/BaseModal.vue'

const props = defineProps({
  show: Boolean,
  message: Object,
})

const emit = defineEmits(['close'])

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="'Détails du message'"
    @close="$emit('close')"
  >
    <div v-if="message" class="space-y-6">
      <!-- Header -->
      <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <h3 class="text-xl font-bold text-gray-900 mb-1">{{ message.subject }}</h3>
        <div class="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600">
          <span
            >De: <span class="font-medium text-gray-800">{{ message.from }}</span></span
          >
          <span>{{ formatDate(message.date) }}</span>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          :href="`mailto:${message.email}`"
          class="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
        >
          <div
            class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform"
          >
            <i class="fas fa-envelope"></i>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Email</div>
            <div class="text-gray-800 font-medium break-all">{{ message.email }}</div>
          </div>
        </a>

        <a
          v-if="message.phone"
          :href="`tel:${message.phone}`"
          class="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
        >
          <div
            class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform"
          >
            <i class="fas fa-phone"></i>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Téléphone</div>
            <div class="text-gray-800 font-medium">{{ message.phone }}</div>
          </div>
        </a>
      </div>

      <!-- Message Body -->
      <div>
        <span class="block text-xs font-bold text-gray-400 uppercase mb-2">Message</span>
        <div
          class="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100"
        >
          {{ message.message }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end pt-4 border-t border-gray-100">
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  </BaseModal>
</template>
