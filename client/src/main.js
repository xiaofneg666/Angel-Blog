import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/authStore';

// 创建应用实例
const app = createApp(App);

// 使用Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 使用Element Plus
app.use(ElementPlus);

// 初始化认证状态
const authStore = useAuthStore();
authStore.init();

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');