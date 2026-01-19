<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <aside class="sidebar-container" :class="{ 'collapsed': isCollapse, 'hidden': !sidebarVisible }">
      <div class="sidebar-header">
        <div class="logo" v-if="!isCollapse">
          <span class="logo-icon">📊</span>
          <h2 class="logo-text">Ange后台管理</h2>
        </div>
        <div class="logo-collapsed" v-if="isCollapse">
          <span class="logo-icon">📊</span>
        </div>
        <button @click="toggleCollapse" class="collapse-btn">
          {{ isCollapse ? '→' : '←' }}
        </button>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li :class="{ 'active': currentRoute === '/admin/dashboard' }">
            <a href="#/admin/dashboard" @click.prevent="navigate('/admin/dashboard')">
              <span class="nav-icon">📈</span>
              <span class="nav-text" v-if="!isCollapse">仪表盘</span>
            </a>
          </li>
          <li :class="{ 'active': currentRoute === '/admin/articles' }">
            <a href="#/admin/articles" @click.prevent="navigate('/admin/articles')">
              <span class="nav-icon">📄</span>
              <span class="nav-text" v-if="!isCollapse">文章管理</span>
            </a>
          </li>
          <li :class="{ 'active': currentRoute === '/admin/users' }">
            <a href="#/admin/users" @click.prevent="navigate('/admin/users')">
              <span class="nav-icon">👥</span>
              <span class="nav-text" v-if="!isCollapse">用户管理</span>
            </a>
          </li>
          <li :class="{ 'active': currentRoute === '/admin/comments' }">
            <a href="#/admin/comments" @click.prevent="navigate('/admin/comments')">
              <span class="nav-icon">💬</span>
              <span class="nav-text" v-if="!isCollapse">评论管理</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="main-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="sidebar-toggle">☰</button>
        </div>
        <div class="header-right">
          <div class="user-menu">
            <button class="user-btn" @click="toggleUserMenu">
              <img :src="getAvatarUrl(userInfo.avatar)" alt="用户头像" class="user-avatar">
              <span class="username">{{ userInfo.username }}</span>
              <span class="caret">▼</span>
            </button>
            <div class="dropdown-menu" v-if="userMenuOpen">
              <a href="#/admin/profile" @click.prevent="navigate('/admin/profile')" class="dropdown-item">
                <span class="item-icon">👤</span> 个人资料
              </a>
              <div class="dropdown-divider"></div>
              <a href="#" @click.prevent="logout" class="dropdown-item logout">
                <span class="item-icon">🚪</span> 退出登录
              </a>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="content-wrapper">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userInfo = computed(() => authStore.user || {});
const isCollapse = ref(false);
const sidebarVisible = ref(true);
const userMenuOpen = ref(false);
const currentRoute = ref(route.path);

// 检查管理员权限
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login');
    return;
  }
  
  // 初始化时获取完整用户信息，确保包含avatar字段
  try {
    const { getUserById } = await import('@/api/auth');
    if (authStore.user?.id) {
      const userData = await getUserById(authStore.user.id);
      authStore.updateUser(userData);
      console.log('获取完整用户信息成功:', userData);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }

  // 监听窗口大小，自动折叠侧边栏
  const handleResize = () => {
    if (window.innerWidth < 768) {
      isCollapse.value = true;
      sidebarVisible.value = false;
    } else {
      sidebarVisible.value = true;
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化

  // 监听路由变化
  watch(() => route.path, (newPath) => {
    currentRoute.value = newPath;
  });

  return () => window.removeEventListener('resize', handleResize);
});

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 移动端切换侧边栏显示
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

// 切换用户菜单
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

// 点击其他区域关闭下拉菜单
document.addEventListener('click', (e) => {
  const userBtn = document.querySelector('.user-btn');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (userBtn && dropdownMenu && !userBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    userMenuOpen.value = false;
  }
});

// 导航到指定路由
const navigate = (path) => {
  router.push(path);
  currentRoute.value = path;
  // 在移动设备上导航后关闭侧边栏
  if (window.innerWidth < 768) {
    sidebarVisible.value = false;
  }
};

// 退出登录
const logout = () => {
  authStore.logout();
  router.push('/login');
};

// 处理头像URL
const getAvatarUrl = (avatar) => {
  console.log('原始头像URL:', avatar);
  
  if (!avatar) {
    console.log('头像为空，返回默认头像');
    return '/api/head/2222.jpg';
  }
  
  // 如果头像已经是完整URL，直接返回
  if (avatar.startsWith('http')) {
    console.log('头像已经是完整URL，直接返回');
    return avatar;
  }
  
  // 如果头像已经以/api开头，直接返回
  if (avatar.startsWith('/api')) {
    console.log('头像已经以/api开头，直接返回');
    return avatar;
  }
  
  // 如果头像以/开头，添加/api前缀
  if (avatar.startsWith('/')) {
    const result = `/api${avatar}`;
    console.log('头像以/开头，添加/api前缀后:', result);
    return result;
  }
  
  // 否则，添加/api/head前缀
  const result = `/api/head/${avatar}`;
  console.log('添加/api/head前缀后:', result);
  return result;
};
</script>

<style scoped>
/* 基础样式 */
.admin-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar-container {
  width: 220px;
  background-color: #1e293b;
  color: #e2e8f0;
  transition: width 0.3s ease, transform 0.3s ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.sidebar-container.collapsed {
  width: 60px;
}

.sidebar-container.hidden {
  transform: translateX(-100%);
  position: absolute;
  height: 100vh;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 60px;
  border-bottom: 1px solid #334155;
}

.logo {
  display: flex;
  align-items: center;
  flex: 1;
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  margin: 0;
  color: #f8fafc;
}

.logo-collapsed {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.collapse-btn:hover {
  background-color: #334155;
}

.sidebar-nav {
  padding-top: 15px;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 5px;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #94a3b8;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.sidebar-nav li.active a {
  background-color: #334155;
  color: #f8fafc;
  border-left-color: #3b82f6;
}

.sidebar-nav a:hover {
  background-color: #334155;
  color: #f8fafc;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-text {
  margin-left: 10px;
  white-space: nowrap;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 顶部导航样式 */
.main-header {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sidebar-toggle {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #334155;
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.sidebar-toggle:hover {
  background-color: #f1f5f9;
}

/* 用户菜单样式 */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-btn:hover {
  background-color: #f1f5f9;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

.username {
  font-weight: 500;
  color: #334155;
  margin-right: 5px;
}

.caret {
  font-size: 12px;
  color: #64748b;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 180px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 5px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #334155;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.item-icon {
  margin-right: 8px;
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 5px 0;
}

.logout {
  color: #ef4444;
}

/* 内容包装器样式 */
.content-wrapper {
  flex: 1;
  padding: 20px;
  background-color: #f8fafc;
  overflow-y: auto;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: flex;
  }

  .sidebar-container {
    position: absolute;
    height: 100vh;
  }
}
</style>