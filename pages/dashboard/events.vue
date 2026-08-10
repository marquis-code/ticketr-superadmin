<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Top Header Navigation -->
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
            <NuxtLink to="/dashboard/events" class="bg-primary text-white px-3 py-1.5 rounded-lg">Global Events</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg">Global Transactions</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Global Events Oversight</h1>
        <p class="text-xs text-gray-600 mt-1">Audit published events across all onboarded institutions and organizations.</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
          Loading global events...
        </div>

        <div v-else-if="events.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No events created across any tenant yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Event Title</th>
                <th class="px-6 py-4">Organization / Tenant</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Markup</th>
                <th class="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="ev in events" :key="ev._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-semibold text-gray-900">{{ ev.title }}</td>
                <td class="px-6 py-4 font-mono text-xs text-emerald-400">
                  {{ ev.tenantId?.name || 'Tenant' }} ({{ ev.tenantId?.slug || 'slug' }})
                </td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ new Date(ev.startDate).toLocaleDateString() }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {{ ev.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-semibold text-gray-900 block">
                    {{ ev.markupFeeType === 'PERCENTAGE' ? ev.markupFee + '%' : '₦' + ev.markupFee }}
                  </span>
                  <span class="text-[10px] text-gray-500">
                    {{ ev.markupStrategy === 'ADD_TO_FEE' ? 'Added to price' : 'Deducted from fee' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button @click="openMarkupModal(ev)" class="text-[11px] text-primary hover:bg-primary/10 border border-primary/30 font-semibold py-1.5 px-3 rounded-lg transition">
                    Configure Markup
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Markup Configuration Modal -->
    <div v-if="editingMarkupEvent" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="glass-card w-full max-w-md p-6 rounded-2xl relative">
        <button @click="closeMarkupModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X class="w-5 h-5" />
        </button>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Configure Markup</h3>
        <p class="text-xs text-gray-500 mb-6">Event: <span class="font-semibold text-gray-800">{{ editingMarkupEvent.title }}</span></p>

        <form @submit.prevent="saveMarkup" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-medium text-gray-600 mb-1">Fee Amount</label>
              <input v-model.number="markupForm.markupFee" type="number" min="0" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-gray-600 mb-1">Fee Type</label>
              <CustomDropdown
                v-model="markupForm.markupFeeType"
                :options="[
                  { label: 'Flat (₦)', value: 'FLAT' },
                  { label: 'Percentage (%)', value: 'PERCENTAGE' }
                ]"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-[11px] font-medium text-gray-600 mb-1">Strategy</label>
            <CustomDropdown
              v-model="markupForm.markupStrategy"
              :options="[
                { label: 'Add to Ticket Price (Customer pays)', value: 'ADD_TO_FEE' },
                { label: 'Deduct from Ticket Price (Organizer pays)', value: 'DEDUCT_FROM_FEE' }
              ]"
            />
            <p class="text-[10px] text-gray-400 mt-1">
              If added, the customer pays more and we keep the markup. If deducted, the customer pays the normal price, but the tenant's payout is reduced by the markup. Paystack fees are settled from the business wallet.
            </p>
          </div>

          <div v-if="markupMsg" :class="markupError ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'" class="p-3 rounded-lg border text-xs">
            {{ markupMsg }}
          </div>

          <div class="pt-4 flex justify-end gap-2">
            <button type="button" @click="closeMarkupModal" class="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" :disabled="submittingMarkup" class="px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-indigo-600 flex items-center gap-1 transition">
              <Loader2 v-if="submittingMarkup" class="w-3 h-3 animate-spin" />
              Save Markup
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';

const config = useRuntimeConfig();

const events = ref([]);
const loading = ref(true);

async function loadGlobalEvents() {
  const token = localStorage.getItem('ticketr_super_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/events/superadmin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      events.value = await res.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const editingMarkupEvent = ref(null);
const submittingMarkup = ref(false);
const markupMsg = ref('');
const markupError = ref(false);
const markupForm = ref({
  markupFee: 0,
  markupFeeType: 'FLAT',
  markupStrategy: 'ADD_TO_FEE'
});

function openMarkupModal(ev) {
  editingMarkupEvent.value = ev;
  markupForm.value = {
    markupFee: ev.markupFee || 0,
    markupFeeType: ev.markupFeeType || 'FLAT',
    markupStrategy: ev.markupStrategy || 'ADD_TO_FEE'
  };
  markupMsg.value = '';
  markupError.value = false;
}

function closeMarkupModal() {
  editingMarkupEvent.value = null;
}

async function saveMarkup() {
  submittingMarkup.value = true;
  markupMsg.value = '';
  markupError.value = false;
  
  const token = localStorage.getItem('ticketr_super_token');
  try {
    const res = await fetch(`${config.public.apiBase}/events/superadmin/${editingMarkupEvent.value._id}/markup`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(markupForm.value)
    });

    if (res.ok) {
      markupMsg.value = 'Markup configured successfully!';
      markupError.value = false;
      await loadGlobalEvents();
      setTimeout(closeMarkupModal, 1000);
    } else {
      const err = await res.json();
      markupMsg.value = err.message || 'Failed to update';
      markupError.value = true;
    }
  } catch (e) {
    markupMsg.value = 'Network error';
    markupError.value = true;
  } finally {
    submittingMarkup.value = false;
  }
}

onMounted(() => {
  loadGlobalEvents();
});
</script>
