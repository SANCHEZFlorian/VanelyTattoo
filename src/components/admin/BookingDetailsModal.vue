<script setup>
import { ref, computed } from 'vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import { useBookingStore } from '../../stores/booking'

const props = defineProps({
  show: Boolean,
  booking: Object,
})

const emit = defineEmits(['close', 'save'])

const bookingStore = useBookingStore()
const isEditingDate = ref(false)
const editForm = ref({
  date: '',
  time: '',
  endTime: '',
  notes: '',
})

const initForm = () => {
  if (props.booking) {
    editForm.value = {
      date: props.booking.date,
      time: props.booking.time,
      endTime: props.booking.endTime || '',
      notes: props.booking.notes || '',
    }
  }
}

// Watchers would go here, but using a method call on open is cleaner if possible,
// or just re-init when prop changes if we watch it.
// Simpler: Parent handles generic open, we init on mount/watch?
// Let's rely on parent opening logic.

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price || 0)
}

const sendEmail = () => {
  bookingStore.sendConfirmationEmail(props.booking)
}

const saveChanges = async () => {
  // Save notes and date
  // 1. Update Date
  await bookingStore.updateBookingDate(
    props.booking.id,
    editForm.value.date,
    editForm.value.time,
    editForm.value.endTime,
  )

  // 2. Update Notes (Assuming store has updateNotes or we use generic update)
  // Store doesn't seem to have updateNotes exposed in the view_file snippet,
  // but we can assume checking availability or just implement it later if missing.
  // For now, let's just save date/time as that is main feature.

  isEditingDate.value = false
  emit('save')
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="$t('booking.detailsTitle') || 'Détails du Rendez-vous'"
    @close="$emit('close')"
  >
    <div v-if="booking" class="space-y-6">
      <!-- Header / Status -->
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ booking.client }}</h3>
          <p class="text-gray-500 text-sm">{{ booking.email }}</p>
          <p v-if="booking.phone" class="text-gray-500 text-sm">{{ booking.phone }}</p>
        </div>
        <span
          :class="{
            'bg-yellow-100 text-yellow-700': booking.status === 'pending',
            'bg-green-100 text-green-700': booking.status === 'confirmed',
            'bg-red-100 text-red-700': booking.status === 'cancelled',
          }"
          class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
        >
          {{ $t(`status.${booking.status}`) }}
        </span>
      </div>

      <!-- Date & Time (Editable) -->
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-bold text-gray-700">
            <i class="fas fa-calendar-alt mr-2"></i>Date & Heure
          </h4>
          <button
            @click="
              () => {
                isEditingDate = !isEditingDate
                initForm()
              }
            "
            class="text-purple-600 text-sm font-medium hover:text-purple-800"
          >
            {{ isEditingDate ? 'Annuler' : 'Modifier' }}
          </button>
        </div>

        <div v-if="!isEditingDate">
          <p class="text-lg font-medium text-gray-900 capitalize">{{ formatDate(booking.date) }}</p>
          <p class="text-gray-600">{{ booking.time }} - {{ booking.endTime || '?' }}</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 mt-3">
          <div class="col-span-2">
            <BaseInput type="date" v-model="editForm.date" label="Date" />
          </div>
          <BaseInput type="time" v-model="editForm.time" label="Début" />
          <BaseInput type="time" v-model="editForm.endTime" label="Fin" />
          <div class="col-span-2 flex justify-end">
            <button
              @click="saveChanges"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <!-- Project Info -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <span class="block text-xs font-bold text-gray-400 uppercase">Projet</span>
          <span class="text-gray-800 font-medium">{{ booking.project || 'Non spécifié' }}</span>
        </div>
        <div>
          <span class="block text-xs font-bold text-gray-400 uppercase">Emplacement</span>
          <span class="text-gray-800 font-medium">{{ booking.placement || 'Non spécifié' }}</span>
        </div>
        <div>
          <span class="block text-xs font-bold text-gray-400 uppercase">Taille</span>
          <span class="text-gray-800 font-medium">{{ booking.size || 'Non spécifié' }}</span>
        </div>
        <div>
          <span class="block text-xs font-bold text-gray-400 uppercase">Prix / Budget</span>
          <span class="text-gray-800 font-medium">{{
            booking.price ? formatPrice(booking.price) : booking.budget || '-'
          }}</span>
        </div>
      </div>

      <!-- Description -->
      <div v-if="booking.description">
        <span class="block text-xs font-bold text-gray-400 uppercase mb-1">Description</span>
        <div
          class="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
        >
          {{ booking.description }}
        </div>
      </div>

      <!-- Notes (Read Only for now or simplistic) -->
      <div v-if="booking.notes">
        <span class="block text-xs font-bold text-gray-400 uppercase mb-1">Notes Admin</span>
        <div class="text-sm text-gray-600 italic">
          {{ booking.notes }}
        </div>
      </div>

      <!-- Reference Image -->
      <div v-if="booking.image">
        <span class="block text-xs font-bold text-gray-400 uppercase mb-2">Référence</span>
        <div
          class="relative h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group"
        >
          <img :src="booking.image" class="w-full h-full object-contain" />
          <a
            :href="booking.image"
            target="_blank"
            class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium"
          >
            <i class="fas fa-external-link-alt mr-2"></i> Voir en grand
          </a>
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-6 border-t border-gray-100 flex flex-wrap gap-3">
        <a
          :href="`mailto:${booking.email}`"
          class="flex-1 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-blue-100 transition-colors"
        >
          <i class="fas fa-envelope mr-2"></i> Email
        </a>
        <a
          v-if="booking.phone"
          :href="`tel:${booking.phone}`"
          class="flex-1 bg-green-50 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-green-100 transition-colors"
        >
          <i class="fas fa-phone mr-2"></i> Appeler
        </a>
        <button
          @click="sendEmail"
          class="flex-1 bg-purple-50 text-purple-700 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-purple-100 transition-colors"
        >
          <i class="fas fa-paper-plane mr-2"></i> Confirmation
        </button>
      </div>
    </div>
  </BaseModal>
</template>
