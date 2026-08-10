<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Navbar -->
    <header class="glass-card border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <NuxtLink to="/dashboard" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-500/20">
              👑
            </div>
            <div>
              <span class="font-bold text-lg text-white block">CMultiTickets Super Admin</span>
              <span class="text-xs text-emerald-400 font-medium">Global Platform Control</span>
            </div>
          </NuxtLink>

          <!-- Nav Tabs -->
          <nav class="hidden md:flex items-center space-x-4 text-xs font-semibold">
            <NuxtLink to="/dashboard" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg">Overview</NuxtLink>
            <NuxtLink to="/dashboard/events" class="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition">Global Events</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition">Global Transactions</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <button @click="showAddModal = true" class="btn-primary text-xs !py-2 !px-3.5 flex items-center gap-1">
            <span>+ Onboard Tenant</span>
          </button>
          <button @click="logout" class="text-xs text-slate-400 hover:text-white px-3 py-2">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full space-y-8">
      <!-- Global KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Global Platform GMV</span>
          <div class="text-3xl font-extrabold text-white">
            ₦{{ (analytics?.globalGMV || 0).toLocaleString() }}
          </div>
          <span class="text-[11px] text-emerald-400 font-medium block mt-2">Across all organizations</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Onboarded Tenants</span>
          <div class="text-3xl font-extrabold text-white">
            {{ tenants.length }}
          </div>
          <span class="text-[11px] text-teal-400 font-medium block mt-2">Active Organizations</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Global Events</span>
          <div class="text-3xl font-extrabold text-white">
            {{ analytics?.totalEvents || 0 }}
          </div>
          <span class="text-[11px] text-slate-400 font-medium block mt-2">Total Published Events</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Tickets Issued</span>
          <div class="text-3xl font-extrabold text-white">
            {{ analytics?.totalTicketsSold || 0 }}
          </div>
          <span class="text-[11px] text-indigo-400 font-medium block mt-2">Global Ticket Volume</span>
        </div>
      </div>

      <!-- Tenants Management Table -->
      <div class="glass-card rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-white">Tenant Organizations</h2>
          <button @click="showAddModal = true" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            + Add New Tenant
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Organization Name</th>
                <th class="py-3 px-4">Slug / Subdomain</th>
                <th class="py-3 px-4">Contact Email</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="t in tenants" :key="t._id" class="hover:bg-slate-900/40 transition">
                <td class="py-4 px-4 font-semibold text-white">
                  {{ t.name }}
                </td>
                <td class="py-4 px-4 font-mono text-xs text-emerald-400">
                  {{ t.slug }}.cmultickets.com
                </td>
                <td class="py-4 px-4 text-xs text-slate-400">
                  {{ t.contactEmail }}
                </td>
                <td class="py-4 px-4">
                  <span
                    :class="t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ t.status }}
                  </span>
                </td>
                <td class="py-4 px-4 text-right">
                  <button
                    @click="toggleStatus(t)"
                    class="text-xs font-semibold px-3 py-1 rounded-lg border transition"
                    :class="t.status === 'ACTIVE' ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'"
                  >
                    {{ t.status === 'ACTIVE' ? 'Suspend' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal for Adding Tenant -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div class="w-full max-w-md glass-card rounded-2xl p-6 border-emerald-500/30">
        <h3 class="text-xl font-bold text-white mb-4">Onboard New Organization Tenant</h3>

        <form @submit.prevent="createTenant" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Organization Name</label>
            <input
              v-model="newTenant.name"
              type="text"
              placeholder="e.g. School of Nursing"
              required
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Subdomain Slug</label>
            <div class="flex items-center">
              <input
                v-model="newTenant.slug"
                type="text"
                placeholder="nursing"
                required
                class="w-full bg-slate-900 border border-slate-800 rounded-l-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <span class="bg-slate-800 border border-l-0 border-slate-800 text-slate-400 text-xs px-3 py-3 rounded-r-xl">.cmultickets.com</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">Contact Email</label>
            <input
              v-model="newTenant.contactEmail"
              type="email"
              placeholder="admin@nursing.edu"
              required
              class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" @click="showAddModal = false" class="btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" class="btn-primary text-xs">
              Create Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();

const analytics = ref(null);
const tenants = ref([]);
const showAddModal = ref(false);

const newTenant = ref({
  name: '',
  slug: '',
  contactEmail: '',
});

function logout() {
  localStorage.removeItem('cmt_super_token');
  localStorage.removeItem('cmt_super_user');
  useRouter().push('/login');
}

async function loadData() {
  const token = localStorage.getItem('cmt_super_token');
  if (!token) {
    useRouter().push('/login');
    return;
  }

  try {
    const [analyticsRes, tenantsRes] = await Promise.all([
      fetch(`${config.public.apiBase}/analytics/superadmin`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${config.public.apiBase}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (analyticsRes.ok) analytics.value = await analyticsRes.json();
    if (tenantsRes.ok) tenants.value = await tenantsRes.json();
  } catch (err) {
    console.error('Error loading super admin data:', err);
  }
}

async function createTenant() {
  const token = localStorage.getItem('cmt_super_token');
  try {
    const res = await fetch(`${config.public.apiBase}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTenant.value),
    });

    if (res.ok) {
      showAddModal.value = false;
      newTenant.value = { name: '', slug: '', contactEmail: '' };
      await loadData();
    } else {
      const err = await res.json();
      alert(err.message || 'Failed to create tenant');
    }
  } catch (err) {
    alert('Network error while creating tenant');
  }
}

async function toggleStatus(t) {
  const token = localStorage.getItem('cmt_super_token');
  const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  try {
    const res = await fetch(`${config.public.apiBase}/tenants/${t._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadData();
    }
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  loadData();
});
</script>
