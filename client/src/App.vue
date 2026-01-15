


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