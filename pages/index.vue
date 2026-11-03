<template>
  <div class="min-h-screen bg-paper flex items-center justify-center">
    <div class="w-8 h-8 rounded-full border-4 border-line border-t-forest animate-spin" />
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  const token = localStorage.getItem('ticketr_super_token');
  navigateTo(token ? '/dashboard' : '/login', { replace: true });
});
</script>
