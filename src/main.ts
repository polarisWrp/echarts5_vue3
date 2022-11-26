import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import SocketService from '@/utils/useWebSocket';

import '@/assets/css/global.scss';
import '@/assets/font/iconfont.css';
// SocketService.Instance.connect();

const app = createApp(App);
// app.config.globalProperties.$socket = SocketService.Instance;
app.use(createPinia());
app.use(router);
app.mount('#app');
