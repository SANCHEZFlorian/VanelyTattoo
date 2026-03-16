<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirmation',
  },
  message: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    default: 'Confirmer',
  },
  cancelLabel: {
    type: String,
    default: 'Annuler',
  },
  type: {
    type: String,
    default: 'danger', // danger, info, warning
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div
              :class="{
                'bg-red-100 text-red-600': type === 'danger',
                'bg-blue-100 text-blue-600': type === 'info',
                'bg-amber-100 text-amber-600': type === 'warning',
              }"
              class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <i
                :class="{
                  'fas fa-exclamation-triangle': type === 'danger' || type === 'warning',
                  'fas fa-info-circle': type === 'info',
                }"
                class="text-xl"
              ></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
          </div>

          <p class="text-gray-600 text-sm leading-relaxed">
            {{ message }}
          </p>
        </div>

        <div class="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-2">
          <button
            @click="$emit('confirm')"
            :class="{
              'bg-red-600 hover:bg-red-700': type === 'danger',
              'bg-blue-600 hover:bg-blue-700': type === 'info',
              'bg-amber-600 hover:bg-amber-700': type === 'warning',
            }"
            class="w-full sm:w-auto px-4 py-2 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            {{ confirmLabel }}
          </button>
          <button
            @click="$emit('cancel')"
            class="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
          >
            {{ cancelLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
