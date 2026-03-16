<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div
      :class="{ 'w-64': sidebarExpanded, 'w-16': !sidebarExpanded }"
      class="bg-white shadow-lg transition-all duration-300 flex flex-col"
    >
      <!-- Logo & Toggle -->
      <div
        class="p-4 border-b border-gray-200 flex items-center justify-between"
      >
        <div v-show="sidebarExpanded" class="flex items-center space-x-2">
          <i class="fas fa-tint text-2xl text-purple-600"></i>
          <span class="font-bold text-xl text-gray-800">Tattoo Admin</span>
        </div>
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <i class="fas fa-bars text-gray-600"></i>
        </button>
      </div>
      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li v-for="tab in tabs" :key="tab.id">
            <button
              @click="activeTab = tab.id"
              :class="{
                'bg-purple-100 text-purple-700 border-r-2 border-purple-600':
                  activeTab === tab.id,
                'text-gray-600 hover:bg-gray-100': activeTab !== tab.id,
              }"
              class="w-full flex items-center p-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i :class="tab.icon" class="text-lg"></i>
              <span v-show="sidebarExpanded" class="ml-3">{{ tab.name }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-800">
            {{ getCurrentTab.name }}
          </h1>
          <div class="flex items-center space-x-4">
            <button class="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <i class="fas fa-bell text-gray-600"></i>
            </button>
            <div class="flex items-center space-x-2">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20admin%20user%20avatar%20portrait%20with%20clean%20background%20modern%20style%20business%20headshot&width=40&height=40&seq=admin-avatar&orientation=squarish"
                alt="Admin"
                class="w-8 h-8 rounded-full"
              />
              <span class="text-sm text-gray-600">Admin User</span>
            </div>
          </div>
        </div>
      </header>
      <!-- Content Area -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Stats Dashboard -->
        <div v-if="activeTab === 'stats'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Total Bookings</p>
                  <p class="text-3xl font-bold text-gray-800">127</p>
                </div>
                <i class="fas fa-calendar-check text-2xl text-blue-500"></i>
              </div>
            </div>
            <div
              class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Flash Tattoos Sold</p>
                  <p class="text-3xl font-bold text-gray-800">89</p>
                </div>
                <i class="fas fa-tint text-2xl text-purple-500"></i>
              </div>
            </div>
            <div
              class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Blog Views</p>
                  <p class="text-3xl font-bold text-gray-800">2.4k</p>
                </div>
                <i class="fas fa-eye text-2xl text-green-500"></i>
              </div>
            </div>
            <div
              class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Contact Requests</p>
                  <p class="text-3xl font-bold text-gray-800">34</p>
                </div>
                <i class="fas fa-envelope text-2xl text-orange-500"></i>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Monthly Statistics</h3>
            <div ref="chartContainer" class="h-80"></div>
          </div>
        </div>
        <!-- Flash Tattoos -->
        <div v-if="activeTab === 'flash'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Flash Tattoos</h3>
              <button
                @click="showFlashModal = true"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>Add Flash Tattoo
              </button>
            </div>
            <div class="flex flex-wrap gap-4 mb-6">
              <div class="flex-1 min-w-64">
                <input
                  v-model="flashSearch"
                  type="text"
                  placeholder="Search flash tattoos..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                v-model="flashCategoryFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="">All Categories</option>
                <option value="minimalist">Minimalist</option>
                <option value="traditional">Traditional</option>
                <option value="geometric">Geometric</option>
              </select>
              <select
                v-model="flashPriceFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="">All Prices</option>
                <option value="low">Under $100</option>
                <option value="medium">$100-$200</option>
                <option value="high">Over $200</option>
              </select>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Image
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Title
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Price
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="flash in filteredFlashTattoos"
                    :key="flash.id"
                    class="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td class="p-4">
                      <img
                        :src="flash.image"
                        alt="Flash tattoo"
                        class="w-16 h-16 rounded-lg object-cover"
                      />
                    </td>
                    <td class="p-4 font-medium">{{ flash.title }}</td>
                    <td class="p-4 text-gray-600">{{ flash.category }}</td>
                    <td class="p-4 font-semibold">${{ flash.price }}</td>
                    <td class="p-4">
                      <span
                        :class="
                          flash.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        "
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ flash.available ? "Available" : "Sold" }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex space-x-2">
                        <button
                          @click="editFlash(flash)"
                          class="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          @click="deleteFlash(flash.id)"
                          class="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Promotions -->
        <div v-if="activeTab === 'promotions'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Homepage Banner Carousel</h3>
            <button
              @click="showBannerModal = true"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mb-4 cursor-pointer whitespace-nowrap !rounded-button"
            >
              <i class="fas fa-plus mr-2"></i>Add Banner
            </button>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="banner in banners"
                :key="banner.id"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  :src="banner.image"
                  alt="Banner"
                  class="w-full h-32 object-cover"
                />
                <div class="p-4">
                  <h4 class="font-medium">{{ banner.title }}</h4>
                  <p class="text-sm text-gray-600">{{ banner.description }}</p>
                  <div class="flex justify-between mt-2">
                    <button
                      @click="editBanner(banner)"
                      class="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="deleteBanner(banner.id)"
                      class="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Discount Management</h3>
            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 class="font-medium">Global Discount</h4>
                  <p class="text-sm text-gray-600">
                    Apply discount to all flash tattoos
                  </p>
                </div>
                <div class="flex items-center space-x-4">
                  <input
                    v-model="globalDiscount"
                    type="number"
                    placeholder="%"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap !rounded-button"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Agenda -->
        <div v-if="activeTab === 'agenda'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Weekly Calendar</h3>
              <button
                @click="showBookingModal = true"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>Add Booking
              </button>
            </div>
            <div class="grid grid-cols-7 gap-2 mb-4">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center font-medium p-2 bg-gray-50 rounded"
              >
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-2">
              <div
                v-for="date in calendarDates"
                :key="date"
                class="min-h-24 p-2 border border-gray-200 rounded"
              >
                <div class="text-sm font-medium mb-1">{{ date }}</div>
                <div
                  v-for="booking in getBookingsForDate(date)"
                  :key="booking.id"
                  class="text-xs bg-purple-100 text-purple-800 p-1 rounded mb-1 cursor-pointer"
                  @click="viewBooking(booking)"
                >
                  {{ booking.client }} - {{ booking.time }}
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Recent Bookings</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Client
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Tattoo
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="booking in bookings"
                    :key="booking.id"
                    class="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td class="p-4 font-medium">{{ booking.client }}</td>
                    <td class="p-4">
                      {{ booking.date }} at {{ booking.time }}
                    </td>
                    <td class="p-4">{{ booking.tattoo }}</td>
                    <td class="p-4">
                      <span
                        :class="getStatusColor(booking.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ booking.status }}
                      </span>
                    </td>
                    <td class="p-4">
                      <button
                        @click="viewBooking(booking)"
                        class="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Gallery -->
        <div v-if="activeTab === 'gallery'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Gallery Management</h3>
              <button
                @click="showGalleryModal = true"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>Add Media
              </button>
            </div>
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <div
                v-for="item in galleryItems"
                :key="item.id"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div class="relative">
                  <img
                    :src="item.image"
                    alt="Gallery item"
                    class="w-full h-48 object-cover"
                  />
                  <div
                    v-if="item.featured"
                    class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    Featured
                  </div>
                </div>
                <div class="p-4">
                  <h4 class="font-medium mb-2">{{ item.title }}</h4>
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span
                      v-for="tag in item.tags"
                      :key="tag"
                      class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >{{ tag }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <button
                      @click="toggleFeatured(item)"
                      class="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                    >
                      <i
                        :class="item.featured ? 'fas fa-star' : 'far fa-star'"
                      ></i>
                    </button>
                    <div class="space-x-2">
                      <button
                        @click="editGalleryItem(item)"
                        class="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="deleteGalleryItem(item.id)"
                        class="text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Blog -->
        <div v-if="activeTab === 'blog'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Blog Articles</h3>
              <button
                @click="showBlogModal = true"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>New Article
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Title
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Published
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Views
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="article in blogArticles"
                    :key="article.id"
                    class="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td class="p-4 font-medium">{{ article.title }}</td>
                    <td class="p-4 text-gray-600">{{ article.category }}</td>
                    <td class="p-4">{{ article.publishedDate }}</td>
                    <td class="p-4">{{ article.views }}</td>
                    <td class="p-4">
                      <div class="flex space-x-2">
                        <button
                          @click="editArticle(article)"
                          class="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          @click="deleteArticle(article.id)"
                          class="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Shop Settings -->
        <div v-if="activeTab === 'settings'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-6">Shop Settings</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Shop Address</label
                  >
                  <textarea
                    v-model="shopSettings.address"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Opening Hours</label
                  >
                  <div class="space-y-2">
                    <div
                      v-for="day in daysOfWeek"
                      :key="day"
                      class="flex items-center space-x-4"
                    >
                      <span class="w-20 text-sm">{{ day }}</span>
                      <input
                        v-model="shopSettings.hours[day].open"
                        type="time"
                        class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <span class="text-gray-500">to</span>
                      <input
                        v-model="shopSettings.hours[day].close"
                        type="time"
                        class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <label class="flex items-center">
                        <input
                          v-model="shopSettings.hours[day].closed"
                          type="checkbox"
                          class="mr-2"
                        />
                        <span class="text-sm">Closed</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >About Description</label
                  >
                  <textarea
                    v-model="shopSettings.about"
                    rows="6"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Shop Photo</label
                  >
                  <div
                    class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                  >
                    <img
                      v-if="shopSettings.photo"
                      :src="shopSettings.photo"
                      alt="Shop"
                      class="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <button
                      class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap !rounded-button"
                    >
                      <i class="fas fa-upload mr-2"></i>Upload Photo
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Social Media Links</label
                  >
                  <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                      <i class="fab fa-instagram text-pink-500"></i>
                      <input
                        v-model="shopSettings.social.instagram"
                        type="url"
                        placeholder="Instagram URL"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div class="flex items-center space-x-3">
                      <i class="fab fa-facebook text-blue-500"></i>
                      <input
                        v-model="shopSettings.social.facebook"
                        type="url"
                        placeholder="Facebook URL"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div class="flex items-center space-x-3">
                      <i class="fab fa-twitter text-blue-400"></i>
                      <input
                        v-model="shopSettings.social.twitter"
                        type="url"
                        placeholder="Twitter URL"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-6">
              <button
                class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
        <!-- Homepage Management -->
        <div v-if="activeTab === 'homepage'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-4">Featured Content</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium mb-3">Featured Flash Tattoo</h4>
                <div v-if="featuredContent.flash" class="mb-3">
                  <img
                    :src="featuredContent.flash.image"
                    alt="Featured flash"
                    class="w-full h-32 object-cover rounded-lg"
                  />
                  <p class="text-sm mt-2">{{ featuredContent.flash.title }}</p>
                </div>
                <button
                  class="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 cursor-pointer whitespace-nowrap !rounded-button"
                >
                  Select Flash Tattoo
                </button>
              </div>
              <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium mb-3">Featured Gallery Project</h4>
                <div v-if="featuredContent.gallery" class="mb-3">
                  <img
                    :src="featuredContent.gallery.image"
                    alt="Featured project"
                    class="w-full h-32 object-cover rounded-lg"
                  />
                  <p class="text-sm mt-2">
                    {{ featuredContent.gallery.title }}
                  </p>
                </div>
                <button
                  class="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 cursor-pointer whitespace-nowrap !rounded-button"
                >
                  Select Gallery Project
                </button>
              </div>
              <div class="border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium mb-3">Featured Blog Article</h4>
                <div v-if="featuredContent.blog" class="mb-3">
                  <div
                    class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    <i class="fas fa-newspaper text-3xl text-gray-400"></i>
                  </div>
                  <p class="text-sm mt-2">{{ featuredContent.blog.title }}</p>
                </div>
                <button
                  class="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 cursor-pointer whitespace-nowrap !rounded-button"
                >
                  Select Blog Article
                </button>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Homepage News Carousel</h3>
              <button
                @click="showNewsModal = true"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>Add News Item
              </button>
            </div>
            <div class="space-y-4">
              <div
                v-for="news in newsItems"
                :key="news.id"
                class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <img
                  :src="news.image"
                  alt="News"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <h4 class="font-medium">{{ news.title }}</h4>
                  <p class="text-sm text-gray-600">{{ news.description }}</p>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="editNews(news)"
                    class="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteNews(news.id)"
                    class="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Contact Requests -->
        <div v-if="activeTab === 'contacts'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-6">Contact Requests</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Subject
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="contact in contactRequests"
                    :key="contact.id"
                    class="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td class="p-4 font-medium">{{ contact.name }}</td>
                    <td class="p-4">{{ contact.email }}</td>
                    <td class="p-4">{{ contact.subject }}</td>
                    <td class="p-4">{{ contact.date }}</td>
                    <td class="p-4">
                      <button
                        @click="toggleContactStatus(contact)"
                        :class="
                          contact.status === 'new'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        "
                        class="px-2 py-1 rounded-full text-xs font-medium cursor-pointer"
                      >
                        {{ contact.status === "new" ? "New" : "Processed" }}
                      </button>
                    </td>
                    <td class="p-4">
                      <button
                        @click="viewContact(contact)"
                        class="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Process Steps -->
        <div v-if="activeTab === 'process'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">How It Works Steps</h3>
              <button
                @click="addProcessStep"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>Add Step
              </button>
            </div>
            <div class="space-y-4">
              <div
                v-for="(step, index) in processSteps"
                :key="step.id"
                class="border border-gray-200 rounded-lg p-6"
              >
                <div class="flex items-start space-x-4">
                  <div class="flex flex-col items-center">
                    <div
                      class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm"
                    >
                      {{ index + 1 }}
                    </div>
                    <div class="flex flex-col space-y-2 mt-2">
                      <button
                        @click="moveStepUp(index)"
                        :disabled="index === 0"
                        class="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i class="fas fa-chevron-up"></i>
                      </button>
                      <button
                        @click="moveStepDown(index)"
                        :disabled="index === processSteps.length - 1"
                        class="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i class="fas fa-chevron-down"></i>
                      </button>
                    </div>
                  </div>
                  <div class="flex-1 space-y-4">
                    <input
                      v-model="step.title"
                      type="text"
                      placeholder="Step title"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    />
                    <textarea
                      v-model="step.description"
                      rows="3"
                      placeholder="Step description"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    ></textarea>
                    <input
                      v-model="step.link"
                      type="url"
                      placeholder="Optional link"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div class="w-32">
                    <img
                      v-if="step.image"
                      :src="step.image"
                      alt="Step image"
                      class="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      class="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i class="fas fa-image"></i>
                    </button>
                  </div>
                  <button
                    @click="removeProcessStep(index)"
                    class="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-6">
              <button
                class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                Save Process Steps
              </button>
            </div>
          </div>
        </div>
        <!-- User Management -->
        <div v-if="activeTab === 'users'" class="space-y-6">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">Admin Users</h3>
              <button
                @click="showUserModal = true"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
              >
                <i class="fas fa-plus mr-2"></i>Add Admin
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Name
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Role
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Last Login
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th class="text-left p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in adminUsers"
                    :key="user.id"
                    class="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td class="p-4 font-medium">{{ user.name }}</td>
                    <td class="p-4">{{ user.email }}</td>
                    <td class="p-4">
                      <span
                        :class="getRoleColor(user.role)"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="p-4">{{ user.lastLogin }}</td>
                    <td class="p-4">
                      <span
                        :class="
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        "
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ user.active ? "Active" : "Inactive" }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex space-x-2">
                        <button
                          @click="editUser(user)"
                          class="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          @click="deleteUser(user.id)"
                          class="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    <!-- Flash Tattoo Modal -->
    <div
      v-if="showFlashModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showFlashModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold">
            {{ editingFlash ? "Edit" : "Add" }} Flash Tattoo
          </h3>
          <button
            @click="showFlashModal = false"
            class="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveFlash" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Title</label
            >
            <input
              v-model="flashForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Description</label
            >
            <textarea
              v-model="flashForm.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Size</label
              >
              <input
                v-model="flashForm.size"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Price</label
              >
              <input
                v-model="flashForm.price"
                type="number"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Category</label
              >
              <select
                v-model="flashForm.category"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="minimalist">Minimalist</option>
                <option value="traditional">Traditional</option>
                <option value="geometric">Geometric</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Discount (%)</label
              >
              <input
                v-model="flashForm.discount"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Colors</label
            >
            <input
              v-model="flashForm.colors"
              type="text"
              placeholder="e.g., Black, Red, Blue"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div class="flex items-center">
            <input v-model="flashForm.available" type="checkbox" class="mr-2" />
            <label class="text-sm font-medium text-gray-700"
              >Available for booking</label
            >
          </div>
          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              @click="showFlashModal = false"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap !rounded-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap !rounded-button"
            >
              {{ editingFlash ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Other modals would follow similar patterns... -->
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import * as echarts from "echarts";
// Sidebar state
const sidebarExpanded = ref(true);
const activeTab = ref("stats");
// Navigation tabs
const tabs = ref([
  { id: "stats", name: "Dashboard", icon: "fas fa-chart-bar" },
  { id: "flash", name: "Flash Tattoos", icon: "fas fa-tint" },
  { id: "promotions", name: "Promotions", icon: "fas fa-tags" },
  { id: "agenda", name: "Agenda", icon: "fas fa-calendar-alt" },
  { id: "gallery", name: "Gallery", icon: "fas fa-images" },
  { id: "blog", name: "Blog", icon: "fas fa-blog" },
  { id: "settings", name: "Shop Settings", icon: "fas fa-cog" },
  { id: "homepage", name: "Homepage", icon: "fas fa-home" },
  { id: "contacts", name: "Contact Requests", icon: "fas fa-envelope" },
  { id: "process", name: "Process", icon: "fas fa-list-ol" },
  { id: "users", name: "Users", icon: "fas fa-users" },
]);
// Flash tattoos data
const flashTattoos = ref([
  {
    id: 1,
    title: "Minimalist Rose",
    description: "Simple black line rose design",
    image:
      "https://readdy.ai/api/search-image?query=minimalist%20black%20line%20rose%20tattoo%20design%20on%20clean%20white%20background%20simple%20elegant%20style&width=200&height=200&seq=flash-1&orientation=squarish",
    category: "minimalist",
    price: 120,
    available: true,
    size: "Small",
    colors: "Black",
    discount: 0,
  },
  {
    id: 2,
    title: "Geometric Triangle",
    description: "Sacred geometry triangle pattern",
    image:
      "https://readdy.ai/api/search-image?query=geometric%20triangle%20tattoo%20design%20sacred%20geometry%20pattern%20black%20ink%20on%20white%20background%20modern%20style&width=200&height=200&seq=flash-2&orientation=squarish",
    category: "geometric",
    price: 150,
    available: false,
    size: "Medium",
    colors: "Black",
    discount: 10,
  },
]);
const flashSearch = ref("");
const flashCategoryFilter = ref("");
const flashPriceFilter = ref("");
const filteredFlashTattoos = computed(() => {
  return flashTattoos.value.filter((flash) => {
    const matchesSearch = flash.title
      .toLowerCase()
      .includes(flashSearch.value.toLowerCase());
    const matchesCategory =
      !flashCategoryFilter.value ||
      flash.category === flashCategoryFilter.value;
    const matchesPrice =
      !flashPriceFilter.value ||
      (flashPriceFilter.value === "low" && flash.price < 100) ||
      (flashPriceFilter.value === "medium" &&
        flash.price >= 100 &&
        flash.price <= 200) ||
      (flashPriceFilter.value === "high" && flash.price > 200);
    return matchesSearch && matchesCategory && matchesPrice;
  });
});
// Promotions data
const banners = ref([
  {
    id: 1,
    title: "Summer Special",
    description: "20% off all flash tattoos",
    image:
      "https://readdy.ai/api/search-image?query=summer%20tattoo%20promotion%20banner%20design%20with%20vibrant%20colors%20and%20tattoo%20elements%20modern%20advertising%20style&width=400&height=200&seq=banner-1&orientation=landscape",
  },
]);
const globalDiscount = ref(0);
// Bookings data
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calendarDates = ref(Array.from({ length: 35 }, (_, i) => i + 1));
const bookings = ref([
  {
    id: 1,
    client: "John Doe",
    date: "2025-01-20",
    time: "14:00",
    tattoo: "Minimalist Rose",
    status: "confirmed",
  },
  {
    id: 2,
    client: "Jane Smith",
    date: "2025-01-21",
    time: "16:00",
    tattoo: "Geometric Triangle",
    status: "pending",
  },
]);
// Gallery data
const galleryItems = ref([
  {
    id: 1,
    title: "Dragon Sleeve",
    image:
      "https://readdy.ai/api/search-image?query=detailed%20dragon%20tattoo%20sleeve%20artwork%20black%20and%20grey%20realistic%20style%20on%20clean%20background%20professional%20tattoo%20photography&width=300&height=400&seq=gallery-1&orientation=portrait",
    tags: ["dragon", "sleeve", "black-grey"],
    category: "traditional",
    featured: true,
  },
  {
    id: 2,
    title: "Mandala Back Piece",
    image:
      "https://readdy.ai/api/search-image?query=intricate%20mandala%20tattoo%20back%20piece%20geometric%20patterns%20detailed%20linework%20on%20clean%20background%20professional%20tattoo%20art&width=300&height=400&seq=gallery-2&orientation=portrait",
    tags: ["mandala", "geometric", "back-piece"],
    category: "geometric",
    featured: false,
  },
]);
// Blog data
const blogArticles = ref([
  {
    id: 1,
    title: "Tattoo Aftercare Guide",
    category: "Care",
    publishedDate: "2025-01-15",
    views: 1250,
  },
  {
    id: 2,
    title: "Choosing Your First Tattoo",
    category: "Guide",
    publishedDate: "2025-01-10",
    views: 890,
  },
]);
// Shop settings
const shopSettings = ref({
  address: "123 Tattoo Street\nArt District\nCity, State 12345",
  about:
    "Professional tattoo studio specializing in custom artwork and flash designs. We pride ourselves on creating unique, high-quality tattoos in a clean and welcoming environment.",
  photo:
    "https://readdy.ai/api/search-image?query=modern%20tattoo%20shop%20interior%20clean%20professional%20studio%20with%20tattoo%20chairs%20and%20equipment%20bright%20lighting%20contemporary%20design&width=400&height=300&seq=shop-photo&orientation=landscape",
  hours: {
    Lundi: { open: "10:00", close: "18:00", closed: false },
    Mardi: { open: "10:00", close: "18:00", closed: false },
    Mercredi: { open: "10:00", close: "18:00", closed: false },
    Jeudi: { open: "10:00", close: "20:00", closed: false },
    Vendredi: { open: "10:00", close: "20:00", closed: false },
    Samedi: { open: "12:00", close: "18:00", closed: false },
    Dimanche: { open: "", close: "", closed: true },
  },
  social: {
    instagram: "https://instagram.com/tattooshop",
    facebook: "https://facebook.com/tattooshop",
    twitter: "https://twitter.com/tattooshop",
  },
});
const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
// Homepage content
const featuredContent = ref({
  flash: {
    image:
      "https://readdy.ai/api/search-image?query=featured%20flash%20tattoo%20design%20minimalist%20style%20black%20ink%20on%20white%20background%20professional%20tattoo%20art&width=300&height=300&seq=featured-flash&orientation=squarish",
    title: "Minimalist Rose",
  },
  gallery: {
    image:
      "https://readdy.ai/api/search-image?query=featured%20tattoo%20gallery%20project%20artistic%20design%20professional%20tattoo%20photography%20clean%20background&width=300&height=300&seq=featured-gallery&orientation=squarish",
    title: "Dragon Sleeve Project",
  },
  blog: {
    title: "Tattoo Aftercare Guide",
  },
});
const newsItems = ref([
  {
    id: 1,
    title: "New Flash Collection Available",
    description: "Check out our latest minimalist designs",
    image:
      "https://readdy.ai/api/search-image?query=tattoo%20news%20announcement%20banner%20with%20flash%20tattoo%20designs%20modern%20graphic%20design%20style&width=300&height=200&seq=news-1&orientation=landscape",
  },
]);
// Contact requests
const contactRequests = ref([
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    subject: "Custom Tattoo Inquiry",
    message: "I would like to discuss a custom sleeve design...",
    date: "2025-01-18",
    status: "new",
  },
  {
    id: 2,
    name: "Mike Wilson",
    email: "mike@example.com",
    subject: "Booking Question",
    message: "What is your availability for next week?",
    date: "2025-01-17",
    status: "processed",
  },
]);
// Process steps
const processSteps = ref([
  {
    id: 1,
    title: "Consultation",
    description: "We discuss your ideas and create a custom design",
    image:
      "https://readdy.ai/api/search-image?query=tattoo%20consultation%20process%20artist%20and%20client%20discussing%20design%20sketches%20professional%20studio%20environment&width=200&height=150&seq=process-1&orientation=landscape",
    link: "",
  },
  {
    id: 2,
    title: "Design Approval",
    description: "Review and approve your final tattoo design",
    image:
      "https://readdy.ai/api/search-image?query=tattoo%20design%20approval%20process%20sketch%20review%20and%20client%20approval%20professional%20tattoo%20studio&width=200&height=150&seq=process-2&orientation=landscape",
    link: "",
  },
  {
    id: 3,
    title: "Tattoo Session",
    description: "Professional tattooing in a clean, safe environment",
    image:
      "https://readdy.ai/api/search-image?query=professional%20tattoo%20session%20artist%20working%20on%20client%20clean%20studio%20environment%20safety%20equipment&width=200&height=150&seq=process-3&orientation=landscape",
    link: "",
  },
]);
// Admin users
const adminUsers = ref([
  {
    id: 1,
    name: "Admin User",
    email: "admin@tattooshop.com",
    role: "Super Admin",
    lastLogin: "2025-01-18 14:30",
    active: true,
  },
  {
    id: 2,
    name: "Artist Manager",
    email: "manager@tattooshop.com",
    role: "Manager",
    lastLogin: "2025-01-17 16:45",
    active: true,
  },
]);
// Modal states
const showFlashModal = ref(false);
const showBannerModal = ref(false);
const showBookingModal = ref(false);
const showGalleryModal = ref(false);
const showBlogModal = ref(false);
const showNewsModal = ref(false);
const showUserModal = ref(false);
// Form states
const editingFlash = ref(false);
const flashForm = ref({
  title: "",
  description: "",
  size: "",
  price: 0,
  category: "minimalist",
  colors: "",
  discount: 0,
  available: true,
});
// Chart reference
const chartContainer = ref<HTMLElement>();
// Computed properties
const getCurrentTab = computed(() => {
  return tabs.value.find((tab) => tab.id === activeTab.value) || tabs.value[0];
});
// Methods
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
};
const getBookingsForDate = (date: number) => {
  return bookings.value.filter((booking) => {
    const bookingDate = new Date(booking.date).getDate();
    return bookingDate === date;
  });
};
const getStatusColor = (status: string) => {
  const colors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};
const getRoleColor = (role: string) => {
  const colors = {
    "Super Admin": "bg-purple-100 text-purple-800",
    Manager: "bg-blue-100 text-blue-800",
    Editor: "bg-green-100 text-green-800",
  };
  return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
};
const saveFlash = () => {
  if (editingFlash.value) {
    // Update existing flash tattoo
    const index = flashTattoos.value.findIndex(
      (f) => f.id === flashForm.value.id
    );
    if (index !== -1) {
      flashTattoos.value[index] = { ...flashForm.value };
    }
  } else {
    // Add new flash tattoo
    const newFlash = {
      ...flashForm.value,
      id: Date.now(),
      image:
        "https://readdy.ai/api/search-image?query=new%20flash%20tattoo%20design%20artistic%20style%20black%20ink%20on%20white%20background%20professional%20tattoo%20art&width=200&height=200&seq=new-flash&orientation=squarish",
    };
    flashTattoos.value.push(newFlash);
  }
  showFlashModal.value = false;
  resetFlashForm();
};
const editFlash = (flash: any) => {
  flashForm.value = { ...flash };
  editingFlash.value = true;
  showFlashModal.value = true;
};
const deleteFlash = (id: number) => {
  if (confirm("Are you sure you want to delete this flash tattoo?")) {
    const index = flashTattoos.value.findIndex((f) => f.id === id);
    if (index !== -1) {
      flashTattoos.value.splice(index, 1);
    }
  }
};
const resetFlashForm = () => {
  flashForm.value = {
    title: "",
    description: "",
    size: "",
    price: 0,
    category: "minimalist",
    colors: "",
    discount: 0,
    available: true,
  };
  editingFlash.value = false;
};
const editBanner = (banner: any) => {
  // Implementation for editing banner
};
const deleteBanner = (id: number) => {
  if (confirm("Are you sure you want to delete this banner?")) {
    const index = banners.value.findIndex((b) => b.id === id);
    if (index !== -1) {
      banners.value.splice(index, 1);
    }
  }
};
const viewBooking = (booking: any) => {
  // Implementation for viewing booking details
};
const toggleFeatured = (item: any) => {
  item.featured = !item.featured;
};
const editGalleryItem = (item: any) => {
  // Implementation for editing gallery item
};
const deleteGalleryItem = (id: number) => {
  if (confirm("Are you sure you want to delete this gallery item?")) {
    const index = galleryItems.value.findIndex((g) => g.id === id);
    if (index !== -1) {
      galleryItems.value.splice(index, 1);
    }
  }
};
const editArticle = (article: any) => {
  // Implementation for editing article
};
const deleteArticle = (id: number) => {
  if (confirm("Are you sure you want to delete this article?")) {
    const index = blogArticles.value.findIndex((a) => a.id === id);
    if (index !== -1) {
      blogArticles.value.splice(index, 1);
    }
  }
};
const editNews = (news: any) => {
  // Implementation for editing news
};
const deleteNews = (id: number) => {
  if (confirm("Are you sure you want to delete this news item?")) {
    const index = newsItems.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      newsItems.value.splice(index, 1);
    }
  }
};
const toggleContactStatus = (contact: any) => {
  contact.status = contact.status === "new" ? "processed" : "new";
};
const viewContact = (contact: any) => {
  // Implementation for viewing contact details
};
const addProcessStep = () => {
  const newStep = {
    id: Date.now(),
    title: "",
    description: "",
    image: "",
    link: "",
  };
  processSteps.value.push(newStep);
};
const moveStepUp = (index: number) => {
  if (index > 0) {
    const temp = processSteps.value[index];
    processSteps.value[index] = processSteps.value[index - 1];
    processSteps.value[index - 1] = temp;
  }
};
const moveStepDown = (index: number) => {
  if (index < processSteps.value.length - 1) {
    const temp = processSteps.value[index];
    processSteps.value[index] = processSteps.value[index + 1];
    processSteps.value[index + 1] = temp;
  }
};
const removeProcessStep = (index: number) => {
  if (confirm("Are you sure you want to remove this step?")) {
    processSteps.value.splice(index, 1);
  }
};
const editUser = (user: any) => {
  // Implementation for editing user
};
const deleteUser = (id: number) => {
  if (confirm("Are you sure you want to delete this user?")) {
    const index = adminUsers.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      adminUsers.value.splice(index, 1);
    }
  }
};
// Initialize chart
onMounted(() => {
  if (chartContainer.value) {
    const chart = echarts.init(chartContainer.value);
    const option = {
      animation: false,
      title: {
        text: "Monthly Statistics",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["Bookings", "Flash Sales", "Blog Views"],
      },
      xAxis: {
        type: "category",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "Bookings",
          type: "line",
          data: [12, 19, 15, 25, 22, 30],
        },
        {
          name: "Flash Sales",
          type: "line",
          data: [8, 15, 12, 18, 16, 25],
        },
        {
          name: "Blog Views",
          type: "line",
          data: [120, 180, 150, 220, 200, 280],
        },
      ],
    };
    chart.setOption(option);
  }
});
</script>
<style scoped>
.\!rounded-button {
  border-radius: 0.5rem;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
