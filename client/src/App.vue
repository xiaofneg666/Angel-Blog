<!--
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-06-17 12:12:45
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-12-19 19:37:32
 * @FilePath: \blog-project\client\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->


<template>
  <!-- <NavBar /> -->
  <main class="main-content">
    <router-view />
  </main>
  <Footer/>
  
</template>

<script setup>
// import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();
authStore.init(); // 初始化状态
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f9f9f9;
}

.main-content {
  min-height: calc(100vh - 120px); /* 减去页眉页脚高度 */
  padding: 2rem 0;
}


</style>