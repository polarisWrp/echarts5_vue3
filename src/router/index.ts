import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TotalCharts from '../views/TotalCharts/index.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    // component: TotalCharts,
    component: HomeView,
  },
  {
    path: '/echarts',
    name: 'Echarts',
    component: () => import('../views/TotalCharts/index.vue'),
    children: [
      // {
      //   path: '/kkk',
      //   component: () => import('../views/OtherView/index.vue'),
      // },
      // {
      //   path: '/hot',
      //   component: () => import('../views/TotalCharts/components/HotChart.vue'),
      // },
      // {
      //   path: '/hot',
      //   component: () => import('../views/TotalCharts/components/HotChart.vue'),
      // },
      // {
      //   path: '/map',
      //   component: () => import('../views/TotalCharts/components/ChinaMapChart.vue'),
      // },
      // {
      //   path: '/rank',
      //   component: () => import('../views/TotalCharts/components/RankChart.vue'),
      // },
      // {
      //   path: '/seller',
      //   component: () => import('../views/TotalCharts/components/SellerChart.vue'),
      // },
      // {
      //   path: '/stock',
      //   component: () => import('../views/TotalCharts/components/StockChart.vue'),
      // },
      // {
      //   path: '/trend',
      //   component: () => import('../views/TotalCharts/components/TrendChart.vue'),
      // },
    ],
  },
  {
    path: '/hot',
    component: () => import('../views/TotalCharts/components/HotChart.vue'),
  },
  {
    path: '/echarts/map',
    component: () => import('../views/TotalCharts/components/ChinaMapChart.vue'),
  },
  {
    path: '/rank',
    component: () => import('../views/TotalCharts/components/RankChart.vue'),
  },
  {
    path: '/seller',
    component: () => import('../views/TotalCharts/components/SellerChart.vue'),
  },
  {
    path: '/stock',
    component: () => import('../views/TotalCharts/components/StockChart.vue'),
  },
  {
    path: '/trend',
    component: () => import('../views/TotalCharts/components/TrendChart.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
