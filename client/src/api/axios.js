/* 创建Axios实例配置 */
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://yourdomain.com/api' 
    : '/api',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 处理未认证错误
      // 导入authStore（使用动态导入避免循环依赖）
      import('@/stores/authStore').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        authStore.logout();
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;