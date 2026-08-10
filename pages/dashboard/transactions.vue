<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Header -->
    <header class="glass-card border-b border-gray-200/80 px-4 md:px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xl text-gray-900">
              👑
            </div>
            <span class="font-bold text-lg text-gray-900">Ticketr Super Admin</span>
          </NuxtLink>

          <nav class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-xs font-semibold">
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg">Overview</NuxtLink>
            <NuxtLink to="/dashboard/events" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg">Global Events</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="bg-primary text-white px-3 py-1.5 rounded-lg">Global Transactions</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Global Revenue & Transaction Audit Log</h1>
        <p class="text-xs text-gray-600 mt-1">Monitor platform GMV across all tenants and Paystack transaction references.</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
          Loading global transactions...
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No transactions processed yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Order Number</th>
                <th class="px-6 py-4">Tenant / Organization</th>
                <th class="px-6 py-4">Customer Email</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Paystack Ref</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="o in orders" :key="o._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-mono text-xs text-emerald-400">{{ o.orderNumber }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">{{ o.tenantId?.name || 'Tenant' }}</td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ o.customerEmail }}</td>
                <td class="px-6 py-4 font-extrabold text-gray-900">₦{{ o.totalAmount?.toLocaleString() }}</td>
                <td class="px-6 py-4 font-mono text-xs text-gray-600">{{ o.paystackReference }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="o.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ o.status }}
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

const orders = ref([]);
const loading = ref(true);

async function loadGlobalOrders() {
  const token = localStorage.getItem('ticketr_super_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/orders/superadmin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      orders.value = await res.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadGlobalOrders();
});
</script>
