<template>
  <div class="min-h-screen   flex items-center justify-center">
    <div class="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const token = localStorage.getItem('ticketr_super_token');
  if (token) {
    useRouter().push('/dashboard');
  } else {
    useRouter().push('/login');
  }
});
</script>
