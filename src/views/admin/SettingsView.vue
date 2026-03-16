<script setup>
import { ref, computed } from 'vue'
import { useInfoStore } from '../../stores/info'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../../stores/notification'
import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'

const infoStore = useInfoStore()
const notificationStore = useNotificationStore()
const activeTab = ref('general')
const { t } = useI18n()

const tabs = computed(() => [
  { id: 'general', label: t('settings.sections.general') },
  { id: 'socials', label: t('settings.sections.socials') },
  { id: 'about', label: t('settings.sections.about') },
  { id: 'steps', label: t('settings.sections.steps') },
  { id: 'carousel', label: t('settings.sections.carousel') },
  { id: 'legal', label: t('settings.sections.legal') },
])

// Steps Management
const newStep = ref({ title: '', description: '', icon: '', image: '' })
const addStep = () => {
  if (newStep.value.title) {
    infoStore.steps.push({ ...newStep.value, id: Date.now() })
    newStep.value = { title: '', description: '', icon: '', image: '' }
  }
}
const removeStep = (index) => {
  infoStore.steps.splice(index, 1)
}

// Carousel Management
const newSlide = ref({ image: '', title: '', subtitle: '' })
const addSlide = () => {
  if (newSlide.value.image) {
    infoStore.carousel.push({ ...newSlide.value, id: Date.now() })
    newSlide.value = { image: '', title: '', subtitle: '' }
  }
}
const removeSlide = (index) => {
  infoStore.carousel.splice(index, 1)
}

// About Section Management
const addCertification = () => {
  if (!infoStore.about.certifications) infoStore.about.certifications = []
  infoStore.about.certifications.push('')
}
const removeCertification = (index) => {
  infoStore.about.certifications.splice(index, 1)
}

const addAboutStyle = () => {
  if (!infoStore.about.style) infoStore.about.style = []
  infoStore.about.style.push({ name: '', icon: 'fas fa-star' })
}
const removeAboutStyle = (index) => {
  infoStore.about.style.splice(index, 1)
}

const availableIcons = [
  'fas fa-star',
  'fas fa-gamepad',
  'fas fa-heart',
  'fas fa-skull',
  'fas fa-leaf',
  'fas fa-palette',
  'fas fa-pen-nib',
  'fas fa-camera',
  'fas fa-dragon',
  'fas fa-ghost',
  'fas fa-bolt',
  'fas fa-gem',
]

const saveSettings = () => {
  const currentTab = tabs.value.find((t) => t.id === activeTab.value)
  const context = currentTab ? currentTab.label : ''
  notificationStore.addNotification(
    `Paramètres ${context.toLowerCase()}`,
    t('settings.saveSuccess'),
    'success',
  )
}

// Address Autocomplete
const addressQuery = ref('')
const addressSuggestions = ref([])
const isSearchingAddress = ref(false)
let searchTimeout = null

const searchAddress = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!addressQuery.value || addressQuery.value.length < 3) {
    addressSuggestions.value = []
    return
  }

  isSearchingAddress.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addressQuery.value,
        )}`,
      )
      const data = await response.json()
      addressSuggestions.value = data
    } catch (error) {
      console.error('Error fetching address:', error)
    } finally {
      isSearchingAddress.value = false
    }
  }, 500)
}

const selectAddress = (suggestion) => {
  infoStore.generalInfo.address = suggestion.display_name
  addressQuery.value = ''
  addressSuggestions.value = []
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        @click="saveSettings"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-save"></i>
        {{ $t('settings.save') || 'Enregistrer' }}
      </button>
    </div>

    <!-- Content Card -->
    <div
      class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
    >
      <!-- Tabs Header -->
      <div class="border-b border-gray-100 bg-gray-50/50 flex overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-4 text-sm font-medium whitespace-nowrap focus:outline-none transition-colors border-b-2',
            activeTab === tab.id
              ? 'text-purple-600 border-purple-600 bg-white'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-6 md:p-8">
        <!-- General Info Tab -->
        <div v-if="activeTab === 'general'" class="space-y-8 animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{
                $t('settings.general.address')
              }}</label>
              <div class="relative space-y-2">
                <input
                  v-model="infoStore.generalInfo.address"
                  type="text"
                  disabled
                  class="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 outline-none cursor-not-allowed text-sm"
                />
                <div class="relative">
                  <i
                    class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  ></i>
                  <input
                    v-model="addressQuery"
                    @input="searchAddress"
                    type="text"
                    placeholder="Rechercher une adresse..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
                  />
                  <div v-if="isSearchingAddress" class="absolute right-3 top-2.5">
                    <i class="fas fa-spinner fa-spin text-purple-500"></i>
                  </div>
                  <!-- Suggestions Dropdown -->
                  <div
                    v-if="addressSuggestions.length > 0"
                    class="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  >
                    <ul>
                      <li
                        v-for="(suggestion, index) in addressSuggestions"
                        :key="index"
                        @click="selectAddress(suggestion)"
                        class="px-4 py-3 hover:bg-purple-50 cursor-pointer text-sm border-b last:border-b-0 border-gray-100 text-gray-700"
                      >
                        {{ suggestion.display_name }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">{{
                $t('settings.general.phone')
              }}</label>
              <input
                v-model="infoStore.generalInfo.phone"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-2">{{
                $t('settings.general.email')
              }}</label>
              <input
                v-model="infoStore.generalInfo.email"
                type="email"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <h4 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i class="fas fa-clock text-purple-500"></i>
              {{ $t('settings.general.hours') }}
            </h4>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div
                v-for="(hours, day) in infoStore.generalInfo.openingHours"
                :key="day"
                class="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-purple-100 transition-colors"
              >
                <!-- Day & Toggle -->
                <div
                  class="flex items-center justify-between sm:justify-start w-full sm:w-48 mb-4 sm:mb-0"
                >
                  <span class="capitalize font-bold text-gray-700 w-24">{{ day }}</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="hours.isOpen" class="sr-only peer" />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"
                    ></div>
                  </label>
                </div>

                <!-- Hours -->
                <div
                  v-if="hours.isOpen"
                  class="flex-grow flex flex-col sm:flex-row gap-4 sm:pl-6 sm:border-l border-gray-200"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 uppercase font-bold w-12">Matin</span>
                    <div
                      class="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <input
                        v-model="hours.morning.start"
                        type="time"
                        class="bg-transparent outline-none w-20 text-sm text-center"
                      />
                      <span class="text-gray-300 mx-1">-</span>
                      <input
                        v-model="hours.morning.end"
                        type="time"
                        class="bg-transparent outline-none w-20 text-sm text-center"
                      />
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 uppercase font-bold w-12">Après-m</span>
                    <div
                      class="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <input
                        v-model="hours.afternoon.start"
                        type="time"
                        class="bg-transparent outline-none w-20 text-sm text-center"
                      />
                      <span class="text-gray-300 mx-1">-</span>
                      <input
                        v-model="hours.afternoon.end"
                        type="time"
                        class="bg-transparent outline-none w-20 text-sm text-center"
                      />
                    </div>
                  </div>
                </div>
                <div v-else class="flex-grow pl-6 text-gray-400 italic text-sm">
                  Fermé toute la journée
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Socials Tab -->
        <div v-if="activeTab === 'socials'" class="space-y-6 max-w-3xl animate-fade-in">
          <div class="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div
              class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600"
            >
              <i class="fab fa-facebook text-xl"></i>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{
                $t('settings.socials.facebook')
              }}</label>
              <input
                v-model="infoStore.socials.facebook"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div
              class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-600"
            >
              <i class="fab fa-instagram text-xl"></i>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{
                $t('settings.socials.instagram')
              }}</label>
              <input
                v-model="infoStore.socials.instagram"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
          <div class="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div
              class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-black"
            >
              <i class="fab fa-tiktok text-xl"></i>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{
                $t('settings.socials.tiktok')
              }}</label>
              <input
                v-model="infoStore.socials.tiktok"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
        </div>

        <!-- About Tab -->
        <div v-if="activeTab === 'about'" class="space-y-8 animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Titre de la section
              </label>
              <input
                v-model="infoStore.about.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              />
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-2"> Description </label>
              <textarea
                v-model="infoStore.about.description"
                rows="5"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              ></textarea>
            </div>

            <!-- Styles Management -->
            <div class="col-span-1 md:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <label class="text-lg font-bold text-gray-800">Mon style</label>
                <button
                  @click="addAboutStyle"
                  class="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors"
                >
                  <i class="fas fa-plus mr-1"></i> Ajouter un style
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(style, index) in infoStore.about.style"
                  :key="index"
                  class="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                >
                  <div class="relative group">
                    <div
                      class="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-pink-500 cursor-pointer hover:bg-pink-50 transition-colors"
                    >
                      <i :class="style.icon"></i>
                    </div>
                    <!-- Simple Icon Picker -->
                    <div
                      class="absolute top-full left-0 mt-2 z-20 bg-white border border-gray-100 rounded-xl shadow-xl p-3 grid grid-cols-4 gap-2 hidden group-hover:grid w-48"
                    >
                      <button
                        v-for="icon in availableIcons"
                        :key="icon"
                        @click="style.icon = icon"
                        class="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        :class="{ 'text-pink-600 bg-pink-50': style.icon === icon }"
                      >
                        <i :class="icon"></i>
                      </button>
                    </div>
                  </div>
                  <input
                    v-model="style.name"
                    type="text"
                    placeholder="Nom du style"
                    class="flex-1 px-4 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 focus:bg-white transition-colors text-sm"
                  />
                  <button
                    @click="removeAboutStyle(index)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-200 hover:shadow-sm flex items-center justify-center transition-all"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Certifications Management -->
            <div class="col-span-1 md:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <label class="text-lg font-bold text-gray-800">Certifications</label>
                <button
                  @click="addCertification"
                  class="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors"
                >
                  <i class="fas fa-plus mr-1"></i> Ajouter une certification
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(cert, index) in infoStore.about.certifications"
                  :key="index"
                  class="flex gap-2"
                >
                  <input
                    v-model="infoStore.about.certifications[index]"
                    type="text"
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                  <button
                    @click="removeCertification(index)"
                    class="w-10 h-10 rounded-xl bg-white border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-200 hover:shadow-sm flex items-center justify-center transition-all"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="col-span-1 md:col-span-2">
              <BaseFileUpload
                v-model="infoStore.about.image"
                label="Photo de profil de l'artiste"
                :multiple="false"
              />
            </div>
          </div>
        </div>

        <!-- Steps Tab -->
        <div v-if="activeTab === 'steps'" class="space-y-8 animate-fade-in">
          <!-- List -->
          <div class="space-y-6">
            <div
              v-for="(step, index) in infoStore.steps"
              :key="step.id"
              class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start gap-6 group hover:shadow-md transition-all"
            >
              <div
                class="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-xl shadow-sm flex-shrink-0"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1 w-full space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
                      >Titre</label
                    >
                    <input
                      v-model="step.title"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
                      >Icone (FontAwesome)</label
                    >
                    <div class="relative">
                      <i
                        :class="step.icon"
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      ></i>
                      <input
                        v-model="step.icon"
                        type="text"
                        :placeholder="$t('settings.steps.icon')"
                        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
                    >Description</label
                  >
                  <textarea
                    v-model="step.description"
                    rows="2"
                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-pink-500 outline-none"
                  ></textarea>
                </div>
                <BaseFileUpload
                  v-model="step.image"
                  label="Image d'illustration"
                  :multiple="false"
                />
              </div>
              <button
                @click="removeStep(index)"
                class="text-gray-300 hover:text-red-500 transition-colors p-2"
              >
                <i class="fas fa-trash text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Add New -->
          <div class="border-t border-gray-100 pt-8">
            <h4 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i class="fas fa-plus-circle text-purple-600"></i>
              {{ $t('settings.steps.add') }}
            </h4>
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  v-model="newStep.title"
                  type="text"
                  :placeholder="$t('settings.steps.title')"
                  class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  v-model="newStep.icon"
                  type="text"
                  :placeholder="$t('settings.steps.icon')"
                  class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <textarea
                v-model="newStep.description"
                :placeholder="$t('settings.steps.description')"
                rows="2"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              ></textarea>
              <div class="mb-4">
                <BaseFileUpload
                  v-model="newStep.image"
                  label="Image d'illustration"
                  :multiple="false"
                />
              </div>
              <button
                @click="addStep"
                class="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-purple-700 hover:shadow-lg transition-all"
              >
                {{ $t('settings.steps.addBtn') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Carousel Tab -->
        <div v-if="activeTab === 'carousel'" class="space-y-8 animate-fade-in">
          <!-- List -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(slide, index) in infoStore.carousel"
              :key="slide.id"
              class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-all"
            >
              <div class="relative h-40 mb-4 rounded-xl overflow-hidden bg-gray-100">
                <img :src="slide.image" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"
                ></div>
                <button
                  @click="removeSlide(index)"
                  class="absolute top-2 right-2 bg-white text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-300 hover:bg-red-50"
                >
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Titre</label>
                  <input
                    v-model="slide.title"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
                    >Sous-titre</label
                  >
                  <input
                    v-model="slide.subtitle"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
                    >URL Image</label
                  >
                  <input
                    v-model="slide.image"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-400 focus:ring-2 focus:ring-purple-500 outline-none truncate"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Add New -->
          <div class="border-t border-gray-100 pt-8">
            <h4 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i class="fas fa-plus-circle text-purple-600"></i>
              {{ $t('settings.carousel.add') }}
            </h4>
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
              <div class="grid grid-cols-1 gap-4">
                <input
                  v-model="newSlide.image"
                  type="text"
                  :placeholder="$t('settings.carousel.image')"
                  class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  v-model="newSlide.title"
                  type="text"
                  :placeholder="$t('settings.carousel.title')"
                  class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  v-model="newSlide.subtitle"
                  type="text"
                  :placeholder="$t('settings.carousel.subtitle')"
                  class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <button
                @click="addSlide"
                class="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-purple-700 hover:shadow-lg transition-all"
              >
                {{ $t('settings.carousel.addBtn') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Legal Tab -->
        <div v-if="activeTab === 'legal'" class="space-y-8 animate-fade-in">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Mentions Légales</label>
              <textarea
                v-model="infoStore.legal.mentions"
                rows="10"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono bg-gray-50 focus:bg-white transition-colors"
                placeholder="Insérez vos mentions légales ici..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2"
                >Conditions Générales de Vente</label
              >
              <textarea
                v-model="infoStore.legal.cgv"
                rows="10"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono bg-gray-50 focus:bg-white transition-colors"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2"
                >Politique de Confidentialité</label
              >
              <textarea
                v-model="infoStore.legal.privacy"
                rows="10"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-mono bg-gray-50 focus:bg-white transition-colors"
              ></textarea>
            </div>
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
