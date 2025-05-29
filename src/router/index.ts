import { createRouter, createWebHistory } from 'vue-router';
import { constantRoutes, asyncRoutes } from './routes';
import { setupRouterGuard } from './guard';

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes],
});

setupRouterGuard(router);
export default router;
