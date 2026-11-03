<template>
  <div class="space-y-5">
    <!-- Header -->
    <section class="surface p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Platform pulse</p>
        <h2 class="font-display text-2xl sm:text-3xl font-semibold text-ink mt-1">Everything, at a glance.</h2>
        <p class="text-[13px] text-muted mt-1">Gross volume, fees, organizers and ticket issuance across every tenant.</p>
      </div>
      <button class="btn-primary btn-sm shrink-0" type="button" @click="tenantOpen = true">
        <Plus class="w-4 h-4" /> Onboard organizer
      </button>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <!-- KPIs -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <template v-if="loading">
        <div v-for="n in 4" :key="n" class="stat">
          <div class="skeleton h-3 w-20" />
          <div class="skeleton h-8 w-24 mt-2" />
        </div>
      </template>
      <template v-else>
        <div class="stat">
          <p class="stat-label">Platform GMV</p>
          <p class="stat-value">{{ formatCompactMoney(data?.globalGMV) }}</p>
          <p class="text-[11px] text-muted">{{ data?.paidOrders || 0 }} paid orders</p>
        </div>
        <div class="stat">
          <p class="stat-label">Platform fees</p>
          <p class="stat-value">{{ formatCompactMoney(data?.platformFees) }}</p>
          <p class="text-[11px] text-muted">Recorded per order</p>
        </div>
        <div class="stat">
          <p class="stat-label">Organizers</p>
          <p class="stat-value">{{ data?.totalTenants || 0 }}</p>
          <p class="text-[11px] text-muted">{{ data?.activeTenants || 0 }} active · {{ data?.suspendedTenants || 0 }} suspended</p>
        </div>
        <div class="stat">
          <p class="stat-label">Tickets issued</p>
          <p class="stat-value">{{ data?.totalTicketsSold || 0 }}</p>
          <p class="text-[11px] text-muted">{{ data?.checkedInTickets || 0 }} checked in</p>
        </div>
      </template>
    </section>

    <div class="grid lg:grid-cols-[1.6fr_1fr] gap-4">
      <!-- GMV chart -->
      <section class="surface p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Last 30 days</p>
            <h3 class="font-display text-xl font-semibold text-ink mt-0.5">Platform volume</h3>
          </div>
          <p class="font-display text-xl font-semibold text-ink">{{ formatCompactMoney(seriesTotal) }}</p>
        </div>
        <div v-if="loading" class="skeleton h-44 mt-5" />
        <div v-else-if="!series.length" class="h-44 mt-5 rounded-xl border border-dashed border-line flex flex-col items-center justify-center text-center">
          <TrendingUp class="w-6 h-6 text-muted/50" />
          <p class="text-sm font-semibold text-ink mt-2">No paid orders in this window</p>
        </div>
        <div v-else class="mt-5">
          <svg viewBox="0 0 640 170" class="w-full h-44" role="img" aria-label="Platform volume over 30 days">
            <defs>
              <linearGradient id="gmv-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#11483A" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#11483A" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line v-for="(tick, i) in 4" :key="i" x1="0" :y1="20 + i * 40" x2="640" :y2="20 + i * 40" stroke="#E4E4DA" stroke-dasharray="3 5" />
            <path :d="areaPath" fill="url(#gmv-fill)" />
            <path :d="linePath" fill="none" stroke="#11483A" stroke-width="2.5" stroke-linejoin="round" />
            <circle v-for="(point, i) in points" :key="i" :cx="point.x" :cy="point.y" r="3" fill="#F6F5EF" stroke="#11483A" stroke-width="2">
              <title>{{ formatDate(series[i]?.date) }} — {{ formatMoney(series[i]?.revenue) }}</title>
            </circle>
          </svg>
          <div class="flex justify-between text-[10px] font-semibold text-muted mt-1">
            <span>{{ formatDate(series[0]?.date, { day: 'numeric', month: 'short' }) }}</span>
            <span>{{ formatDate(series[series.length - 1]?.date, { day: 'numeric', month: 'short' }) }}</span>
          </div>
        </div>
      </section>

      <!-- Top tenants -->
      <section class="surface p-5 sm:p-6">
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Leaderboard</p>
        <h3 class="font-display text-xl font-semibold text-ink mt-0.5">Top organizers by GMV</h3>
        <div v-if="loading" class="mt-4 space-y-2">
          <div v-for="n in 4" :key="n" class="skeleton h-12" />
        </div>
        <UiEmpty v-else-if="!topTenants.length" title="No sales yet" message="Organizer GMV appears here after the first paid order." class="!py-8">
          <template #icon><Users class="w-6 h-6" /></template>
        </UiEmpty>
        <div v-else class="mt-4 space-y-2">
          <div v-for="(tenant, index) in topTenants" :key="tenant.tenantId" class="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
            <span class="w-6 h-6 rounded-lg bg-paper border border-line flex items-center justify-center text-[10px] font-bold text-ink">{{ index + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-[12.5px] font-semibold text-ink truncate">{{ tenant.name }}</p>
              <p class="text-[10px] text-muted">{{ tenant.orders }} orders</p>
            </div>
            <p class="text-[12px] font-semibold text-ink shrink-0">{{ formatCompactMoney(tenant.gmv) }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Organizers -->
    <section class="surface overflow-hidden">
      <div class="px-5 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Directory</p>
          <h3 class="font-display text-xl font-semibold text-ink">Organizers</h3>
        </div>
        <div class="flex gap-2">
          <div class="relative">
            <Search class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input v-model="tenantSearch" type="search" placeholder="Search organizers" class="input !pl-9 !py-2 text-[12.5px]" />
          </div>
          <select v-model="tenantStatus" class="input !py-2 text-[12.5px] w-32">
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="p-5 space-y-2">
        <div v-for="n in 4" :key="n" class="skeleton h-12" />
      </div>
      <UiEmpty v-else-if="!filteredTenants.length" title="No organizers match" message="Try a different search or status." class="!py-10">
        <template #icon><Users class="w-6 h-6" /></template>
      </UiEmpty>
      <div v-else class="overflow-x-auto">
        <table class="table min-w-[720px]">
          <thead>
            <tr>
              <th>Organizer</th>
              <th>Handle</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Joined</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in filteredTenants" :key="tenant._id">
              <td>
                <div class="flex items-center gap-2.5">
                  <img v-if="tenant.logoUrl" :src="tenant.logoUrl" alt="" class="w-8 h-8 rounded-lg object-cover border border-line" />
                  <span v-else class="w-8 h-8 rounded-lg bg-paper border border-line flex items-center justify-center text-[10px] font-bold text-ink">{{ initials(tenant.name) }}</span>
                  <p class="text-[13px] font-semibold text-ink truncate">{{ tenant.name }}</p>
                </div>
              </td>
              <td class="mono text-[11px] text-muted">{{ tenant.slug }}</td>
              <td class="text-[11.5px] text-muted truncate max-w-[180px]">{{ tenant.contactEmail }}</td>
              <td><UiBadge :value="tenant.status" dot /></td>
              <td class="text-[11.5px] text-muted whitespace-nowrap">{{ formatDate(tenant.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
              <td>
                <div class="flex justify-end gap-1">
                  <a :href="`${publicUrl}?tenant=${tenant.slug}`" target="_blank" class="btn-ghost btn-sm" title="Open storefront">
                    <ExternalLink class="w-4 h-4" />
                  </a>
                  <button
                    class="btn-secondary btn-sm !py-1.5 !px-2.5 text-[11px]"
                    type="button"
                    :disabled="busy === tenant._id"
                    @click="toggleStatus(tenant)"
                  >
                    {{ tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Create tenant -->
    <UiModal :open="tenantOpen" title="Onboard an organizer" eyebrow="New tenant" @close="tenantOpen = false">
      <div class="space-y-3.5">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Organization name</label>
            <input v-model.trim="newTenant.name" type="text" class="input" placeholder="Faculty of Science" />
          </div>
          <div>
            <label class="label">Handle</label>
            <input v-model.trim="newTenant.slug" type="text" class="input mono" placeholder="science-unilag" />
          </div>
        </div>
        <div>
          <label class="label">Contact email</label>
          <input v-model.trim="newTenant.contactEmail" type="email" class="input" placeholder="ops@organizer.com" />
        </div>
        <div class="divider" />
        <p class="text-[12px] font-semibold text-ink">Owner account</p>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Owner name</label>
            <input v-model.trim="newTenant.ownerName" type="text" class="input" />
          </div>
          <div>
            <label class="label">Owner email</label>
            <input v-model.trim="newTenant.ownerEmail" type="email" class="input" />
          </div>
        </div>
        <div>
          <label class="label">Temporary password</label>
          <input v-model="newTenant.ownerPassword" type="text" class="input mono" placeholder="At least 8 characters" />
          <p class="field-hint">Share this once with the organizer. They can change it in Settings → Security.</p>
        </div>
        <p v-if="tenantError" class="field-error">{{ tenantError }}</p>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="creatingTenant" @click="createTenant">
          {{ creatingTenant ? 'Creating…' : 'Create organizer' }}
        </button>
        <button class="btn-secondary" type="button" @click="tenantOpen = false">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ExternalLink, Plus, Search, TrendingUp, Users } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'superadmin' });

const config = useRuntimeConfig();
const publicUrl = computed(() => String(config.public.publicUrl || 'https://ticketr.org'));

const loading = ref(true);
const error = ref('');
const data = ref<any>(null);
const tenants = ref<any[]>([]);
const tenantSearch = ref('');
const tenantStatus = ref('ALL');
const tenantOpen = ref(false);
const tenantError = ref('');
const creatingTenant = ref(false);
const busy = ref<string | null>(null);

const newTenant = reactive({
  name: '',
  slug: '',
  contactEmail: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
});

const series = computed<any[]>(() => data.value?.salesOverTime || []);
const topTenants = computed<any[]>(() => data.value?.topTenants || []);
const seriesTotal = computed(() => series.value.reduce((sum, d) => sum + (d.revenue || 0), 0));

const points = computed(() => {
  const list = series.value;
  if (!list.length) return [];
  const max = Math.max(...list.map((d) => Number(d.revenue) || 0), 1);
  const width = 640;
  const height = 150;
  const step = list.length > 1 ? width / (list.length - 1) : width;
  return list.map((point, index) => ({
    x: list.length > 1 ? index * step : width / 2,
    y: 20 + height - ((Number(point.revenue) || 0) / max) * height,
  }));
});
const linePath = computed(() => points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
const areaPath = computed(() => {
  if (!points.value.length) return '';
  return `${linePath.value} L${points.value[points.value.length - 1].x.toFixed(1)},170 L${points.value[0].x.toFixed(1)},170 Z`;
});

const filteredTenants = computed(() =>
  tenants.value.filter((tenant) => {
    const matchesStatus = tenantStatus.value === 'ALL' || tenant.status === tenantStatus.value;
    const query = tenantSearch.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      tenant.name?.toLowerCase().includes(query) ||
      tenant.slug?.toLowerCase().includes(query) ||
      tenant.contactEmail?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }),
);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [analytics, tenantList] = await Promise.all([
      apiRequest<any>('/analytics/superadmin'),
      apiRequest<any>('/tenants'),
    ]);
    data.value = analytics;
    tenants.value = Array.isArray(tenantList) ? tenantList : tenantList?.data || [];
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(tenant: any) {
  busy.value = tenant._id;
  const next = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  try {
    await apiRequest(`/tenants/${tenant._id}/status`, { method: 'PATCH', body: { status: next } });
    tenant.status = next;
    toast.success(next === 'ACTIVE' ? 'Organizer activated' : 'Organizer suspended');
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    busy.value = null;
  }
}

async function createTenant() {
  tenantError.value = '';
  if (!newTenant.name || !newTenant.slug || !newTenant.contactEmail || !newTenant.ownerEmail || !newTenant.ownerPassword) {
    tenantError.value = 'Complete every field.';
    return;
  }
  creatingTenant.value = true;
  try {
    await apiRequest('/tenants', { method: 'POST', body: newTenant });
    toast.success('Organizer created');
    tenantOpen.value = false;
    Object.assign(newTenant, { name: '', slug: '', contactEmail: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
    await load();
  } catch (err) {
    tenantError.value = errorMessage(err);
  } finally {
    creatingTenant.value = false;
  }
}

onMounted(load);
useSeoMeta({ title: 'Platform overview', robots: 'noindex, nofollow' });
</script>
