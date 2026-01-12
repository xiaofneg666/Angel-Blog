/* NavBar.vue  导航主键 */
<template>
  <nav class="navbar">
    <div class="container">
      <!-- 左侧 Logo -->
      <router-link :to="{ name: 'home' }" class="logo">Angel</router-link>
      <!-- 菜单 -->
      <div class="nav-links">
        <router-link :to="{ name: 'home' }" class="nav-item" exact-active-class="active">
          <i class="iconfont icon-home"></i> 首页
        </router-link>
        <!-- 文章下拉 -->
        <div class="nav-item dropdown" @mouseenter="showArticleDropdown = true" @mouseleave="showArticleDropdown = false">
          <i class="iconfont icon-article"></i> 文章
          <span class="dropdown-arrow" :class="{ open: showArticleDropdown }">▼</span>
          <div class="dropdown-menu" v-if="showArticleDropdown">
            <router-link :to="{ name: 'archive' }" class="dropdown-item">
              <i class="iconfont icon-archive"></i> 归档
            </router-link>
            <router-link :to="{ name: 'category' }" class="dropdown-item">
              <i class="iconfont icon-category"></i> 分类
            </router-link>
            <router-link :to="{ name: 'tag' }" class="dropdown-item">
              <i class="iconfont icon-tag"></i> 标签
            </router-link>
          </div>
        </div>
        <!-- 娱乐下拉 -->
        <div class="nav-item dropdown" @mouseenter="showFunDropdown = true" @mouseleave="showFunDropdown = false">
          <i class="iconfont icon-fun"></i> 娱乐
          <span class="dropdown-arrow" :class="{ open: showFunDropdown }">▼</span>
          <div class="dropdown-menu" v-if="showFunDropdown">
            <router-link :to="{ name: 'game' }" class="dropdown-item">
              <i class="iconfont icon-game"></i> 游戏
            </router-link>
            <router-link :to="{ name: 'music' }" class="dropdown-item">
              <i class="iconfont icon-music"></i> 音乐
            </router-link>
          </div>
        </div>
        <router-link :to="{ name: 'links' }" class="nav-item">
          <i class="iconfont icon-link"></i> 友链
        </router-link>
        <router-link :to="{ name: 'board' }" class="nav-item">
          <i class="iconfont icon-message"></i> 留言板
        </router-link>
        <router-link :to="{ name: 'about' }" class="nav-item">
          <i class="iconfont icon-about"></i> 关于
        </router-link>
                  <!-- 新增发布按钮 -->
        <router-link :to="{ name: 'create-post' }" class="nav-item">
            <i class="iconfont icon-publish"></i> 发布
          </router-link>
        <router-link v-if="!authStore.isAuthenticated" :to="{ name: 'login' }" class="nav-item">
          <i class="iconfont icon-user"></i> 登录
        </router-link>
        <template v-else>
          <span class="username">{{ authStore.user?.username }}</span>


          <button @click="authStore.logout" class="nav-item">退出</button>
        </template>
      </div>
      <!-- 右侧功能按钮 -->
      <div class="nav-actions">
        <span class="nav-action-btn" title="搜索">🔍</span>
        <span class="nav-action-btn" @click="toggleTheme" title="白/夜模式">
          {{ isDark ? '🌙' : '☀️' }}
        </span>
        <span class="nav-action-btn" @click="toggleCursor" title="切换鼠标样式">
          🖱️
        </span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

const showArticleDropdown = ref(false);
const showFunDropdown = ref(false);

const isDark = ref(false);
const cursorStyle = ref('default');

// 新增：初始化主题
onMounted(() => {
  // 从localStorage获取保存的主题偏好
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

function toggleTheme() {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  // 新增：保存主题偏好到localStorage
  localStorage.setItem('theme', theme);
}

function toggleCursor() {
  cursorStyle.value = cursorStyle.value === 'default' ? 'pointer' : 'default';
  document.body.style.cursor = cursorStyle.value;
}
</script>

<style scoped>
.navbar {
  background: rgba(0,0,0,0.15); /* 半透明黑，适合图片背景 */
  color: #fff;
  height: 48px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  position: fixed;
  width: 100%;
  z-index: 100;
  top: 0;
  left: 0;
  backdrop-filter: blur(4px); /* 毛玻璃效果，提升可读性 */
  transition: background 0.3s, color 0.3s;
}
[data-theme="dark"] .navbar {
  background: rgba(0,0,0,0.25);
  color: #fff;
}
.container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 32px;
}
.logo {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  text-decoration: none;
  margin-right: 2rem;
  letter-spacing: 2px;
  transition: color 0.3s;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex: 1;
  justify-content: flex-start;
}
.nav-item {
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  font-size: 1.05rem;
  padding: 0 0.8rem;
  height: 48px;
  position: relative;
  transition: color 0.2s, background 0.2s;
  cursor: pointer;
  border-radius: 6px;
}
.nav-item .iconfont {
  margin-right: 5px;
  font-size: 1.1em;
}
.nav-item.active,
.nav-item.router-link-exact-active {
  color: #fff;
  font-weight: bold;
}
.nav-item.active::after,
.nav-item.router-link-exact-active::after {
  content: "";
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 8px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}
.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.username {
  margin: 0 0.7rem;
  color: #fff;
  font-weight: bold;
}
button.nav-item {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.05rem;
  padding: 0 0.8rem;
  height: 48px;
  border-radius: 6px;
}
button.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.nav-action-btn {
  font-size: 1.3rem;
  cursor: pointer;
  user-select: none;
  padding: 6px 8px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
  color: #fff;
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-action-btn:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}
.dropdown {
  position: relative;
}
.dropdown-arrow {
  display: inline-block;
  margin-left: 4px;
  font-size: 0.8em;
  transition: transform 0.2s;
  vertical-align: middle;
}
.dropdown-arrow.open {
  transform: rotate(180deg);
}
.dropdown-menu {
  position: absolute;
  top: 48px;
  left: 0;
  background: rgba(40, 44, 52, 0.98);
  color: #fff;
  min-width: 150px;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.18);
  z-index: 200;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  animation: fadeIn 0.18s;
  border: none;
  backdrop-filter: blur(2px);
  overflow: hidden;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px);}
  to { opacity: 1; transform: translateY(0);}
}
.dropdown-item {
  color: #fff;
  padding: 10px 22px 10px 18px;
  text-decoration: none;
  font-size: 1.06rem;
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;
  border-radius: 6px;
  font-weight: 400;
  cursor: pointer;
  background: none;
  margin: 0 6px;
  gap: 10px;
}
.dropdown-item .iconfont {
  font-size: 1.15em;
  color: #a0aec0;
  transition: color 0.15s;
  margin-right: 8px;
}
.dropdown-item:hover {
  background: rgba(64,158,255,0.14);
  color: #409EFF;
}
.dropdown-item:hover .iconfont {
  color: #409EFF;
}
</style>