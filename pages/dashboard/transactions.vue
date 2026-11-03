<template>
  <div class="space-y-4">
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="stat !py-4">
        <p class="stat-label">Filtered volume</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ formatCompactMoney(filteredTotal) }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Orders</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ filtered.length }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Platform fees</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ formatCompactMoney(filteredFees) }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Paid</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ filtered.filter(o => o.status === 'PAID').length }}</p>
      </div>
    </section>

    <section class="surface p-4 flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input v-model="search" type="search" placeholder="Search order, customer, organizer" class="input !pl-10 !py-2.5" />
      </div>
      <select v-model="status" class="input sm:w-36 !py-2.5">
        <option value="ALL">All statuses</option>
        <option value="PAID">Paid</option>
        <option value="PENDING">Pending</option>
        <option value="AWAITING_APPROVAL">Awaiting approval</option>
        <option value="PARTIALLY_PAID">Part-paid</option>
        <option value="FAILED">Failed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="REFUNDED">Refunded</option>
      </select>
      <button class="btn-secondary btn-sm shrink-0" type="button" @click="exportCsv">
        <Download class="w-3.5 h-3.5" /> Export
      </button>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-2.5">
        <div v-for="n in 7" :key="n" class="skeleton h-12" />
      </div>
      <UiEmpty v-else-if="!paged.length" title="No transactions match" message="Try a different search or status." class="!py-14">
        <template #icon><ReceiptText class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[900px]">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Organizer</th>
            <th>Event</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paged" :key="order._id">
            <td class="mono text-[10.5px] text-muted whitespace-nowrap">{{ order.orderNumber }}</td>
            <td class="max-w-[180px]">
              <p class="text-[12.5px] font-semibold text-ink truncate">{{ order.customerName }}</p>
              <p class="text-[10.5px] text-muted truncate">{{ order.customerEmail }}</p>
            </td>
            <td class="max-w-[150px] text-[11.5px] text-ink truncate">{{ order.tenantId?.name || '—' }}</td>
            <td class="max-w-[180px] text-[11.5px] text-ink truncate">{{ order.eventId?.title || '—' }}</td>
            <td class="whitespace-nowrap">
              <p class="text-[12.5px] font-semibold text-ink">{{ formatMoney(order.totalAmount) }}</p>
              <p v-if="order.platformFee" class="text-[10px] text-muted">fee {{ formatMoney(order.platformFee) }}</p>
            </td>
            <td><UiBadge :value="order.status" dot /></td>
            <td class="whitespace-nowrap text-[11px] text-muted">{{ formatDate(order.createdAt, { day: 'numeric', month: 'short' }) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-[12px] text-muted">Page {{ page }} of {{ totalPages }}</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="page--">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= totalPages" @click="page++">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Download, ReceiptText, Search } from 'lucide-vue-next';

definePageMeta({ layout: 'superadmin' });

const orders = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const status = ref('ALL');
const page = ref(1);
const pageSize = 25;

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    const matchesStatus = status.value === 'ALL' || order.status === status.value;
    const matchesSearch =
      !query ||
      order.orderNumber?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.customerEmail?.toLowerCase().includes(query) ||
      order.tenantId?.name?.toLowerCase().includes(query) ||
      order.eventId?.title?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
});

const filteredTotal = computed(() =>
  filtered.value.filter((o) => o.status === 'PAID').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
);
const filteredFees = computed(() =>
  filtered.value.reduce((sum, o) => sum + (o.platformFee || 0), 0),
);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

watch([search, status], () => (page.value = 1));

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const data = await apiRequest<any>('/orders/superadmin/all');
    orders.value = Array.isArray(data) ? data : data?.data || [];
  } catch (err) {
    error.value = errorMessage(err);
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

function exportCsv() {
  if (!filtered.value.length) return;
  const rows = [
    ['Order', 'Customer', 'Email', 'Organizer', 'Event', 'Amount', 'Fee', 'Status', 'Date'],
    ...filtered.value.map((order) => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.tenantId?.name || '',
      order.eventId?.title || '',
      order.totalAmount,
      order.platformFee || 0,
      order.status,
      new Date(order.createdAt).toISOString(),
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ticketr-platform-transactions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
useSeoMeta({ title: 'All transactions', robots: 'noindex, nofollow' });
</script>
