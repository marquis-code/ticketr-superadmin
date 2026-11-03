<template>
  <div class="space-y-4">
    <section class="surface p-4 flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input v-model="search" type="search" placeholder="Search recipient or subject" class="input !pl-10 !py-2.5" />
      </div>
      <select v-model="status" class="input sm:w-36 !py-2.5">
        <option value="ALL">All statuses</option>
        <option value="SENT">Sent</option>
        <option value="FAILED">Failed</option>
        <option value="PENDING">Pending</option>
      </select>
      <button class="btn-secondary btn-sm shrink-0" type="button" @click="load">
        <RefreshCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" /> Refresh
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
      <UiEmpty v-else-if="!filtered.length" title="No delivery records" message="Ticket and campaign emails appear here as they are sent." class="!py-14">
        <template #icon><Mail class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[820px]">
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Attempts</th>
            <th>Created</th>
            <th class="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filtered" :key="log._id">
            <td class="text-[12px] text-ink max-w-[190px] truncate">{{ log.recipientEmail }}</td>
            <td class="max-w-[300px]">
              <p class="text-[12px] text-ink truncate">{{ log.subject }}</p>
              <p v-if="log.errorReason" class="text-[10.5px] text-coral truncate">{{ log.errorReason }}</p>
            </td>
            <td><UiBadge :value="log.status" dot /></td>
            <td class="text-[11.5px] text-muted">{{ log.retryCount || 0 }}</td>
            <td class="text-[11px] text-muted whitespace-nowrap">{{ formatDateTime(log.createdAt) }}</td>
            <td>
              <div class="flex justify-end">
                <button
                  v-if="log.status === 'FAILED'"
                  class="btn-secondary btn-sm !py-1.5 !px-2.5 text-[11px]"
                  type="button"
                  :disabled="retrying === log._id"
                  @click="retry(log)"
                >
                  {{ retrying === log._id ? 'Retrying…' : 'Retry' }}
                </button>
                <span v-else class="text-[10px] text-muted px-2">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="flex items-center justify-between">
      <p class="text-[12px] text-muted">{{ meta.total || 0 }} records · page {{ page }} of {{ meta.totalPages || 1 }}</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= (meta.totalPages || 1)" @click="changePage(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Mail, RefreshCcw, Search } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'superadmin' });

const logs = ref<any[]>([]);
const meta = ref<any>({});
const loading = ref(true);
const error = ref('');
const search = ref('');
const status = ref('ALL');
const page = ref(1);
const limit = 30;
const retrying = ref<string | null>(null);

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  return logs.value.filter((log) => {
    const matchesStatus = status.value === 'ALL' || log.status === status.value;
    const matchesSearch =
      !query ||
      log.recipientEmail?.toLowerCase().includes(query) ||
      log.subject?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const data = await apiRequest<any>(`/email-logs?page=${page.value}&limit=${limit}`);
    logs.value = data?.data || [];
    meta.value = data?.meta || {};
  } catch (err) {
    error.value = errorMessage(err);
    logs.value = [];
  } finally {
    loading.value = false;
  }
}

function changePage(next: number) {
  if (next < 1 || next > (meta.value.totalPages || 1)) return;
  page.value = next;
  load();
}

async function retry(log: any) {
  retrying.value = log._id;
  try {
    const result = await apiRequest<any>(`/email-logs/${log._id}/retry`, { method: 'POST' });
    if (result?.success) toast.success('Email re-sent');
    else toast.error(result?.message || 'That email could not be retried');
    await load();
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    retrying.value = null;
  }
}

onMounted(load);
useSeoMeta({ title: 'Email deliverability', robots: 'noindex, nofollow' });
</script>
