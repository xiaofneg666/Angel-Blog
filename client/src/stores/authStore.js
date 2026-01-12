import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '@/router';
import { loginUser, registerUser } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);

  const login = (userData) => {
    user.value = {
      username: userData.username,
      id: userData.userId,
      role: userData.role
    };
    token.value = userData.token;
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(user.value));
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const updateUser = (userData) => {
    user.value = {
      ...user.value,
      ...userData
    };
    localStorage.setItem('user', JSON.stringify(user.value));
  };

  // 初始化时从localStorage恢复状态
  const init = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    } else {
      // 如果没有token或用户信息，清除所有状态
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };


  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    init
  };
})
;
