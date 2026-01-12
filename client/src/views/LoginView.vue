<!--
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-05-07 09:37:16
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-06-09 23:53:51
 * @FilePath: \小峰大王\blog-project\client\src\views\LoginView.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="auth-page">
    <div class="container" :class="{ 'right-panel-active': isSignUp }">
      <!-- 注册表单 -->
      <div class="form-container sign-up-container">
        <form @submit.prevent="handleSignUp">
          <h1>创建账号</h1>
          <div class="social-container">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-google-plus-g"></i></a>
            <a href="#"><i class="fab fa-linkedin-in"></i></a>
          </div>
          <div class="user-type-selector">
            <div class="compact-select-wrapper">
              <select v-model="signUpForm.userType" class="compact-select">
                <option value="user">用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
         
          <input v-model="signUpForm.name" type="text" placeholder="用户名" required />
          <input v-model="signUpForm.email" type="email" placeholder="邮箱" required />
          <input v-model="signUpForm.password" type="password" placeholder="密码" required />
          <button type="submit">注册</button>
        </form>
      </div>

      <!-- 登录表单 -->
      <div class="form-container sign-in-container">
        <form @submit.prevent="handleSignIn">
          <h1>用户登录</h1>
          <div class="social-container">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-google-plus-g"></i></a>
            <a href="#"><i class="fab fa-linkedin-in"></i></a>
          </div>
          <div class="user-type-selector">
            <div class="compact-select-wrapper">
              <select v-model="signInForm.userType" class="compact-select">
                <option value="user">用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
          <input v-model="signInForm.email" type="email" placeholder="邮箱" required />
          <input v-model="signInForm.password" type="password" placeholder="密码" required />
          <a href="#">忘记密码?</a>
          <button type="submit">登录</button>
        </form>
      </div>

      <!-- 覆盖层 -->
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>欢迎回来!</h1>
            <p>请使用您的个人账号登录以保持连接</p>
            <button class="ghost" @click="toggleForm(false)">登录</button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1>你好，欢迎来到Angel!</h1>
            <p>输入您的个人信息，开始与我们同行</p>
            <button class="ghost" @click="toggleForm(true)">注册</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuthStore } from '@/stores/authStore'; // 添加authStore导入

const API_URL = 'http://localhost:3000/api/auth';
export default {
  name: 'LoginSignup',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // 获取authStore实例
    const isSignUp = ref(true);

    const toggleForm = (showSignUp) => {
      if(showSignUp) {
        router.push({ name: 'register' });
      }
    };

    onMounted(() => {
      setTimeout(() => {
        isSignUp.value = false;
      }, 100);
    });

    const signUpForm = ref({
      name: '',
      email: '',
      password: '',
      userType: 'user'
    });
    
    const signInForm = ref({
      email: '',
      password: '',
      userType: 'user'
    });

    const handleSignUp = () => {
      console.log('注册信息:', signUpForm.value);
      // 注册逻辑
    };

    const handleSignIn = async () => {
      try {
        const response = await axios.post(`${API_URL}/login`, {
          email: signInForm.value.email,
          password: signInForm.value.password,
          userType: signInForm.value.userType
        });
        
        // 调用authStore的登录方法更新状态（关键修改）
        authStore.login({
          username: response.data.username,
          userId: response.data.userId,
          token: response.data.token,
          role: response.data.role
        });
        
        // 根据角色跳转
        if (response.data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('登录失败:', error);
        if (error.response) {
          alert(`登录失败: ${error.response.data.message}`);
        } else {
          alert('登录请求失败，请检查网络连接');
        }
      }
    };

    return {
      isSignUp,
      signUpForm,
      signInForm,
      toggleForm,
      handleSignUp,
      handleSignIn
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
* {
  box-sizing: border-box;
}
body {
  background: #f6f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Noto Sans SC', sans-serif;
  height: 100vh;
  margin: -20px 0 50px;
}
h1 {
  font-weight: bold;
  margin: 0;
}
h2 {
  text-align: center;
}
p {
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}
span {
  font-size: 12px;
}
a {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
}
button {
  border-radius: 20px;
  border: 1px solid #ff4b2b;
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}
button:active {
  transform: scale(0.95);
}
button:focus {
  outline: none;
}
button.ghost {
  background-color: transparent;
  border-color: #ffffff;
}
form {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}
input {
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
}
.container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
}
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}
.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}
.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}
.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}
.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}
@keyframes show {
  0%, 49.99% {
    opacity: 0;
    z-index: 1;
  }
  50%, 100% {
    opacity: 1;
    z-index: 5;
  }
}
.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}
.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}
.overlay {
  background: #ff4b2b;
  background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}
.container.right-panel-active .overlay {
  transform: translateX(50%);
}
.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}
.overlay-left {
  transform: translateX(-20%);
}
.container.right-panel-active .overlay-left {
  transform: translateX(0);
}
.overlay-right {
  right: 0;
  transform: translateX(0);
}
.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}
.social-container {
  margin: 20px 0;
}
.social-container a {
  border: 1px solid #dddddd;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
}

.user-type-selector {
  margin: 10px 0;
}

/* 简化后的选择器样式 */
.compact-select-wrapper {
  position: relative;
  display: inline-block;
  width: auto;
  min-width: 120px;
}

.compact-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px; /* 增加圆角 */
  background-color: #f8f9fa;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  width: 100%; /* 让选择框填满容器 */
}

.compact-select:hover {
  border-color: #bbb;
}

.compact-select:focus {
  border-color: rgb(0, 255, 251);
  box-shadow: 0 0 0 1px rgba(255, 75, 43, 0.2);
}

/* 移除下拉箭头图标 */
.compact-select-wrapper::after {
  display: none;
}

select::-ms-expand {
  display: none;
}

.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
</style>
