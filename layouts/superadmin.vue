<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <header class="glass-card border-b border-gray-200/80 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <NuxtLink to="/dashboard" class="flex items-center space-x-3" @click="isMenuOpen = false">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white">
                👑
              </div>
              <span class="font-bold text-lg text-gray-900 hidden sm:block">Ticketr Super Admin</span>
            </NuxtLink>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center gap-2">
              <NuxtLink to="/dashboard" class="nav-link" active-class="nav-link-active">Overview</NuxtLink>
              <NuxtLink to="/dashboard/events" class="nav-link" active-class="nav-link-active">Global Events</NuxtLink>
              <NuxtLink to="/dashboard/transactions" class="nav-link" active-class="nav-link-active">Global Transactions</NuxtLink>
            </nav>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Emitting event upward to trigger modal in index.vue could be tricky, but we can manage modals with global state later. For now let's just leave the button if needed, but it might be better handled in the page. -->
            
            <!-- Mobile Menu Button -->
            <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
              <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu Dropdown -->
      <div v-if="isMenuOpen" class="md:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full pb-4">
        <nav class="flex flex-col px-4 pt-2 space-y-1">
          <NuxtLink to="/dashboard" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Overview</NuxtLink>
          <NuxtLink to="/dashboard/events" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Global Events</NuxtLink>
          <NuxtLink to="/dashboard/transactions" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Global Transactions</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isMenuOpen = ref(false);
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors;
}
.nav-link-active {
  @apply bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary;
}
.mobile-nav-link {
  @apply block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors;
}
.mobile-nav-link-active {
  @apply bg-primary/10 text-primary;
}
</style>
