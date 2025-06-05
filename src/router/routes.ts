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
        path: 'vueBase',
        name: 'VueBase',
        meta: { title: 'vue基础', icon: 'Setting' },
        children: [
          {
            path: 'template-syntax',
            name: 'template-syntax',
            meta: { title: '模版语法' },
            component: () => import('@/views/vueBase/01TemplateSyntax.vue'),
          },
          {
            path: 'reactivity',
            name: 'Reactivity',
            meta: { title: '响应式基础' },
            component: () => import('@/views/vueBase/02Reactivity.vue'),
          },
          {
            path: 'computed',
            name: 'Computed',
            meta: { title: '计算属性' },
            component: () => import('@/views/vueBase/03Computed.vue'),
          },
          {
            path: 'classAndStyle',
            name: 'ClassAndStyle',
            meta: { title: 'Class与Style绑定' },
            component: () => import('@/views/vueBase/04ClassAndStyle.vue'),
          },
          {
            path: 'conditional',
            name: 'Conditional',
            meta: { title: '条件渲染' },
            component: () => import('@/views/vueBase/05Conditional.vue'),
          },
          {
            path: 'listView',
            name: 'ListView',
            meta: { title: '列表渲染' },
            component: () => import('@/views/vueBase/06ListView.vue'),
          },
          {
            path: 'eventHandling',
            name: 'EventHandling',
            meta: { title: '事件处理' },
            component: () => import('@/views/vueBase/07EventHandling.vue'),
          },
          {
            path: 'formsTem',
            name: 'FormsTem',
            meta: { title: '表单输入绑定' },
            component: () => import('@/views/vueBase/08FormsTem.vue'),
          },
          {
            path: 'watchers',
            name: 'Watchers',
            meta: { title: '监听器' },
            component: () => import('@/views/vueBase/09Watchers.vue'),
          },
          {
            path: 'template-refs',
            name: 'TemplateRefs',
            meta: { title: '模版引用' },
            component: () => import('@/views/vueBase/10TemplateRefs/10TemplateRefs.vue'),
          },
          {
            path: 'component-basics',
            name: 'ComponentBasics',
            meta: { title: '组件基础' },
            component: () => import('@/views/vueBase/11ComponentBasics/11ComponentBasics.vue'),
          },
          {
            path: 'lifecycle',
            name: 'Lifecycle',
            meta: { title: '声明周期' },
            component: () => import('@/views/vueBase/12Lifecycle.vue'),
          },

          
        ],
      },
      {
        path: 'depth-components',
        name: 'DepthComponents',
        meta: { title: '深入组件', icon: 'Components' },
        children: [
          {
            path: 'registration',
            name: 'Registration',
            meta: { title: '注册' },
            component: () => import('@/views/DepthComponents/01Registration.vue'),
          },
          {
            path: 'props',
            name: 'Props',
            meta: { title: 'Props' },
            component: () => import('@/views/DepthComponents/02Props/02Props.vue'),
          },
          {
            path: 'events',
            name: 'Events',
            meta: { title: '事件' },
            component: () => import('@/views/DepthComponents/03Events/03Events.vue'),
          },
          {
            path: 'v-model',
            name: 'VModel',
            meta: { title: '组件v-model' },
            component: () => import('@/views/DepthComponents/04VModel/04VModel.vue'),
          },
          {
            path: 'attrs',
            name: 'Attrs',
            meta: { title: '透传 Attributes' },
            component: () => import('@/views/DepthComponents/05Attrs/05Attrs.vue'),
          },
          {
            path: 'slots',
            name: 'Slots',
            meta: { title: '插槽 Slots' },
            component: () => import('@/views/DepthComponents/06Slots/06Slots.vue'),
          },
          
          
        ],
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
