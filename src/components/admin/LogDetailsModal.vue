<script setup>
import BaseModal from '../ui/BaseModal.vue'

const props = defineProps({
  show: Boolean,
  log: Object,
})

const emit = defineEmits(['close'])

const formatValue = (val) => {
  if (val === null) return 'null'
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non'
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  return val
}

const getActionColor = (action) => {
  if (!action) return 'bg-gray-100 text-gray-800'
  if (action.includes('create')) return 'bg-green-100 text-green-800'
  if (action.includes('update')) return 'bg-blue-100 text-blue-800'
  if (action.includes('delete')) return 'bg-red-100 text-red-800'
  if (action.includes('auth')) return 'bg-purple-100 text-purple-800'
  if (action.includes('error')) return 'bg-red-50 text-red-600'
  return 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <BaseModal :show="show" title="Détails du Log" @close="$emit('close')">
    <div v-if="log" class="space-y-6">
      <!-- Summary Header -->
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div class="flex items-center gap-3 mb-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-bold uppercase"
            :class="getActionColor(log.action_type)"
          >
            {{ log.action_type }}
          </span>
          <span class="text-sm text-gray-500 font-mono">ID: {{ log.record_id || 'N/A' }}</span>
        </div>
        <div class="text-xs text-gray-400">
          {{
            new Date(log.created_at).toLocaleString('fr-FR', {
              dateStyle: 'full',
              timeStyle: 'medium',
            })
          }}
        </div>
      </div>

      <!-- Update Diff View -->
      <div v-if="log.details?.updates" class="border rounded-xl overflow-hidden">
        <div class="bg-blue-50 px-4 py-2 border-b border-blue-100 text-blue-800 font-bold text-sm">
          Modifications
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="(val, key) in log.details.updates"
            :key="key"
            class="p-3 grid grid-cols-3 gap-4 hover:bg-gray-50"
          >
            <div class="font-medium text-gray-600 text-sm break-words">{{ key }}</div>
            <div
              class="col-span-2 text-gray-900 font-mono text-xs break-all whitespace-pre-wrap bg-white p-2 border rounded"
            >
              {{ formatValue(val) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Full Details Dump -->
      <div class="border rounded-xl overflow-hidden">
        <div class="bg-gray-50 px-4 py-2 border-b border-gray-100 text-gray-700 font-bold text-sm">
          Payload Complet
        </div>
        <pre class="p-4 bg-gray-900 text-green-400 text-xs overflow-x-auto font-mono max-h-60">{{
          JSON.stringify(log.details, null, 2)
        }}</pre>
      </div>

      <div v-if="log.user_id" class="text-xs text-gray-400 text-right">
        Action effectuée par : {{ log.user_id }}
      </div>
    </div>
  </BaseModal>
</template>
