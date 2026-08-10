<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Top Header Navigation -->
    <header class="glass-card border-b border-gray-200/80 px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xl text-gray-900">
              👑
            </div>
            <span class="font-bold text-lg text-gray-900">Ticketr Super Admin</span>
          </NuxtLink>

          <nav class="hidden md:flex items-center space-x-4 text-xs font-semibold">
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg">Overview</NuxtLink>
            <NuxtLink to="/dashboard/events" class="bg-primary text-white px-3 py-1.5 rounded-lg">Global Events</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg">Global Transactions</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Global Events Oversight</h1>
        <p class="text-xs text-gray-600 mt-1">Audit published events across all onboarded institutions and organizations.</p>
      </div>

      <div class="glass-card rounded-2xl p-6">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
          Loading global events...
        </div>

        <div v-else-if="events.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No events created across any tenant yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-700">
            <thead class="/60 text-xs uppercase text-gray-600 border-b border-gray-200">
              <tr>
                <th class="py-3 px-4">Event Title</th>
                <th class="py-3 px-4">Organization / Tenant</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Location</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="ev in events" :key="ev._id" class="hover:/40 transition">
                <td class="py-4 px-4 font-semibold text-gray-900">{{ ev.title }}</td>
                <td class="py-4 px-4 font-mono text-xs text-emerald-400">
                  {{ ev.tenantId?.name || 'Tenant' }} ({{ ev.tenantId?.slug || 'slug' }})
                </td>
                <td class="py-4 px-4 text-xs text-gray-600">{{ new Date(ev.startDate).toLocaleDateString() }}</td>
                <td class="py-4 px-4 text-xs text-gray-700">{{ ev.location }}</td>
                <td class="py-4 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {{ ev.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();

const events = ref([]);
const loading = ref(true);

async function loadGlobalEvents() {
  const token = localStorage.getItem('ticketr_super_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/events/superadmin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      events.value = await res.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadGlobalEvents();
});
</script>
