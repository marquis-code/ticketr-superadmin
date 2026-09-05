<template>
  <div>
    <main class="w-full space-y-8">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Email Logs</h1>
        <p class="text-xs text-gray-600 mt-1">Audit log of all platform emails sent via Resend.</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
          Loading email logs...
        </div>

        <div v-else-if="logs.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No emails logged yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Recipient</th>
                <th class="px-6 py-4">Subject</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Retries</th>
                <th class="px-6 py-4">Error Reason</th>
                <th class="px-6 py-4">Timestamp</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="log in logs" :key="log._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-semibold text-gray-900 text-sm">{{ log.recipientEmail }}</td>
                <td class="px-6 py-4 text-xs text-gray-600 truncate max-w-[250px]" :title="log.subject">{{ log.subject }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="getStatusClass(log.status)"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ log.retryCount }}</td>
                <td class="px-6 py-4 text-xs text-red-600 truncate max-w-[200px]" :title="log.errorReason">{{ log.errorReason || '-' }}</td>
                <td class="px-6 py-4 text-xs text-gray-500">{{ new Date(log.createdAt).toLocaleString() }}</td>
                <td class="px-6 py-4 text-right">
                  <button 
                    v-if="log.status === 'FAILED'"
                    @click="retryEmail(log._id)"
                    :disabled="retrying === log._id"
                    class="inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition"
                  >
                    {{ retrying === log._id ? 'Retrying...' : 'Resend' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Basic Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center" v-if="meta">
            <span class="text-xs text-gray-500">Page {{ meta.page }} of {{ meta.totalPages }} ({{ meta.total }} total)</span>
            <div class="space-x-2">
              <button @click="loadLogs(meta.page - 1)" :disabled="meta.page <= 1" class="px-3 py-1 text-xs border rounded disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button @click="loadLogs(meta.page + 1)" :disabled="meta.page >= meta.totalPages" class="px-3 py-1 text-xs border rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'superadmin' });

import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();

const logs = ref([]);
const meta = ref(null);
const loading = ref(true);
const retrying = ref(null);

function getStatusClass(status) {
  switch (status) {
    case 'SENT': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'FAILED': return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
}

async function loadLogs(page = 1) {
  const token = localStorage.getItem('ticketr_super_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/email-logs?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const result = await res.json();
      logs.value = result.data;
      meta.value = result.meta;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function retryEmail(id) {
  const token = localStorage.getItem('ticketr_super_token');
  if (!token) return;

  retrying.value = id;
  try {
    const res = await fetch(`${config.public.apiBase}/email-logs/${id}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      alert('Email retry attempted successfully (Check status).');
      loadLogs(meta.value?.page || 1);
    } else {
      alert('Failed to retry email.');
    }
  } catch (err) {
    console.error(err);
    alert('Network error while retrying email.');
  } finally {
    retrying.value = null;
  }
}

onMounted(() => {
  loadLogs();
});
</script>
