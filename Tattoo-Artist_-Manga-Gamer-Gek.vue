<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <!-- Promo Banner -->
      <div
        class="bg-gradient-to-r from-pink-400 to-blue-400 text-white text-center py-2 text-sm"
      >
        <div class="animate-pulse">
          🎨 Special Offer: 2nd Tattoo 50% OFF | Flash Tattoos 20% OFF 🎨
        </div>
      </div>
      <nav
        class="container mx-auto px-4 py-4 flex items-center justify-between"
      >
        <div class="flex items-center space-x-4">
          <div class="text-2xl font-bold text-gray-800">InkManga Studio</div>
        </div>
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{
              'text-blue-400 border-b-2 border-blue-400': activeTab === tab.id,
            }"
            class="text-gray-700 hover:text-blue-400 transition-colors py-2 cursor-pointer whitespace-nowrap"
          >
            {{ tab.name }}
          </button>
        </div>
        <!-- Search Bar -->
        <div class="hidden md:flex items-center relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tattoos, gallery, blog..."
            class="w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <i class="fas fa-search absolute right-3 text-gray-400"></i>
        </div>
        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden cursor-pointer"
        >
          <i class="fas fa-bars text-xl"></i>
        </button>
      </nav>
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t">
        <div class="px-4 py-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>
        <div class="flex flex-col">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="
              activeTab = tab.id;
              mobileMenuOpen = false;
            "
            :class="{ 'bg-blue-50 text-blue-400': activeTab === tab.id }"
            class="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
    </header>
    <!-- Main Content -->
    <main class="pt-32 min-h-screen">
      <!-- Home Component -->
      <div v-if="activeTab === 'home'" class="space-y-16">
        <!-- Hero Section -->
        <section
          class="relative h-96 bg-gradient-to-r from-pink-100 to-blue-100 overflow-hidden"
        >
          <div class="absolute inset-0">
            <img
              src="https://readdy.ai/api/search-image?query=professional%20tattoo%20artist%20workspace%20with%20manga%20anime%20posters%20on%20walls%2C%20modern%20clean%20studio%20interior%20with%20tattoo%20equipment%2C%20neon%20lighting%20accents%2C%20artistic%20atmosphere%20with%20ink%20bottles%20and%20drawing%20tablets%2C%20contemporary%20design&width=1440&height=400&seq=hero001&orientation=landscape"
              alt="Tattoo Studio"
              class="w-full h-full object-cover object-top"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent"
            ></div>
          </div>
          <div class="relative container mx-auto px-4 h-full flex items-center">
            <div class="max-w-lg">
              <h1 class="text-5xl font-bold text-gray-800 mb-4">
                Manga & Gaming Tattoos
              </h1>
              <p class="text-xl text-gray-600 mb-6">
                Bringing your favorite characters to life with unique, custom
                designs
              </p>
              <button
                @click="activeTab = 'booking'"
                class="bg-blue-400 text-white px-8 py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
              >
                Book Now
              </button>
            </div>
          </div>
        </section>
        <!-- Featured Work -->
        <section class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Featured Work</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div
              v-for="work in featuredWorks"
              :key="work.id"
              class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <img
                :src="work.image"
                :alt="work.title"
                class="w-full h-64 object-cover object-top"
              />
              <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">{{ work.title }}</h3>
                <p class="text-gray-600">{{ work.description }}</p>
              </div>
            </div>
          </div>
        </section>
        <!-- Latest Blog Posts -->
        <section class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">Latest News</h2>
          <div class="grid md:grid-cols-2 gap-8">
            <article
              v-for="post in latestPosts"
              :key="post.id"
              class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <img
                :src="post.image"
                :alt="post.title"
                class="w-full h-48 object-cover object-top"
              />
              <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">{{ post.title }}</h3>
                <p class="text-gray-600 mb-4">{{ post.excerpt }}</p>
                <span class="text-sm text-blue-400">{{ post.date }}</span>
              </div>
            </article>
          </div>
        </section>
      </div>
      <!-- About Component -->
      <div v-if="activeTab === 'about'" class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://readdy.ai/api/search-image?query=professional%20female%20tattoo%20artist%20in%20modern%20studio%20wearing%20black%20clothes%2C%20artistic%20portrait%20with%20tattoo%20equipment%20in%20background%2C%20confident%20pose%20with%20manga%20artwork%20visible%2C%20creative%20workspace%20atmosphere&width=500&height=600&seq=artist001&orientation=portrait"
                alt="Artist Portrait"
                class="w-full rounded-lg shadow-lg object-cover object-top"
              />
            </div>
            <div class="space-y-6">
              <h1 class="text-4xl font-bold text-gray-800">Meet Sarah Chen</h1>
              <p class="text-lg text-gray-600">
                Specializing in manga, anime, gaming, and Pokémon-inspired
                tattoos for over 8 years. I blend cute kawaii aesthetics with
                darker, more intricate designs to create unique pieces that tell
                your story.
              </p>
              <div class="space-y-4">
                <h3 class="text-xl font-semibold text-gray-800">My Style</h3>
                <ul class="space-y-2 text-gray-600">
                  <li class="flex items-center">
                    <i class="fas fa-star text-pink-400 mr-2"></i> Manga & Anime
                    Characters
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-gamepad text-blue-400 mr-2"></i> Gaming
                    Icons & Symbols
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-heart text-red-400 mr-2"></i> Cute Kawaii
                    Designs
                  </li>
                  <li class="flex items-center">
                    <i class="fas fa-skull text-gray-600 mr-2"></i> Dark &
                    Gothic Elements
                  </li>
                </ul>
              </div>
              <div class="space-y-4">
                <h3 class="text-xl font-semibold text-gray-800">
                  Certifications
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >Licensed Tattoo Artist</span
                  >
                  <span
                    class="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                    >Bloodborne Pathogen Certified</span
                  >
                  <span
                    class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >First Aid Certified</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Flash Tattoos Component -->
      <div v-if="activeTab === 'flash'" class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-center mb-12">Flash Tattoos</h1>
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Filters Sidebar -->
          <div class="lg:w-64 bg-white rounded-lg shadow-lg p-6 h-fit">
            <h3 class="text-lg font-semibold mb-4">Filters</h3>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Category</label
                >
                <select
                  v-model="selectedCategory"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Categories</option>
                  <option value="manga">Manga</option>
                  <option value="gaming">Gaming</option>
                  <option value="pokemon">Pokémon</option>
                  <option value="cute">Cute</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Size</label
                >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="selectedSizes"
                      value="small"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Small (2-4 inches)</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="selectedSizes"
                      value="medium"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Medium (4-6 inches)</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="selectedSizes"
                      value="large"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Large (6+ inches)</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Color</label
                >
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="selectedColors"
                      value="color"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Color</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="selectedColors"
                      value="blackwork"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Black & White</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Price Range</label
                >
                <input
                  v-model="priceRange"
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  class="w-full"
                />
                <div class="flex justify-between text-sm text-gray-600">
                  <span>$50</span>
                  <span>${{ priceRange }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Flash Tattoos Grid -->
          <div class="flex-1">
            <div class="flex justify-between items-center mb-6">
              <p class="text-gray-600">
                {{ filteredFlashTattoos.length }} designs found
              </p>
              <select
                v-model="sortBy"
                class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="flash in filteredFlashTattoos"
                :key="flash.id"
                class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                @click="openModal(flash, 'flash')"
              >
                <div class="relative">
                  <img
                    :src="flash.image"
                    :alt="flash.title"
                    class="w-full h-64 object-cover object-top"
                  />
                  <div
                    v-if="flash.discount"
                    class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                  >
                    -{{ flash.discount }}%
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-semibold mb-2">{{ flash.title }}</h3>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span
                      v-for="tag in flash.tags"
                      :key="tag"
                      class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <span
                        v-if="flash.discount"
                        class="text-gray-400 line-through text-sm"
                        >${{ flash.originalPrice }}</span
                      >
                      <span class="text-xl font-bold text-gray-800"
                        >${{ flash.price }}</span
                      >
                    </div>
                    <button
                      class="bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors text-sm !rounded-button cursor-pointer whitespace-nowrap"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Gallery Component -->
      <div v-if="activeTab === 'gallery'" class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-center mb-12">Gallery</h1>
        <!-- Filter Tabs -->
        <div class="flex justify-center mb-8">
          <div class="flex space-x-4 bg-white rounded-full p-2 shadow-lg">
            <button
              v-for="filter in galleryFilters"
              :key="filter"
              @click="selectedGalleryFilter = filter"
              :class="{
                'bg-blue-400 text-white': selectedGalleryFilter === filter,
              }"
              class="px-6 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              {{ filter }}
            </button>
          </div>
        </div>
        <!-- Masonry Gallery -->
        <div
          class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
        >
          <div
            v-for="item in filteredGallery"
            :key="item.id"
            class="break-inside-avoid bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            @click="openModal(item, 'gallery')"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full object-cover object-top"
            />
            <div class="p-4">
              <h3 class="font-semibold mb-1">{{ item.title }}</h3>
              <p class="text-sm text-gray-600">{{ item.category }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Booking Component -->
      <div v-if="activeTab === 'booking'" class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-center mb-12">
          Book Your Appointment
        </h1>
        <div class="max-w-6xl mx-auto">
          <!-- Calendar Navigation -->
          <div class="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div class="flex items-center space-x-4">
              <button
                @click="previousWeek"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors !rounded-button cursor-pointer whitespace-nowrap"
              >
                <i class="fas fa-chevron-left mr-2"></i>Previous Week
              </button>
              <button
                @click="nextWeek"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors !rounded-button cursor-pointer whitespace-nowrap"
              >
                Next Week<i class="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
            <div class="flex items-center space-x-4">
              <input
                type="date"
                v-model="selectedDate"
                class="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                @click="goToDate"
                class="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-colors !rounded-button cursor-pointer whitespace-nowrap"
              >
                Go to Date
              </button>
            </div>
          </div>
          <!-- Weekly Calendar -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Calendar Header -->
            <div class="grid grid-cols-8 border-b">
              <div class="p-4 font-semibold text-gray-500 border-r">Time</div>
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="p-4 font-semibold text-center border-r"
              >
                <div class="text-gray-800">{{ day.name }}</div>
                <div class="text-sm text-gray-500">{{ day.date }}</div>
              </div>
            </div>
            <!-- Calendar Body -->
            <div class="divide-y">
              <div
                v-for="hour in businessHours"
                :key="hour"
                class="grid grid-cols-8"
              >
                <div class="p-4 text-sm text-gray-500 border-r">
                  {{ formatHour(hour) }}
                </div>
                <div
                  v-for="day in weekDays"
                  :key="day.date + hour"
                  :class="[
                    'p-2 border-r transition-colors cursor-pointer',
                    isSlotAvailable(day.date, hour)
                      ? 'bg-green-100 hover:bg-green-200'
                      : 'bg-red-100',
                  ]"
                  @click="
                    isSlotAvailable(day.date, hour) &&
                      openBookingForm(day.date, hour)
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
        <!-- Booking Form Modal -->
        <div
          v-if="showBookingForm"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="closeBookingForm"
        >
          <div class="flex items-center justify-center min-h-screen px-4">
            <div
              class="fixed inset-0 bg-black opacity-50 transition-opacity"
            ></div>
            <div
              class="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl"
            >
              <div class="p-6">
                <button
                  @click="closeBookingForm"
                  class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <i class="fas fa-times"></i>
                </button>
                <h3 class="text-2xl font-bold mb-6">Book Appointment</h3>
                <p class="text-gray-600 mb-6">
                  Selected time: {{ formatBookingDateTime }}
                </p>
                <form @submit.prevent="submitBooking" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Full Name</label
                    >
                    <input
                      v-model="bookingForm.name"
                      type="text"
                      required
                      class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Email</label
                    >
                    <input
                      v-model="bookingForm.email"
                      type="email"
                      required
                      class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Phone</label
                    >
                    <input
                      v-model="bookingForm.phone"
                      type="tel"
                      class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Project Description</label
                    >
                    <textarea
                      v-model="bookingForm.description"
                      rows="4"
                      maxlength="500"
                      class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Describe your tattoo idea..."
                    ></textarea>
                    <div class="text-sm text-gray-500 mt-1">
                      {{ 500 - bookingForm.description.length }} characters
                      remaining
                    </div>
                  </div>
                  <div>
                    <label class="flex items-center">
                      <input
                        v-model="bookingForm.terms"
                        type="checkbox"
                        required
                        class="mr-2"
                      />
                      <span class="text-sm text-gray-600"
                        >I agree to the terms and conditions</span
                      >
                    </label>
                  </div>
                  <button
                    type="submit"
                    class="w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- How It Works Component -->
      <div v-if="activeTab === 'process'" class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-center mb-12">How It Works</h1>
        <div class="max-w-4xl mx-auto space-y-12">
          <div
            v-for="(step, index) in processSteps"
            :key="step.id"
            class="flex items-center space-x-8"
          >
            <div
              class="flex-shrink-0 w-16 h-16 bg-blue-400 text-white rounded-full flex items-center justify-center text-xl font-bold"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-semibold mb-2">{{ step.title }}</h3>
              <p class="text-gray-600 mb-4">{{ step.description }}</p>
              <div class="text-sm text-blue-400 font-medium">
                {{ step.duration }} | {{ step.price }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-center mb-8">Pricing Guide</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <h3 class="text-lg font-semibold mb-2">Small Tattoos</h3>
              <p class="text-3xl font-bold text-blue-400 mb-2">$80-150</p>
              <p class="text-sm text-gray-600">2-4 inches, simple designs</p>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-semibold mb-2">Medium Tattoos</h3>
              <p class="text-3xl font-bold text-pink-400 mb-2">$200-400</p>
              <p class="text-sm text-gray-600">4-6 inches, detailed work</p>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-semibold mb-2">Large Tattoos</h3>
              <p class="text-3xl font-bold text-red-400 mb-2">$500+</p>
              <p class="text-sm text-gray-600">6+ inches, complex designs</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Contact Component -->
      <div v-if="activeTab === 'contact'" class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-center mb-12">Contact Us</h1>
        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <form @submit.prevent="submitContactForm" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Name</label
                >
                <input
                  v-model="contactForm.name"
                  type="text"
                  required
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Email</label
                >
                <input
                  v-model="contactForm.email"
                  type="email"
                  required
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Phone</label
                >
                <input
                  v-model="contactForm.phone"
                  type="tel"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Subject</label
                >
                <input
                  v-model="contactForm.subject"
                  type="text"
                  required
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Message</label
                >
                <textarea
                  v-model="contactForm.message"
                  rows="4"
                  required
                  maxlength="500"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
                <div class="text-sm text-gray-500 mt-1">
                  {{ 500 - contactForm.message.length }} characters remaining
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Attachment (optional)</label
                >
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept="image/*,.pdf"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p class="text-sm text-gray-500 mt-1">
                  Max file size: 5MB. Supported formats: Images, PDF
                </p>
              </div>
              <button
                type="submit"
                class="w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
              >
                Send Message
              </button>
            </form>
          </div>
          <!-- Contact Information -->
          <div class="space-y-8">
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-2xl font-semibold mb-6">Studio Information</h2>
              <div class="space-y-4">
                <div class="flex items-start space-x-4">
                  <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                  <div>
                    <h3 class="font-medium">Address</h3>
                    <p class="text-gray-600">
                      123 Art Street<br />New York, NY 10001
                    </p>
                  </div>
                </div>
                <div class="flex items-start space-x-4">
                  <i class="fas fa-phone text-blue-400 mt-1"></i>
                  <div>
                    <h3 class="font-medium">Phone</h3>
                    <p class="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div class="flex items-start space-x-4">
                  <i class="fas fa-envelope text-blue-400 mt-1"></i>
                  <div>
                    <h3 class="font-medium">Email</h3>
                    <p class="text-gray-600">hello@inkmanga.com</p>
                  </div>
                </div>
                <div class="flex items-start space-x-4">
                  <i class="fas fa-clock text-blue-400 mt-1"></i>
                  <div>
                    <h3 class="font-medium">Hours</h3>
                    <p class="text-gray-600">
                      Lundi - Vendredi: 10am - 8pm<br />
                      Samedi: 10am - 6pm<br />
                      Dimanche: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Social Media -->
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-2xl font-semibold mb-6">Connect With Us</h2>
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
            <!-- Google Map -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1629290574615!5m2!1sen!2s"
                width="100%"
                height="100%"
                style="border: 0"
                allowfullscreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- Blog Component -->
      <div v-if="activeTab === 'blog'" class="container mx-auto px-4 py-16">
        <div v-if="!selectedPost">
          <h1 class="text-4xl font-bold text-center mb-12">Blog</h1>
          <!-- Featured Article -->
          <article
            class="bg-white rounded-lg shadow-lg overflow-hidden mb-12 cursor-pointer"
            @click="selectedPost = blogPosts[0]"
          >
            <div class="md:flex">
              <div class="md:w-1/2">
                <img
                  :src="blogPosts[0].image"
                  :alt="blogPosts[0].title"
                  class="w-full h-64 md:h-full object-cover object-top"
                />
              </div>
              <div class="md:w-1/2 p-8">
                <span class="text-sm text-blue-400 font-medium">{{
                  blogPosts[0].category
                }}</span>
                <h2 class="text-3xl font-bold mt-2 mb-4">
                  {{ blogPosts[0].title }}
                </h2>
                <p class="text-gray-600 mb-4">{{ blogPosts[0].excerpt }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{
                    blogPosts[0].date
                  }}</span>
                  <span class="text-blue-400 font-medium">Read More →</span>
                </div>
              </div>
            </div>
          </article>
          <!-- Other Articles -->
          <div class="grid md:grid-cols-2 gap-8">
            <article
              v-for="post in blogPosts.slice(1)"
              :key="post.id"
              class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              @click="selectedPost = post"
            >
              <img
                :src="post.image"
                :alt="post.title"
                class="w-full h-48 object-cover object-top"
              />
              <div class="p-6">
                <span class="text-sm text-blue-400 font-medium">{{
                  post.category
                }}</span>
                <h3 class="text-xl font-semibold mt-2 mb-2">
                  {{ post.title }}
                </h3>
                <p class="text-gray-600 mb-4">{{ post.excerpt }}</p>
                <span class="text-sm text-gray-500">{{ post.date }}</span>
              </div>
            </article>
          </div>
        </div>
        <!-- Single Post View -->
        <div v-else class="max-w-4xl mx-auto">
          <button
            @click="selectedPost = null"
            class="mb-6 text-blue-400 hover:text-blue-500 cursor-pointer whitespace-nowrap"
          >
            ← Back to Blog
          </button>
          <article class="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              :src="selectedPost.image"
              :alt="selectedPost.title"
              class="w-full h-96 object-cover object-top"
            />
            <div class="p-8">
              <span class="text-sm text-blue-400 font-medium">{{
                selectedPost.category
              }}</span>
              <h1 class="text-4xl font-bold mt-2 mb-4">
                {{ selectedPost.title }}
              </h1>
              <div
                class="flex items-center space-x-4 mb-8 text-sm text-gray-500"
              >
                <span>{{ selectedPost.date }}</span>
                <span>•</span>
                <span>5 min read</span>
              </div>
              <div class="prose max-w-none">
                <p class="text-lg text-gray-700 leading-relaxed mb-6">
                  {{ selectedPost.content }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
    <!-- Social Media Icons -->
    <div
      class="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4 z-40"
    >
      <a
        href="#"
        class="block w-12 h-12 bg-pink-400 text-white rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors cursor-pointer"
      >
        <i class="fab fa-instagram"></i>
      </a>
      <a
        href="#"
        class="block w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors cursor-pointer"
      >
        <i class="fab fa-tiktok"></i>
      </a>
      <a
        href="#"
        class="block w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <i class="fab fa-facebook"></i>
      </a>
    </div>
    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">InkManga Studio</h3>
            <p class="text-gray-400">
              Professional manga and gaming tattoos in the heart of the city.
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Quick Links</h4>
            <div class="space-y-2">
              <button
                @click="activeTab = 'about'"
                class="block text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
              >
                About
              </button>
              <button
                @click="activeTab = 'flash'"
                class="block text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
              >
                Flash Tattoos
              </button>
              <button
                @click="activeTab = 'gallery'"
                class="block text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
              >
                Gallery
              </button>
              <button
                @click="activeTab = 'booking'"
                class="block text-gray-400 hover:text-white cursor-pointer whitespace-nowrap"
              >
                Booking
              </button>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Contact</h4>
            <div class="space-y-2 text-gray-400">
              <p>
                <i class="fas fa-map-marker-alt mr-2"></i>123 Art Street, City
              </p>
              <p><i class="fas fa-phone mr-2"></i>(555) 123-4567</p>
              <p><i class="fas fa-envelope mr-2"></i>hello@inkmanga.com</p>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Hours</h4>
            <div class="space-y-2 text-gray-400">
              <p>Mon-Fri: 10am-8pm</p>
              <p>Saturday: 10am-6pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
        <div
          class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400"
        >
          <p>&copy; 2025 InkManga Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
    <!-- Modal Overlay -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50 transition-opacity"></div>
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
          <div class="flex flex-col md:flex-row">
            <!-- Left side - Image -->
            <div class="md:w-1/2">
              <img
                :src="modalItem?.image"
                :alt="modalItem?.title"
                class="w-full h-full object-cover object-top"
              />
            </div>
            <!-- Right side - Details -->
            <div class="md:w-1/2 p-8">
              <h2 class="text-3xl font-bold mb-4">{{ modalItem?.title }}</h2>
              <!-- Flash tattoo specific content -->
              <div v-if="modalType === 'flash'" class="space-y-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="tag in modalItem?.tags"
                    :key="tag"
                    class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="space-y-2">
                  <p class="text-gray-600">Size: {{ modalItem?.size }}</p>
                  <p class="text-gray-600">
                    Style:
                    {{
                      modalItem?.color === "color"
                        ? "Full Color"
                        : "Black & Gray"
                    }}
                  </p>
                </div>
                <div class="flex items-center space-x-2 mt-4">
                  <span
                    v-if="modalItem?.discount"
                    class="text-gray-400 line-through text-lg"
                    >${{ modalItem?.originalPrice }}</span
                  >
                  <span class="text-3xl font-bold text-gray-800"
                    >${{ modalItem?.price }}</span
                  >
                  <span
                    v-if="modalItem?.discount"
                    class="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold"
                  >
                    -{{ modalItem?.discount }}%
                  </span>
                </div>
                <button
                  @click="
                    activeTab = 'booking';
                    closeModal();
                  "
                  class="mt-6 w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
                >
                  Book Now
                </button>
              </div>
              <!-- Gallery item specific content -->
              <div v-if="modalType === 'gallery'" class="space-y-4">
                <p class="text-gray-600">Category: {{ modalItem?.category }}</p>
                <div class="prose max-w-none text-gray-600">
                  <p>
                    A stunning piece showcasing the beauty of
                    {{ modalItem?.category.toLowerCase() }} style tattoos. This
                    design demonstrates our commitment to bringing your favorite
                    characters and themes to life.
                  </p>
                </div>
                <div class="flex flex-wrap gap-2 mt-4">
                  <span
                    class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                    >Custom Design</span
                  >
                  <span
                    class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                    >{{ modalItem?.category }}</span
                  >
                </div>
                <button
                  @click="
                    activeTab = 'booking';
                    closeModal();
                  "
                  class="mt-6 w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
                >
                  Request Similar Design
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from "vue";
// Navigation
const activeTab = ref("home");
const mobileMenuOpen = ref(false);
const searchQuery = ref("");
const tabs = [
  { id: "home", name: "Home" },
  { id: "about", name: "About" },
  { id: "flash", name: "Flash Tattoos" },
  { id: "gallery", name: "Gallery" },
  { id: "booking", name: "Booking" },
  { id: "process", name: "How It Works" },
  { id: "blog", name: "Blog" },
  { id: "contact", name: "Contact" },
];
// Home data
const featuredWorks = [
  {
    id: 1,
    title: "Pikachu Portrait",
    description: "Colorful Pokemon character tattoo",
    image:
      "https://readdy.ai/api/search-image?query=colorful%20pikachu%20pokemon%20tattoo%20design%20on%20skin%2C%20vibrant%20yellow%20and%20red%20colors%2C%20cute%20anime%20style%20artwork%2C%20professional%20tattoo%20photography%20with%20clean%20white%20background&width=400&height=300&seq=work001&orientation=landscape",
  },
  {
    id: 2,
    title: "Dark Manga Sleeve",
    description: "Intricate black and gray manga design",
    image:
      "https://readdy.ai/api/search-image?query=dark%20manga%20anime%20tattoo%20sleeve%20design%2C%20black%20and%20gray%20shading%2C%20gothic%20anime%20characters%2C%20detailed%20linework%20on%20arm%2C%20professional%20tattoo%20studio%20lighting&width=400&height=300&seq=work002&orientation=landscape",
  },
  {
    id: 3,
    title: "Gaming Controller",
    description: "Retro gaming inspired piece",
    image:
      "https://readdy.ai/api/search-image?query=retro%20gaming%20controller%20tattoo%20design%20with%20pixel%20art%20elements%2C%20nostalgic%20video%20game%20theme%2C%20colorful%20buttons%20and%20details%2C%20clean%20tattoo%20photography&width=400&height=300&seq=work003&orientation=landscape",
  },
];
const latestPosts = [
  {
    id: 1,
    title: "Tattoo Aftercare Guide",
    excerpt: "Essential tips for taking care of your new tattoo",
    date: "Jan 15, 2025",
    image:
      "https://readdy.ai/api/search-image?query=tattoo%20aftercare%20products%20and%20healing%20process%2C%20clean%20medical%20supplies%2C%20healing%20tattoo%20on%20skin%2C%20professional%20healthcare%20setup%20with%20white%20background&width=600&height=300&seq=blog001&orientation=landscape",
  },
  {
    id: 2,
    title: "Anime Tattoo Trends 2025",
    excerpt: "The hottest anime tattoo styles this year",
    date: "Jan 10, 2025",
    image:
      "https://readdy.ai/api/search-image?query=modern%20anime%20tattoo%20designs%20collection%2C%20trending%20manga%20characters%2C%20colorful%20anime%20artwork%20compilation%2C%20contemporary%20tattoo%20art%20style%20with%20clean%20background&width=600&height=300&seq=blog002&orientation=landscape",
  },
];
// Flash tattoos data
const selectedCategory = ref("");
const selectedSizes = ref([]);
const selectedColors = ref([]);
const priceRange = ref(500);
const sortBy = ref("newest");
const flashTattoos = [
  {
    id: 1,
    title: "Cute Pikachu",
    category: "pokemon",
    size: "small",
    color: "color",
    price: 120,
    originalPrice: 150,
    discount: 20,
    tags: ["pokemon", "cute", "color"],
    image:
      "https://readdy.ai/api/search-image?query=cute%20pikachu%20pokemon%20flash%20tattoo%20design%2C%20small%20colorful%20character%20illustration%2C%20kawaii%20anime%20style%2C%20simple%20background%20for%20tattoo%20flash%20sheet&width=300&height=300&seq=flash001&orientation=squarish",
  },
  {
    id: 2,
    title: "Dark Anime Eyes",
    category: "manga",
    size: "medium",
    color: "blackwork",
    price: 200,
    originalPrice: 200,
    discount: 0,
    tags: ["manga", "dark", "blackwork"],
    image:
      "https://readdy.ai/api/search-image?query=dark%20anime%20manga%20eyes%20tattoo%20design%2C%20black%20and%20white%20linework%2C%20gothic%20anime%20character%20eyes%2C%20detailed%20shading%20for%20flash%20tattoo&width=300&height=300&seq=flash002&orientation=squarish",
  },
  {
    id: 3,
    title: "Gaming Pixel Heart",
    category: "gaming",
    size: "small",
    color: "color",
    price: 80,
    originalPrice: 100,
    discount: 20,
    tags: ["gaming", "pixel", "cute"],
    image:
      "https://readdy.ai/api/search-image?query=retro%20gaming%20pixel%20heart%20tattoo%20design%2C%208-bit%20video%20game%20style%2C%20colorful%20pixelated%20heart%20icon%2C%20nostalgic%20gaming%20aesthetic%20for%20flash%20tattoo&width=300&height=300&seq=flash003&orientation=squarish",
  },
  {
    id: 4,
    title: "Kawaii Cat",
    category: "cute",
    size: "small",
    color: "color",
    price: 90,
    originalPrice: 90,
    discount: 0,
    tags: ["cute", "kawaii", "color"],
    image:
      "https://readdy.ai/api/search-image?query=kawaii%20cute%20cat%20character%20tattoo%20design%2C%20pastel%20colors%2C%20anime%20style%20cat%20with%20big%20eyes%2C%20adorable%20expression%20for%20flash%20tattoo%20sheet&width=300&height=300&seq=flash004&orientation=squarish",
  },
  {
    id: 5,
    title: "Skull Gamer",
    category: "dark",
    size: "medium",
    color: "blackwork",
    price: 250,
    originalPrice: 250,
    discount: 0,
    tags: ["dark", "gaming", "skull"],
    image:
      "https://readdy.ai/api/search-image?query=dark%20gaming%20skull%20tattoo%20design%20with%20headphones%2C%20gothic%20gamer%20aesthetic%2C%20black%20and%20white%20artwork%2C%20detailed%20skull%20illustration%20for%20tattoo%20flash&width=300&height=300&seq=flash005&orientation=squarish",
  },
  {
    id: 6,
    title: "Sailor Moon",
    category: "manga",
    size: "large",
    color: "color",
    price: 400,
    originalPrice: 400,
    discount: 0,
    tags: ["manga", "sailor moon", "color"],
    image:
      "https://readdy.ai/api/search-image?query=sailor%20moon%20anime%20character%20tattoo%20design%2C%20magical%20girl%20manga%20style%2C%20colorful%20costume%20and%20details%2C%20classic%20anime%20artwork%20for%20large%20tattoo&width=300&height=300&seq=flash006&orientation=squarish",
  },
];
const filteredFlashTattoos = computed(() => {
  let filtered = flashTattoos.filter((tattoo) => {
    if (selectedCategory.value && tattoo.category !== selectedCategory.value)
      return false;
    if (
      selectedSizes.value.length &&
      !selectedSizes.value.includes(tattoo.size)
    )
      return false;
    if (
      selectedColors.value.length &&
      !selectedColors.value.includes(tattoo.color)
    )
      return false;
    if (tattoo.price > priceRange.value) return false;
    return true;
  });
  // Sort
  if (sortBy.value === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  }
  return filtered;
});
// Gallery data
const selectedGalleryFilter = ref("All");
const galleryFilters = ["All", "Manga", "Gaming", "Pokemon", "Cute", "Dark"];
const galleryItems = [
  {
    id: 1,
    title: "Dragon Ball Sleeve",
    category: "Manga",
    image:
      "https://readdy.ai/api/search-image?query=dragon%20ball%20anime%20tattoo%20sleeve%2C%20detailed%20manga%20characters%2C%20vibrant%20colors%2C%20professional%20tattoo%20photography%20on%20arm%2C%20dynamic%20action%20poses&width=300&height=400&seq=gallery001&orientation=portrait",
  },
  {
    id: 2,
    title: "Zelda Triforce",
    category: "Gaming",
    image:
      "https://readdy.ai/api/search-image?query=legend%20of%20zelda%20triforce%20tattoo%20design%2C%20golden%20triangle%20symbol%2C%20gaming%20inspired%20artwork%2C%20clean%20linework%20on%20skin%2C%20professional%20tattoo%20photo&width=300&height=300&seq=gallery002&orientation=squarish",
  },
  {
    id: 3,
    title: "Cute Eevee",
    category: "Pokemon",
    image:
      "https://readdy.ai/api/search-image?query=cute%20eevee%20pokemon%20tattoo%2C%20kawaii%20anime%20style%2C%20soft%20pastel%20colors%2C%20adorable%20character%20design%2C%20small%20tattoo%20on%20wrist&width=300&height=350&seq=gallery003&orientation=portrait",
  },
  {
    id: 4,
    title: "Gothic Anime Girl",
    category: "Dark",
    image:
      "https://readdy.ai/api/search-image?query=gothic%20anime%20girl%20tattoo%20design%2C%20dark%20manga%20character%2C%20black%20and%20gray%20shading%2C%20mysterious%20atmosphere%2C%20detailed%20portrait%20tattoo&width=300&height=450&seq=gallery004&orientation=portrait",
  },
  {
    id: 5,
    title: "Mario Power-Up",
    category: "Gaming",
    image:
      "https://readdy.ai/api/search-image?query=super%20mario%20power%20up%20mushroom%20tattoo%2C%20retro%20gaming%20icon%2C%20bright%20red%20and%20white%20colors%2C%20nostalgic%20video%20game%20design%2C%20small%20colorful%20tattoo&width=300&height=300&seq=gallery005&orientation=squarish",
  },
  {
    id: 6,
    title: "Hello Kitty",
    category: "Cute",
    image:
      "https://readdy.ai/api/search-image?query=hello%20kitty%20kawaii%20tattoo%20design%2C%20cute%20anime%20character%2C%20pink%20bow%20and%20details%2C%20adorable%20expression%2C%20small%20tattoo%20artwork&width=300&height=320&seq=gallery006&orientation=squarish",
  },
];
const filteredGallery = computed(() => {
  if (selectedGalleryFilter.value === "All") return galleryItems;
  return galleryItems.filter(
    (item) => item.category === selectedGalleryFilter.value
  );
});
// Calendar and Booking data
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const currentWeekStart = ref(new Date());
const showBookingForm = ref(false);
const bookingForm = ref({
  date: "",
  time: "",
  name: "",
  email: "",
  phone: "",
  description: "",
  terms: false,
});
// Calendar navigation
const previousWeek = () => {
  currentWeekStart.value = new Date(
    currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7)
  );
};
const nextWeek = () => {
  currentWeekStart.value = new Date(
    currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7)
  );
};
const goToDate = () => {
  currentWeekStart.value = new Date(selectedDate.value);
  // Adjust to start of week (Sunday)
  const day = currentWeekStart.value.getDay();
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - day);
};
// Calendar data
const weekDays = computed(() => {
  const days = [];
  const current = new Date(currentWeekStart.value);
  const dayNames = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  for (let i = 0; i < 7; i++) {
    const date = new Date(current);
    days.push({
      name: dayNames[date.getDay()],
      date: date.toISOString().split("T")[0],
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
});
const businessHours = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];
// Helper functions
const formatHour = (hour) => {
  return hour;
};
const isSlotAvailable = (date, hour) => {
  // Mock availability data - replace with real availability check
  const randomAvailability = Math.random() > 0.3;
  return (
    randomAvailability && new Date(date) >= new Date().setHours(0, 0, 0, 0)
  );
};
const formatBookingDateTime = computed(() => {
  if (!bookingForm.value.date || !bookingForm.value.time) return "";
  const date = new Date(bookingForm.value.date);
  return `${date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })} at ${bookingForm.value.time}`;
});
// Booking form handlers
const openBookingForm = (date, time) => {
  bookingForm.value.date = date;
  bookingForm.value.time = time;
  showBookingForm.value = true;
};
const closeBookingForm = () => {
  showBookingForm.value = false;
};
const submitBooking = () => {
  // Here you would typically send the booking data to your backend
  console.log("Booking submitted:", bookingForm.value);
  // Show success message
  const successMessage = document.createElement("div");
  successMessage.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
  successMessage.textContent = "Booking request submitted successfully!";
  document.body.appendChild(successMessage);
  // Remove success message after 3 seconds
  setTimeout(() => {
    document.body.removeChild(successMessage);
  }, 3000);
  // Reset form and close modal
  bookingForm.value = {
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    description: "",
    terms: false,
  };
  showBookingForm.value = false;
};
// Process data
const processSteps = [
  {
    id: 1,
    title: "Consultation",
    description:
      "We discuss your ideas, style preferences, and design requirements.",
    duration: "30-60 minutes",
    price: "Free",
  },
  {
    id: 2,
    title: "Design Creation",
    description: "Custom design created based on your vision and feedback.",
    duration: "1-3 days",
    price: "$50 deposit",
  },
  {
    id: 3,
    title: "Tattoo Session",
    description: "Professional tattooing in a clean, safe environment.",
    duration: "1-6 hours",
    price: "Varies by size",
  },
  {
    id: 4,
    title: "Aftercare",
    description: "Detailed aftercare instructions and follow-up support.",
    duration: "2-4 weeks",
    price: "Included",
  },
];
// Contact form data
const contactForm = ref({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  file: null,
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Error: File size exceeds 5MB limit", "error");
      event.target.value = "";
      return;
    }
    contactForm.value.file = file;
  }
};

const showNotification = (message, type = "success") => {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } text-white px-6 py-3 rounded-lg shadow-lg z-50`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
};

const submitContactForm = () => {
  // Here you would typically send the form data to your backend
  console.log("Contact form submitted:", contactForm.value);

  // Show success message
  showNotification("Message sent successfully! We'll get back to you soon.");

  // Reset form
  contactForm.value = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    file: null,
  };

  // Reset file input
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.value = "";
};

// Blog data
// Modal state
const isModalOpen = ref(false);
const modalItem = ref(null);
const modalType = ref(""); // 'flash' or 'gallery'
// Close modal when clicking outside
const closeModal = () => {
  isModalOpen.value = false;
  modalItem.value = null;
  document.body.style.overflow = "auto";
};
// Open modal with item data
const openModal = (item, type) => {
  modalItem.value = item;
  modalType.value = type;
  isModalOpen.value = true;
  document.body.style.overflow = "hidden";
};
// Watch modal state to handle body scroll
watch(isModalOpen, (newVal) => {
  document.body.style.overflow = newVal ? "hidden" : "auto";
});
const selectedPost = ref(null);
const blogPosts = [
  {
    id: 1,
    title: "The Art of Anime Tattoos: From Sketch to Skin",
    excerpt:
      "Discover the intricate process of bringing anime characters to life through tattoo art.",
    content:
      "Creating anime tattoos requires a deep understanding of both the source material and tattoo artistry. From the initial consultation where we discuss your favorite characters and scenes, to the final touch-ups, every step is crucial in bringing your vision to life. The process begins with studying reference materials, understanding the character's personality and visual elements that make them unique. We then adapt these elements to work well as a tattoo, considering factors like skin tone, placement, and long-term aging of the design.",
    date: "January 15, 2025",
    category: "Tutorials",
    image:
      "https://readdy.ai/api/search-image?query=anime%20tattoo%20creation%20process%2C%20artist%20drawing%20manga%20character%20design%2C%20tattoo%20sketches%20and%20reference%20materials%2C%20professional%20tattoo%20studio%20workspace&width=800&height=400&seq=blogpost001&orientation=landscape",
  },
  {
    id: 2,
    title: "Pokemon Tattoo Trends: What's Popular in 2025",
    excerpt:
      "Explore the latest Pokemon tattoo trends and popular character choices.",
    content:
      "Pokemon tattoos continue to evolve with new generations and artistic interpretations. This year, we're seeing a rise in minimalist Pokeball designs, watercolor Eevee evolutions, and detailed portraits of legendary Pokemon. The key is balancing nostalgia with modern tattoo techniques.",
    date: "January 10, 2025",
    category: "Trends",
    image:
      "https://readdy.ai/api/search-image?query=pokemon%20tattoo%20collection%20showcase%2C%20various%20pokemon%20character%20tattoos%2C%20colorful%20anime%20designs%20on%20skin%2C%20professional%20tattoo%20photography%20compilation&width=800&height=400&seq=blogpost002&orientation=landscape",
  },
  {
    id: 3,
    title: "Gaming Tattoos: From Retro to Modern",
    excerpt: "A comprehensive guide to video game inspired tattoo designs.",
    content:
      "Gaming tattoos have evolved from simple 8-bit designs to complex, detailed pieces that capture the essence of modern gaming. Whether you prefer classic arcade aesthetics or contemporary game art, there's a style that fits your gaming passion.",
    date: "January 5, 2025",
    category: "Gaming",
    image:
      "https://readdy.ai/api/search-image?query=video%20game%20tattoo%20designs%20collection%2C%20retro%20gaming%20icons%20and%20modern%20game%20characters%2C%20pixel%20art%20and%20realistic%20gaming%20tattoos%2C%20diverse%20gaming%20tattoo%20styles&width=800&height=400&seq=blogpost003&orientation=landscape",
  },
];
</script>
<style scoped>
/* Modal animations */
.transform {
  transition-property: transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
.opacity-50 {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
.\!rounded-button {
  border-radius: 9999px;
}
/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #4fc3f7;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #29b6f6;
}
/* Smooth transitions */
* {
  transition: all 0.3s ease;
}
/* Masonry layout adjustments */
.columns-1 {
  column-count: 1;
}
.columns-2 {
  column-count: 2;
}
.columns-3 {
  column-count: 3;
}
.columns-4 {
  column-count: 4;
}
@media (min-width: 640px) {
  .sm\:columns-2 {
    column-count: 2;
  }
}
@media (min-width: 1024px) {
  .lg\:columns-3 {
    column-count: 3;
  }
}
@media (min-width: 1280px) {
  .xl\:columns-4 {
    column-count: 4;
  }
}
/* Hide number input arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
/* Ensure minimum height */
body {
  min-height: 1024px;
}
</style>
