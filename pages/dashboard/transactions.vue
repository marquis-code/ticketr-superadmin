<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Header -->
    <header class="glass-card border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xl text-white">
              👑
            </div>
            <span class="font-bold text-lg text-white">CMultiTickets Super Admin</span>
          </NuxtLink>

          <nav class="hidden md:flex items-center space-x-4 text-xs font-semibold">
            <NuxtLink to="/dashboard" class="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg">Overview</NuxtLink>
            <NuxtLink to="/dashboard/events" class="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg">Global Events</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="bg-emerald-600 text-white px-3 py-1.5 rounded-lg">Global Transactions</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-white">Global Revenue & Transaction Audit Log</h1>
        <p class="text-xs text-slate-400 mt-1">Monitor platform GMV across all tenants and Paystack transaction references.</p>
      </div>

      <div class="glass-card rounded-2xl p-6">
        <div v-if="loading" class="text-center py-12 text-slate-500 text-sm">
          Loading global transactions...
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-12 text-slate-500 text-sm">
          No transactions processed yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Order Number</th>
                <th class="py-3 px-4">Tenant / Organization</th>
                <th class="py-3 px-4">Customer Email</th>
                <th class="py-3 px-4">Amount</th>
                <th class="py-3 px-4">Paystack Ref</th>
                <th class="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-for="o in orders" :key="o._id" class="hover:bg-slate-900/40 transition">
                <td class="py-4 px-4 font-mono text-xs text-emerald-400">{{ o.orderNumber }}</td>
                <td class="py-4 px-4 font-semibold text-white">{{ o.tenantId?.name || 'Tenant' }}</td>
                <td class="py-4 px-4 text-xs text-slate-400">{{ o.customerEmail }}</td>
                <td class="py-4 px-4 font-extrabold text-white">₦{{ o.totalAmount?.toLocaleString() }}</td>
                <td class="py-4 px-4 font-mono text-xs text-slate-400">{{ o.paystackReference }}</td>
                <td class="py-4 px-4">
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
  const token = localStorage.getItem('cmt_super_token');
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
