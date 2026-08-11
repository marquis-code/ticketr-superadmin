<template>
  <div class="min-h-screen   flex items-center justify-center p-6">
    <div class="w-full max-w-md glass-card rounded-2xl p-8 border-emerald-500/30">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-6">
          <img src="https://res.cloudinary.com/marquis/image/upload/v1786452024/ticketr_djxoz9.png" alt="Ticketr Logo" class="h-10 w-auto" />
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900">Super Admin Command Center</h1>
        <p class="text-xs text-gray-600 mt-1">Ticketr Platform Control & Tenant Management</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Super Admin Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="superadmin@ticketr.org"
            required
            class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
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
import { Eye, EyeOff } from 'lucide-vue-next';

const config = useRuntimeConfig();
const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);

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
      localStorage.setItem('ticketr_super_token', data.accessToken);
      localStorage.setItem('ticketr_super_user', JSON.stringify(data.user));
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
      localStorage.setItem('ticketr_super_token', regData.accessToken);
      localStorage.setItem('ticketr_super_user', JSON.stringify(regData.user));
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
