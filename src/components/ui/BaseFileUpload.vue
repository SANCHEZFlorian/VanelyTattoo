<script setup>
import { ref, computed } from 'vue'
import { getImageUrl } from '../../utils/imageUtils'

const props = defineProps({
  modelValue: {
    type: [Array, String],
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: 'image/*',
  },
  maxSize: {
    type: Number,
    default: 5, // MB
  },
  showPreview: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const fileInput = ref(null)
const isDragging = ref(false)
const error = ref('')

const triggerSelect = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  processFiles(files)
}

const onDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files || [])
  processFiles(files)
}

const processFiles = (files) => {
  error.value = ''

  if (!files.length) return

  const newFiles = []

  for (const file of files) {
    // Validate size
    if (file.size > props.maxSize * 1024 * 1024) {
      error.value = `File ${file.name} is too large. Max size is ${props.maxSize}MB.`
      continue
    }

    // Create Object URL for preview/usage
    const url = URL.createObjectURL(file)
    newFiles.push({ url, file })
  }

  if (newFiles.length > 0) {
    if (props.multiple) {
      const current = Array.isArray(props.modelValue) ? props.modelValue : []
      // We store objects {url, file} for new files, and just {url} for existing ones
      const normalizedCurrent = current.map((item) =>
        typeof item === 'string' ? { url: item } : item,
      )
      emit('update:modelValue', [...normalizedCurrent, ...newFiles])
    } else {
      emit('update:modelValue', newFiles[0])
    }
    emit('change', newFiles)
  }
}

const removeFile = (index) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const newVal = [...props.modelValue]
    newVal.splice(index, 1)
    emit('update:modelValue', newVal)
  } else {
    emit('update:modelValue', null)
  }
}

// Normalized computed property to always treat modelValue as array for display
  return items.map((item) => (typeof item === 'string' ? getImageUrl(item) : item.url))
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>

    <div
      @click="triggerSelect"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg transition-colors duration-200 cursor-pointer"
      :class="{
        'border-purple-500 bg-purple-50': isDragging,
        'hover:border-purple-400': !isDragging,
      }"
    >
      <div class="space-y-1 text-center">
        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
        <div class="flex text-sm text-gray-600 justify-center">
          <label
            class="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
          >
            <span>Upload a file</span>
            <input
              ref="fileInput"
              type="file"
              class="sr-only"
              :multiple="multiple"
              :accept="accept"
              @change="handleFileSelect"
            />
          </label>
          <p class="pl-1">or drag and drop</p>
        </div>
        <p class="text-xs text-gray-500">PNG, JPG, GIF up to {{ maxSize }}MB</p>
      </div>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

    <!-- Previews -->
    <div
      v-if="showPreview && displayFiles.length > 0"
      class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div v-for="(file, index) in displayFiles" :key="index" class="relative group aspect-square">
        <img
          :src="file"
          class="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
        />
        <button
          @click.prevent="removeFile(index)"
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
          type="button"
        >
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>
