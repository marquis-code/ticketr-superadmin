function tokenState() {
  if (typeof localStorage === 'undefined') {
    return { token: null as string | null, role: null as string | null, expired: false };
  }
  const token = localStorage.getItem('ticketr_super_token');
  if (!token) return { token: null, role: null, expired: false };
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return { token, role: payload?.role || null, expired: !payload?.exp || payload.exp * 1000 < Date.now() };
  } catch {
    return { token, role: null, expired: true };
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  const { token, role, expired } = tokenState();
  if (expired && token) {
    localStorage.removeItem('ticketr_super_token');
    localStorage.removeItem('ticketr_super_user');
  }
  const authed = !!token && !expired && role === 'SUPER_ADMIN';

  if (to.path === '/' || to.path === '') {
    return navigateTo(authed ? '/dashboard' : '/login');
  }
  if (to.path === '/login') {
    return authed ? navigateTo('/dashboard') : undefined;
  }
  if (!authed) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { redirectCode: 302 });
  }
});
