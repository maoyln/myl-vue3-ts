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
          {
            path: 'provide-inject',
            name: 'ProvideInject',
            meta: { title: '依赖注入' },
            component: () => import('@/views/DepthComponents/07ProvideInject/07ProvideInject.vue'),
          },
          {
            path: 'async',
            name: 'Async',
            meta: { title: '异步组件' },
            component: () => import('@/views/DepthComponents/08Async/08Async.vue'),
          },
        ],
      },
      {
        path: 'logicReuse',
        name: 'LogicReuse',
        meta: { title: '逻辑复用', icon: 'logicReuse' },
        children: [
          {
            path: 'composables',
            name: 'Composables',
            meta: { title: '组合式函数' },
            component: () => import('@/views/LogicReuse/01Composables/01Composables.vue'),
          },
          {
            path: 'custom-directives',
            name: 'CustomDirectives',
            meta: { title: '自定义指令' },
            component: () => import('@/views/LogicReuse/02CustomDirectives/02CustomDirectives.vue'),
          },
          {
            path: 'plugins',
            name: 'Plugins',
            meta: { title: '插件' },
            component: () => import('@/views/LogicReuse/03Plugins/03Plugins.vue'),
          },
        ],
      },
      {
        path: 'builtIn-components',
        name: 'BuiltInComponents',
        meta: { title: '内置组件', icon: 'BuiltInComponents' },
        children: [
          {
            path: 'transition',
            name: 'Transition',
            meta: { title: 'Transition' },
            component: () => import('@/views/BuiltInComponents/01Transition/01Transition.vue'),
          },
          {
            path: 'transitionGroup',
            name: 'TransitionGroup',
            meta: { title: 'TransitionGroup' },
            component: () => import('@/views/BuiltInComponents/02TransitionGroup/02TransitionGroup.vue'),
          },
          {
            path: 'keepAlive',
            name: 'KeepAlive',
            meta: { title: 'KeepAlive' },
            component: () => import('@/views/BuiltInComponents/03KeepAlive/03KeepAlive.vue'),
          },
          {
            path: 'teleport',
            name: 'Teleport',
            meta: { title: 'Teleport' },
            component: () => import('@/views/BuiltInComponents/04Teleport/04Teleport.vue'),
          },
          
        ],
      },
      {
        path: 'typeScript',
        name: 'TypeScript',
        meta: { title: 'TypeScript', icon: 'Setting' },
        children: [
          {
            path: 'overview',
            name: 'Overview',
            meta: { title: '总览' },
            component: () => import('@/views/TypeScript/01Overview/01Overview.vue'),
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
