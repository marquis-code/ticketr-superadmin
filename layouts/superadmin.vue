<template>
  <div class="min-h-screen bg-paper flex">
    <div v-if="mobileOpen" class="fixed inset-0 bg-ink/50 z-40 lg:hidden" @click="mobileOpen = false" />

    <aside
      class="fixed lg:sticky top-0 left-0 z-50 h-screen w-[250px] bg-ink text-paper flex flex-col transition-transform duration-300 shrink-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="h-[68px] px-4 flex items-center justify-between border-b border-white/10">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-xl bg-lime flex items-center justify-center">
            <ShieldCheck class="w-[18px] h-[18px] text-ink" />
          </span>
          <div>
            <p class="font-display text-[18px] font-semibold tracking-[-0.04em] leading-none">ticketr<span class="text-lime">.</span></p>
            <p class="text-[8.5px] font-bold uppercase tracking-[0.18em] text-paper/40 mt-1">Platform admin</p>
          </div>
        </NuxtLink>
        <button class="lg:hidden p-1.5 text-paper/60" aria-label="Close menu" @click="mobileOpen = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        <p class="console-label">Platform</p>
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="console-link" :class="{ 'console-link-active': isActive(item) }" @click="mobileOpen = false">
          <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-2 border-t border-white/10 space-y-0.5">
        <a :href="publicUrl" target="_blank" class="console-link">
          <ExternalLink class="w-[18px] h-[18px]" /> Public storefront
        </a>
        <button type="button" class="console-link w-full" @click="logoutOpen = true">
          <LogOut class="w-[18px] h-[18px]" /> Sign out
        </button>
      </div>
    </aside>

    <div class="flex-1 min-w-0 flex flex-col">
      <header class="sticky top-0 z-30 h-[68px] bg-paper/90 backdrop-blur border-b border-line">
        <div class="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <button class="lg:hidden p-2 -ml-1 rounded-lg border border-line bg-white" aria-label="Open menu" @click="mobileOpen = true">
              <Menu class="w-5 h-5" />
            </button>
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Platform admin</p>
              <h1 class="font-display text-[17px] font-semibold text-ink truncate">{{ title }}</h1>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="chip-ink hidden sm:inline-flex !text-[9px]">SUPER ADMIN</span>
            <div class="hidden sm:block text-right">
              <p class="text-[12.5px] font-semibold text-ink leading-tight">{{ user?.name || 'Administrator' }}</p>
              <p class="text-[10px] text-muted">{{ user?.email }}</p>
            </div>
            <span class="w-8 h-8 rounded-full bg-ink text-lime flex items-center justify-center text-[11px] font-bold">
              {{ initials(user?.name || 'A') }}
            </span>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16">
        <div class="mx-auto w-full max-w-[1280px]">
          <slot />
        </div>
      </main>
    </div>

    <UiModal :open="logoutOpen" title="Sign out of platform admin?" eyebrow="Confirm" size="sm" @close="logoutOpen = false">
      <p class="text-sm text-muted">Your platform-wide session ends on this device.</p>
      <template #footer>
        <button class="btn-danger" type="button" @click="logout">Sign out</button>
        <button class="btn-secondary" type="button" @click="logoutOpen = false">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Banknote, ExternalLink, LayoutDashboard, LogOut, Mail, Menu, ShieldCheck, Ticket, Users, X } from 'lucide-vue-next';

const route = useRoute();
const config = useRuntimeConfig();
const mobileOpen = ref(false);
const logoutOpen = ref(false);
const user = ref<any>(null);

const publicUrl = computed(() => appOrigin('public'));
const nav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/events', label: 'Events', icon: Ticket },
  { to: '/dashboard/transactions', label: 'Transactions', icon: Users },
  { to: '/dashboard/payouts', label: 'Payouts', icon: Banknote },
  { to: '/dashboard/email-logs', label: 'Deliverability', icon: Mail },
];

const title = computed(() => {
  if (route.path === '/dashboard') return 'Platform overview';
  if (route.path.includes('/events')) return 'All events';
  if (route.path.includes('/transactions')) return 'All transactions';
  if (route.path.includes('/payouts')) return 'Payout settlements';
  if (route.path.includes('/email-logs')) return 'Email delivery';
  return 'Platform';
});

function isActive(item: { to: string }) {
  if (item.to === '/dashboard') return route.path === '/dashboard';
  return route.path.startsWith(item.to);
}

function logout() {
  localStorage.removeItem('ticketr_super_token');
  localStorage.removeItem('ticketr_super_user');
  navigateTo('/login');
}

onMounted(() => {
  try {
    user.value = JSON.parse(localStorage.getItem('ticketr_super_user') || 'null');
  } catch {
    user.value = null;
  }
});
</script>
