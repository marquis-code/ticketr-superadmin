<template>
  <div>
    <!-- Header -->
    

    <main class="w-full space-y-8">
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
definePageMeta({ layout: 'superadmin' });

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
