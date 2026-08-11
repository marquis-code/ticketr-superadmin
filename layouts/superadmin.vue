<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"></div>

    <!-- Sidebar -->
    <aside :class="['fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
      <div class="p-6 border-b border-gray-200 flex items-center justify-between">
        <NuxtLink to="/dashboard" class="flex items-center space-x-3" @click="isSidebarOpen = false">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white">
            👑
          </div>
          <span class="font-bold text-lg text-gray-900">Super Admin</span>
        </NuxtLink>
        <button @click="isSidebarOpen = false" class="lg:hidden text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NuxtLink to="/dashboard" class="nav-link" active-class="nav-link-active" exact-active-class="nav-link-active" @click="isSidebarOpen = false">
          Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/events" class="nav-link" active-class="nav-link-active" @click="isSidebarOpen = false">
          Global Events
        </NuxtLink>
        <NuxtLink to="/dashboard/transactions" class="nav-link" active-class="nav-link-active" @click="isSidebarOpen = false">
          Global Transactions
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <button @click="confirmLogout" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Mobile Header -->
      <header class="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <button @click="isSidebarOpen = true" class="text-gray-600 hover:text-gray-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span class="font-bold text-gray-900">Ticketr</span>
        <div class="w-6"></div> <!-- spacer -->
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isSidebarOpen = ref(false);
const router = useRouter();

function confirmLogout() {
  if (import.meta.client) {
    localStorage.removeItem('ticketr_superadmin_token');
  }
  router.push('/login');
}
</script>

<style scoped>
.nav-link {
  @apply block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors;
}
.nav-link-active {
  @apply bg-emerald-50 text-emerald-700;
}
</style>
