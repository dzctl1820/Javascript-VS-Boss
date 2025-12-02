import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../game/views/index.vue'),
  },
  {
    path: '/onevsone',
    name: 'Onevsone',
    component: () => import('../game/views/onevsone.vue'),
  },
  {
    path: '/level',
    name: 'Level',
    component: () => import('../game/views/level.vue')
  }
];


const routerInstance = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default routerInstance;