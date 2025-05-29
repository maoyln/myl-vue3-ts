import type { Router } from 'vue-router';
import { useUserStore } from '@/store/user';

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const isLogin = !!userStore.token;

    if (to.path !== '/login' && !isLogin) {
      next('/login');
    } else {
      next();
    }
  });
}
