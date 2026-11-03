<template>
  <div class="min-h-screen grid lg:grid-cols-[1fr_1.05fr] bg-paper">
    <div class="flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-10">
      <div class="w-full max-w-md mx-auto">
        <div class="flex items-center gap-2.5 mb-10">
          <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
            <ShieldCheck class="w-[18px] h-[18px] text-lime" />
          </span>
          <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">ticketr.</span>
          <span class="chip-muted !text-[9px]">Platform</span>
        </div>

        <h1 class="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-[-0.03em]">Platform control.</h1>
        <p class="text-sm text-muted mt-2">Super admin access only. Accounts are provisioned by the platform team.</p>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <div>
            <label class="label" for="email">Email</label>
            <input id="email" v-model.trim="email" type="email" required autocomplete="email" class="input !py-3.5" placeholder="admin@ticketr.org" />
          </div>
          <div>
            <label class="label" for="password">Password</label>
            <div class="relative">
              <input id="password" v-model="password" :type="show ? 'text' : 'password'" required autocomplete="current-password" class="input !py-3.5 !pr-12" placeholder="••••••••" />
              <button type="button" class="absolute inset-y-0 right-0 px-4 text-muted hover:text-ink" :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show">
                <EyeOff v-if="show" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <p v-if="error" class="text-[12.5px] font-medium text-coral bg-coral/10 border border-coral/20 rounded-lg px-3.5 py-2.5">{{ error }}</p>
          <button type="submit" class="btn-primary w-full !py-3.5" :disabled="loading">
            <span v-if="loading" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
            {{ loading ? 'Authenticating…' : 'Sign in' }}
          </button>
        </form>

        <p class="text-[11px] text-muted mt-6">
          Not a platform admin? <a :href="publicUrl" class="font-semibold text-forest hover:underline">Return to ticketr.org</a>
        </p>
      </div>
    </div>

    <aside class="hidden lg:flex relative overflow-hidden bg-ink">
      <div class="absolute inset-0 bg-grid opacity-[0.12]" />
      <div class="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-lime/15 blur-[130px]" />
      <div class="relative flex flex-col justify-center p-12 xl:p-16 w-full">
        <span class="chip-ink !bg-white/10 !text-paper !border-white/15 w-fit">Trust layer controls</span>
        <h2 class="font-display text-[2.5rem] leading-[1.05] font-semibold text-paper tracking-[-0.035em] mt-5">
          The whole platform,<br /><span class="text-lime">in one quiet room.</span>
        </h2>
        <p class="text-sm text-paper/60 mt-5 max-w-sm leading-relaxed">
          Organizers, events, GMV, platform fees and email deliverability — with every privileged action written to an audit trail.
        </p>
        <div class="mt-8 grid grid-cols-2 gap-3 max-w-sm">
          <div class="rounded-xl border border-white/10 bg-white/[0.05] p-4">
            <p class="text-[10px] uppercase tracking-[0.14em] text-paper/40 font-bold">Reconciliation</p>
            <p class="text-paper text-[13px] font-semibold mt-1">Per-order fees</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/[0.05] p-4">
            <p class="text-[10px] uppercase tracking-[0.14em] text-paper/40 font-bold">Security</p>
            <p class="text-paper text-[13px] font-semibold mt-1">Role-gated access</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, ShieldCheck } from 'lucide-vue-next';

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const publicUrl = computed(() => appOrigin('public'));

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const show = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const data = await apiRequest<any>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: email.value, password: password.value },
    });
    if (data?.user?.role !== 'SUPER_ADMIN') {
      error.value = 'This account does not have platform admin access.';
      return;
    }
    localStorage.setItem('ticketr_super_token', data.accessToken);
    localStorage.setItem('ticketr_super_user', JSON.stringify(data.user));
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/dashboard')
        ? route.query.redirect
        : '/dashboard';
    await navigateTo(redirect);
  } catch (err) {
    error.value = errorMessage(err, 'Invalid email or password.');
  } finally {
    loading.value = false;
  }
}

useSeoMeta({ title: 'Platform sign in | Ticketr', robots: 'noindex, nofollow' });
</script>
