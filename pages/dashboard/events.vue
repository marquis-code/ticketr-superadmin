<template>
  <div class="space-y-4">
    <section class="surface p-4 flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input v-model="search" type="search" placeholder="Search events or organizers" class="input !pl-10 !py-2.5" />
      </div>
      <select v-model="status" class="input sm:w-40 !py-2.5">
        <option value="ALL">All statuses</option>
        <option value="PUBLISHED">Published</option>
        <option value="DRAFT">Draft</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button class="btn-secondary btn-sm shrink-0" type="button" @click="load">Refresh</button>
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
      <UiEmpty v-else-if="!filtered.length" title="No events match" message="Try a different search or status." class="!py-14">
        <template #icon><Ticket class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[820px]">
        <thead>
          <tr>
            <th>Event</th>
            <th>Organizer</th>
            <th>Date</th>
            <th>Capacity</th>
            <th>Status</th>
            <th class="text-right">Links</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in filtered" :key="event._id">
            <td class="max-w-[280px]">
              <p class="text-[13px] font-semibold text-ink truncate">{{ event.title }}</p>
              <p class="text-[11px] text-muted truncate">{{ event.location }}</p>
            </td>
            <td class="max-w-[180px]">
              <p class="text-[12px] text-ink truncate">{{ event.tenantId?.name || '—' }}</p>
              <p class="mono text-[10px] text-muted truncate">{{ event.tenantId?.slug }}</p>
            </td>
            <td class="whitespace-nowrap text-[11.5px] text-ink">{{ formatDate(event.startDate, { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
            <td class="text-[12px] text-ink">{{ (event.capacity || 0).toLocaleString() }}</td>
            <td><UiBadge :value="event.status" dot /></td>
            <td>
              <div class="flex justify-end gap-1">
                <a
                  v-if="event.tenantId?.slug"
                  :href="`${publicUrl}/event/${event.slug}?tenant=${event.tenantId.slug}`"
                  target="_blank"
                  class="btn-ghost btn-sm"
                  title="Open event page"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="lastPage > 1" class="flex items-center justify-between">
      <p class="text-[12px] text-muted">Page {{ page }} of {{ lastPage }} · {{ total }} events</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= lastPage" @click="changePage(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ExternalLink, Search, Ticket } from 'lucide-vue-next';

definePageMeta({ layout: 'superadmin' });

const config = useRuntimeConfig();
const publicUrl = computed(() => appOrigin('public'));

const events = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const status = ref('ALL');
const page = ref(1);
const limit = 50;
const lastPage = ref(1);
const total = ref(0);

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  return events.value.filter((event) => {
    const matchesStatus = status.value === 'ALL' || event.status === status.value;
    const matchesSearch =
      !query ||
      event.title?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.tenantId?.name?.toLowerCase().includes(query) ||
      event.tenantId?.slug?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const data = await apiRequest<any>(`/events/superadmin/all?page=${page.value}&limit=${limit}`);
    events.value = data?.data || (Array.isArray(data) ? data : []);
    lastPage.value = data?.metadata?.lastPage || 1;
    total.value = data?.metadata?.total || events.value.length;
  } catch (err) {
    error.value = errorMessage(err);
    events.value = [];
  } finally {
    loading.value = false;
  }
}

function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return;
  page.value = next;
  load();
}

onMounted(load);
useSeoMeta({ title: 'All events', robots: 'noindex, nofollow' });
</script>
