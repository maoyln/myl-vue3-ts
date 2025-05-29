import type { RouteRecordRaw } from 'vue-router';

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        meta: { title: '首页', icon: 'House' },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'user',
            name: 'User',
            meta: { title: '人员管理' },
            component: () => import('@/views/system/User.vue'),
          },
          {
            path: 'role',
            name: 'Role',
            meta: { title: '职位管理' },
            component: () => import('@/views/system/Role.vue'),
          },
        ],
      },
      {
        path: 'about',
        name: 'About',
        meta: { title: '关于', icon: 'InfoFilled' },
        component: () => import('@/views/About.vue'),
      },
      {
        path: 'setting',
        name: 'Setting',
        meta: { title: '设置', icon: 'Tools' },
        component: () => import('@/views/Setting.vue'),
      },
    ],
  },
];

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];
