<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Sélectionner...'
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const search = ref('')
const containerRef = ref(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const s = search.value.toLowerCase()
  return props.options.filter(opt => opt.toLowerCase().includes(s))
})

const toggleOption = (option) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(option)
  if (index === -1) {
    newValue.push(option)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

const isSelected = (option) => props.modelValue.includes(option)

const displayText = computed(() => {
  if (props.modelValue.length === 0) return props.placeholder
  if (props.modelValue.length === 1) return props.modelValue[0]
  if (props.modelValue.length === props.options.length) return "Tout sélectionnés"
  return `${props.modelValue.length} sélectionnés`
})

const selectAll = () => {
  emit('update:modelValue', [...props.options])
}

const clearAll = () => {
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="relative w-full" ref="containerRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    
    <button
      type="button"
      @click="toggle"
      class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-left flex items-center justify-between hover:bg-white transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
    >
      <span class="text-sm text-gray-600 truncate mr-2" :class="{ 'text-gray-400': modelValue.length === 0 }">
        {{ displayText }}
      </span>
      <i 
        class="fas fa-chevron-down text-gray-400 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      ></i>
    </button>

    <!-- Dropdown -->
    <Transition name="fade-down">
      <div 
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <!-- Search -->
        <div class="p-2 border-b border-gray-50 flex items-center space-x-2">
          <i class="fas fa-search text-gray-400 text-xs ml-2"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher..."
            class="w-full text-xs px-2 py-1 outline-none"
            @click.stop
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between px-3 py-2 bg-gray-50/50">
           <button @click="selectAll" type="button" class="text-[10px] uppercase font-bold text-purple-600 hover:text-purple-700">Tout cocher</button>
           <button @click="clearAll" type="button" class="text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600">Tout décocher</button>
        </div>

        <!-- Options list -->
        <div class="max-h-60 overflow-y-auto custom-scrollbar bg-white">
          <div v-if="filteredOptions.length === 0" class="p-4 text-center text-gray-400 text-xs italic">
            Aucun résultat...
          </div>
          
          <div
            v-for="option in filteredOptions"
            :key="option"
            @click="toggleOption(option)"
            class="flex items-center px-4 py-2.5 hover:bg-purple-50 cursor-pointer transition-colors group"
          >
            <div 
              class="w-4 h-4 rounded border flex items-center justify-center transition-all mr-3"
              :class="isSelected(option) ? 'bg-purple-600 border-purple-600 shadow-sm' : 'border-gray-300 bg-white group-hover:border-purple-400'"
            >
              <i v-if="isSelected(option)" class="fas fa-check text-[10px] text-white"></i>
            </div>
            <span class="text-sm capitalize" :class="isSelected(option) ? 'text-gray-900 font-medium' : 'text-gray-600'">
              {{ option }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-down-enter-active, .fade-down-leave-active {
  transition: all 0.2s ease-out;
}
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>
