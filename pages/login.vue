<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
    <div class="w-full max-w-md glass-card rounded-2xl p-8 border-emerald-500/30">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-emerald-500/20 mx-auto mb-3">
          👑
        </div>
        <h1 class="text-2xl font-extrabold text-white">Super Admin Command Center</h1>
        <p class="text-xs text-slate-400 mt-1">CMultiTickets Platform Control & Tenant Management</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Super Admin Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="superadmin@cmultickets.com"
            required
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div v-if="errorMsg" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="submitting" class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
          <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ submitting ? 'Authenticating...' : 'Sign In as Super Admin' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const config = useRuntimeConfig();
const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMsg = ref('');

async function handleLogin() {
  submitting.value = true;
  errorMsg.value = '';

  try {
    const res = await fetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user.role !== 'SUPER_ADMIN') {
        // Create super admin if first time
        await registerSuperAdmin();
        return;
      }
      localStorage.setItem('cmt_super_token', data.accessToken);
      localStorage.setItem('cmt_super_user', JSON.stringify(data.user));
      useRouter().push('/dashboard');
    } else {
      await registerSuperAdmin();
    }
  } catch (err) {
    errorMsg.value = 'Connection error';
  } finally {
    submitting.value = false;
  }
}

async function registerSuperAdmin() {
  try {
    const regRes = await fetch(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Platform Administrator',
        email: email.value,
        password: password.value,
        role: 'SUPER_ADMIN',
      }),
    });
    if (regRes.ok) {
      const regData = await regRes.json();
      localStorage.setItem('cmt_super_token', regData.accessToken);
      localStorage.setItem('cmt_super_user', JSON.stringify(regData.user));
      useRouter().push('/dashboard');
    } else {
      const err = await regRes.json();
      errorMsg.value = err.message || 'Super admin login failed';
    }
  } catch (e) {
    errorMsg.value = 'Failed to register Super Admin account';
  }
}
</script>
