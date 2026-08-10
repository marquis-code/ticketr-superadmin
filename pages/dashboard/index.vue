<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Navbar -->
    <header class="glass-card border-b border-gray-200/80 px-4 md:px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <NuxtLink to="/dashboard" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xl text-gray-900">
              👑
            </div>
            <div>
              <span class="font-bold text-lg text-gray-900 block">Ticketr Super Admin</span>
              <span class="text-xs text-emerald-400 font-medium">Global Platform Control</span>
            </div>
          </NuxtLink>

          <!-- Nav Tabs -->
          <nav class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-xs font-semibold">
            <NuxtLink to="/dashboard" class="bg-primary text-white px-3 py-1.5 rounded-lg">Overview</NuxtLink>
            <NuxtLink to="/dashboard/events" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition">Global Events</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition">Global Transactions</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <button @click="showAddModal = true" class="btn-primary text-xs !py-2 !px-3.5 flex items-center gap-1">
            <span>+ Onboard Tenant</span>
          </button>
          <button @click="showLogoutModal = true" class="text-xs text-gray-600 hover:text-gray-900 px-3 py-2">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-8">
      <!-- Global KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Global Platform GMV</span>
          <div class="text-3xl font-extrabold text-gray-900">
            ₦{{ (analytics?.globalGMV || 0).toLocaleString() }}
          </div>
          <span class="text-[11px] text-emerald-400 font-medium block mt-2">Across all organizations</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Onboarded Tenants</span>
          <div class="text-3xl font-extrabold text-gray-900">
            {{ tenants.length }}
          </div>
          <span class="text-[11px] text-teal-400 font-medium block mt-2">Active Organizations</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Global Events</span>
          <div class="text-3xl font-extrabold text-gray-900">
            {{ analytics?.totalEvents || 0 }}
          </div>
          <span class="text-[11px] text-gray-600 font-medium block mt-2">Total Published Events</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-emerald-500/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Tickets Issued</span>
          <div class="text-3xl font-extrabold text-gray-900">
            {{ analytics?.totalTicketsSold || 0 }}
          </div>
          <span class="text-[11px] text-primary font-medium block mt-2">Global Ticket Volume</span>
        </div>
      </div>

      <!-- Tenants Management Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Tenant Organizations</h2>
          <button @click="showAddModal = true" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            + Add New Tenant
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Organization Name</th>
                <th class="px-6 py-4">Slug / Subdomain</th>
                <th class="px-6 py-4">Contact Email</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="t in tenants" :key="t._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-semibold text-gray-900">
                  {{ t.name }}
                </td>
                <td class="px-6 py-4 font-mono text-xs text-emerald-400">
                  {{ t.slug }}.ticketr.org
                </td>
                <td class="px-6 py-4 text-xs text-gray-600">
                  {{ t.contactEmail }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ t.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="toggleStatus(t)"
                    class="text-xs font-semibold px-3 py-1 rounded-lg border transition"
                    :class="t.status === 'ACTIVE' ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10' : 'border-emerald-500/40 text-emerald-400 hover:bg-primary-700/10'"
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
    <div v-if="showAddModal" class="fixed inset-0 z-50 /80 backdrop-blur-sm flex items-center justify-center p-6">
      <div class="w-full max-w-md glass-card rounded-2xl p-6 border-emerald-500/30">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Onboard New Organization Tenant</h3>

        <form @submit.prevent="createTenant" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Organization Name</label>
            <input
              v-model="newTenant.name"
              type="text"
              placeholder="e.g. School of Nursing"
              required
              class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Subdomain Slug</label>
            <div class="flex items-center">
              <input
                v-model="newTenant.slug"
                type="text"
                placeholder="nursing"
                required
                class="w-full  border border-gray-200 rounded-l-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
              />
              <span class="bg-gray-100 border border-l-0 border-gray-200 text-gray-600 text-xs px-3 py-3 rounded-r-xl">.ticketr.org</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
            <input
              v-model="newTenant.contactEmail"
              type="email"
              placeholder="admin@nursing.edu"
              required
              class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 w-full max-w-sm p-6 rounded-2xl relative shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
        <p class="text-sm text-gray-500 mb-6">Are you sure you want to sign out of your account?</p>
        <div class="flex justify-end gap-3">
          <button @click="showLogoutModal = false" class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button @click="confirmLogout" class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Yes, Logout</button>
        </div>
      </div>
    </div>
</template>
<script setup>
import { toast } from 'vue-sonner';
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

const showLogoutModal = ref(false);

function confirmLogout() {
  localStorage.removeItem('ticketr_super_token');
  localStorage.removeItem('ticketr_super_user');
  useRouter().push('/login');
}

async function loadData() {
  const token = localStorage.getItem('ticketr_super_token');
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
  const token = localStorage.getItem('ticketr_super_token');
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
      toast.error(err.message || 'Failed to create tenant');
    }
  } catch (err) {
    toast.error('Network error while creating tenant');
  }
}

async function toggleStatus(t) {
  const token = localStorage.getItem('ticketr_super_token');
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
