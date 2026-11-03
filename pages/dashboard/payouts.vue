<template>
  <div class="space-y-4">
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="stat !py-4">
        <p class="stat-label">Pending settlement</p>
        <p class="stat-value">{{ formatCompactMoney(summary.pendingAmount) }}</p>
        <p class="text-[11px] text-muted">{{ summary.pendingCount || 0 }} request(s)</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Settled to organizers</p>
        <p class="stat-value">{{ formatCompactMoney(summary.paidAmount) }}</p>
        <p class="text-[11px] text-muted">{{ summary.paidCount || 0 }} payout(s)</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Listed payouts</p>
        <p class="stat-value">{{ total }}</p>
        <p class="text-[11px] text-muted">All statuses</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Settlement mode</p>
        <p class="stat-value !text-xl">Manual</p>
        <p class="text-[11px] text-muted">Bank transfer + reference</p>
      </div>
    </section>

    <section class="surface p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <select v-model="status" class="input sm:w-44 !py-2.5">
        <option value="ALL">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="PROCESSING">Processing</option>
        <option value="PAID">Paid</option>
        <option value="FAILED">Failed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button class="btn-secondary btn-sm shrink-0" type="button" @click="load">
        <RefreshCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" /> Refresh
      </button>
      <p class="text-[11.5px] text-muted sm:ml-auto">
        Mark paid only after the bank transfer has been sent to the organizer’s remittance account.
      </p>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-2.5">
        <div v-for="n in 6" :key="n" class="skeleton h-12" />
      </div>
      <UiEmpty v-else-if="!payouts.length" title="No payouts in this view" message="Organizer payout requests will appear here." class="!py-14">
        <template #icon><Banknote class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[900px]">
        <thead>
          <tr><th>Organizer</th><th>Requested</th><th>Orders</th><th>Amount</th><th>Status</th><th>Reference</th><th class="text-right">Action</th></tr>
        </thead>
        <tbody>
          <tr v-for="payout in payouts" :key="payout._id">
            <td class="max-w-[220px]">
              <p class="text-[13px] font-semibold text-ink truncate">{{ payout.tenantId?.name || 'Unknown organizer' }}</p>
              <p class="mono text-[10px] text-muted truncate">{{ payout.tenantId?.slug }}</p>
            </td>
            <td class="whitespace-nowrap text-[11.5px] text-muted">{{ formatDate(payout.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
            <td class="text-[12px] text-ink">{{ payout.orderCount || 0 }}</td>
            <td class="text-[13px] font-semibold text-ink">{{ formatMoney(payout.amount) }}</td>
            <td><UiBadge :value="payout.status" dot /></td>
            <td class="mono text-[10.5px] text-muted max-w-[150px] truncate">{{ payout.reference || '—' }}</td>
            <td>
              <div class="flex justify-end gap-1">
                <button
                  v-if="['PENDING', 'PROCESSING'].includes(payout.status)"
                  class="btn-secondary btn-sm !py-1.5 !px-2.5 text-[11px]"
                  type="button"
                  @click="openSettle(payout)"
                >
                  Mark paid
                </button>
                <button
                  v-if="['PENDING', 'PROCESSING'].includes(payout.status)"
                  class="btn-ghost btn-sm text-coral"
                  type="button"
                  @click="openFail(payout)"
                >
                  Fail
                </button>
                <span v-else class="text-[10px] text-muted">{{ payout.paidAt ? formatDate(payout.paidAt, { day: 'numeric', month: 'short' }) : '—' }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="lastPage > 1" class="flex items-center justify-between">
      <p class="text-[12px] text-muted">Page {{ page }} of {{ lastPage }} · {{ total }} payouts</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= lastPage" @click="changePage(page + 1)">Next</button>
      </div>
    </div>

    <UiModal :open="!!settleTarget" title="Mark payout as paid" eyebrow="Settlement confirmation" @close="settleTarget = null">
      <div v-if="settleTarget" class="space-y-3.5">
        <div class="rounded-xl bg-paper border border-line p-3.5 text-[12.5px]">
          <div class="flex justify-between"><span class="text-muted">Organizer</span><span class="font-semibold text-ink">{{ settleTarget.tenantId?.name }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Amount</span><span class="font-semibold text-ink">{{ formatMoney(settleTarget.amount) }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Orders</span><span class="font-semibold text-ink">{{ settleTarget.orderCount }}</span></div>
        </div>
        <div>
          <label class="label">Bank transfer reference <span class="text-coral">*</span></label>
          <input v-model.trim="settleReference" type="text" class="input" placeholder="e.g. GTB-20261102-8841" />
        </div>
        <div>
          <label class="label">Note</label>
          <textarea v-model.trim="settleNote" rows="2" class="input resize-y" placeholder="Optional settlement note" />
        </div>
        <p v-if="settleError" class="field-error">{{ settleError }}</p>
        <div class="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
          Marking paid records the transfer and locks these orders from further refund-driven payout adjustments.
        </div>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="settling" @click="settle">{{ settling ? 'Saving…' : 'Confirm settlement' }}</button>
        <button class="btn-secondary" type="button" @click="settleTarget = null">Cancel</button>
      </template>
    </UiModal>

    <UiModal :open="!!failTarget" title="Fail this payout?" eyebrow="Releases orders" size="sm" @close="failTarget = null">
      <p class="text-sm text-muted">The orders return to the organizer’s available balance so they can request again.</p>
      <div class="mt-3">
        <label class="label">Reason</label>
        <textarea v-model.trim="failReason" rows="2" class="input resize-y" placeholder="e.g. Incorrect bank details" />
      </div>
      <p v-if="failError" class="field-error mt-2">{{ failError }}</p>
      <template #footer>
        <button class="btn-danger" type="button" :disabled="failing" @click="failPayout">{{ failing ? 'Saving…' : 'Fail payout' }}</button>
        <button class="btn-secondary" type="button" @click="failTarget = null">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Banknote, RefreshCcw } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'superadmin' });

const loading = ref(true);
const error = ref('');
const payouts = ref<any[]>([]);
const summary = ref<any>({ pendingAmount: 0, pendingCount: 0, paidAmount: 0, paidCount: 0 });
const status = ref('ALL');
const page = ref(1);
const limit = 30;
const lastPage = ref(1);
const total = ref(0);

const settleTarget = ref<any>(null);
const settleReference = ref('');
const settleNote = ref('');
const settleError = ref('');
const settling = ref(false);
const failTarget = ref<any>(null);
const failReason = ref('');
const failError = ref('');
const failing = ref(false);

watch(status, () => { page.value = 1; load(); });

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit), status: status.value });
    const [list, summaryData] = await Promise.all([
      apiRequest<any>(`/payouts/all?${params.toString()}`),
      apiRequest<any>('/payouts/platform/summary'),
    ]);
    payouts.value = list?.data || [];
    lastPage.value = list?.metadata?.lastPage || 1;
    total.value = list?.metadata?.total || 0;
    summary.value = summaryData;
  } catch (err) {
    error.value = errorMessage(err);
    payouts.value = [];
  } finally {
    loading.value = false;
  }
}

function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return;
  page.value = next;
  load();
}

function openSettle(payout: any) {
  settleTarget.value = payout;
  settleReference.value = '';
  settleNote.value = '';
  settleError.value = '';
}

async function settle() {
  settleError.value = '';
  if (!settleReference.value) {
    settleError.value = 'A bank transfer reference is required.';
    return;
  }
  settling.value = true;
  try {
    await apiRequest(`/payouts/${settleTarget.value._id}/status`, {
      method: 'PATCH',
      body: { status: 'PAID', reference: settleReference.value, note: settleNote.value },
    });
    toast.success('Payout marked paid');
    settleTarget.value = null;
    await load();
  } catch (err) {
    settleError.value = errorMessage(err);
  } finally {
    settling.value = false;
  }
}

function openFail(payout: any) {
  failTarget.value = payout;
  failReason.value = '';
  failError.value = '';
}

async function failPayout() {
  failError.value = '';
  failing.value = true;
  try {
    await apiRequest(`/payouts/${failTarget.value._id}/status`, {
      method: 'PATCH',
      body: { status: 'FAILED', failureReason: failReason.value || 'Failed by platform admin' },
    });
    toast.success('Payout marked failed; orders released');
    failTarget.value = null;
    await load();
  } catch (err) {
    failError.value = errorMessage(err);
  } finally {
    failing.value = false;
  }
}

onMounted(load);
useSeoMeta({ title: 'Payout settlements', robots: 'noindex, nofollow' });
</script>
