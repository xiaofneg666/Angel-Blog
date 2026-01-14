/* NavBar.vue 导航主键 */
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
        <div class="nav-item dropdown" @mouseenter="showArticleDropdown = true"
          @mouseleave="showArticleDropdown = false">
          <i class="iconfont icon-article"></i> 文章
          <span class="dropdown-arrow" :class="{ open: showArticleDropdown }">▼</span>
          <div class="dropdown-menu" v-if="showArticleDropdown">
            <router-link :to="{ name: 'archive' }" class="dropdown-item">
              <i class="iconfont icon-archive"></i> 归档
            </router-link>
            <router-link :to="{ name: 'category' }" class="dropdown-item">
              <i class="iconfont icon-category"></i> 分类
            </router-link>
            <!-- <router-link :to="{ name: 'tag' }" class="dropdown-item">
              <i class="iconfont icon-tag"></i> 标签
            </router-link> -->
          </div>
        </div>
        <!-- 娱乐下拉 -->
        <!-- <div class="nav-item dropdown" @mouseenter="showFunDropdown = true" @mouseleave="showFunDropdown = false">
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
        </div> -->
        <router-link :to="{ name: 'music' }" class="dropdown-item">
          <i class="iconfont icon-music"></i> 音乐
        </router-link>
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
        <div class="cursor-dropdown" @click.stop="toggleCursorMenu">
          <span class="nav-action-btn" title="切换鼠标样式">
            🖱️
          </span>
          <!-- 鼠标样式选择菜单 -->
          <div class="cursor-menu" v-if="showCursorMenu">
            <div class="cursor-menu-header">
              <span>选择鼠标样式</span>
              <span class="cursor-menu-close" @click="showCursorMenu = false">×</span>
            </div>
            <div class="cursor-menu-content">
              <div class="cursor-option" v-for="option in cursorOptions" :key="option.value"
                :class="{ active: cursorStyle.value === option.value }" @click="selectCursorStyle(option.value)"
                :title="option.label">
                <div class="cursor-preview" :style="{ cursor: getPreviewCursor(option.value) }">
                  <span v-if="option.icon" class="cursor-icon">{{ option.icon }}</span>
                  <img v-else-if="option.image" :src="option.image" alt="" class="cursor-image" />
                </div>
                <span class="cursor-label">{{ option.label }}</span>
              </div>
            </div>
          </div>
        </div>
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
const showCursorMenu = ref(false);

const isDark = ref(false);
const cursorStyle = ref('default');

// 鼠标样式选项 - 包含系统样式和自定义动漫样式
const cursorOptions = [
  // 系统默认样式
  { value: 'default', label: '默认', icon: '🖱️' },
  { value: 'pointer', label: '指针', icon: '👉' },
  { value: 'crosshair', label: '十字准星', icon: '➕' },
  { value: 'text', label: '文本', icon: '📝' },
  { value: 'move', label: '移动', icon: '↔️' },
  { value: 'wait', label: '等待', icon: '⏳' },
  { value: 'grab', label: '抓取', icon: '🤏' },

  // 动漫风格样式
  { value: 'heart', label: '爱心指针', image: '/static/爱心指针.png' },
  { value: 'star', label: '星星指针', image: '/static/五角星.png' },
  { value: 'cat', label: '猫咪指针', image: '/static/猫.png' },
  { value: 'dog', label: '狗狗指针', image: '/static/狗.png' },
  { value: 'unicorn', label: '独角兽指针', image: '/static/独角兽.png' }
];

// 初始化主题和鼠标样式
onMounted(() => {
  // 从localStorage获取保存的主题偏好
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // 从localStorage获取保存的鼠标样式偏好
  const savedCursorStyle = localStorage.getItem('cursorStyle');
  if (savedCursorStyle) {
    cursorStyle.value = savedCursorStyle;
  }

  // 应用初始鼠标样式
  applyCursorStyle(cursorStyle.value);

  // 点击页面其他地方关闭菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cursor-dropdown')) {
      showCursorMenu.value = false;
    }
  });
});

function toggleTheme() {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  // 保存主题偏好到localStorage
  localStorage.setItem('theme', theme);
}

function toggleCursorMenu() {
  showCursorMenu.value = !showCursorMenu.value;
}

// 简化的鼠标样式应用函数
function applyCursorStyle(style) {
  // 清除旧的样式元素
  const oldStyle = document.getElementById('cursor-style');
  if (oldStyle) {
    oldStyle.remove();
  }

  // 清除所有现有鼠标样式类
  document.body.className = document.body.className.replace(/cursor-\w+/g, '');

  // 系统默认样式
  const systemStyles = ['default', 'pointer', 'crosshair', 'text', 'move', 'wait', 'grab'];
  if (systemStyles.includes(style)) {
    document.body.classList.add(`cursor-${style}`);
    return;
  }

  // 动漫风格样式 - 使用简单可靠的实现
  const cursorMap = {
    heart: '爱心指针',
    star: '五角星',
    cat: '猫',
    dog: '狗',
    unicorn: '独角兽'
  };

  // 使用相对路径
  const imageName = cursorMap[style];
  const imageUrl = `/static/${imageName}.png`;

  // 创建样式元素，使用!important确保优先级
  const styleElement = document.createElement('style');
  styleElement.id = 'cursor-style';

  // 添加CSS规则，确保所有元素都使用自定义光标
  styleElement.textContent = `
    * {
      cursor: url('${imageUrl}') 0 0, pointer !important;
    }
    body {
      cursor: url('${imageUrl}') 0 0, pointer !important;
    }
  `;

  // 添加样式到head
  document.head.appendChild(styleElement);

  // 添加调试信息
  console.log('Applied custom cursor:', style, 'using image:', imageUrl);

  // 验证图片是否可以加载
  const img = new Image();
  img.onload = () => {
    console.log('Cursor image loaded successfully:', imageUrl);
    console.log('Image dimensions:', img.width, 'x', img.height, 'px');

    // 检查图片尺寸，浏览器对自定义光标的尺寸通常有限制（128x128像素）
    if (img.width > 128 || img.height > 128) {
      console.warn('⚠️  Cursor image warning:', imageUrl);
      console.warn('   Image size:', img.width, 'x', img.height, 'px');
      console.warn('   Recommended size: ≤ 128x128 px');
      console.warn('   Solution: Resize the image using an online tool like:');
      console.warn('   https://resizeimage.net/ or https://www.iloveimg.com/resize-image');
    }
  };

  img.onerror = (error) => {
    console.error('❌ Failed to load cursor image:', imageUrl);
    console.error('   Error:', error);
    console.error('   Please check if the image exists at the specified path.');
    // 加载失败时使用默认指针
    document.body.style.cursor = 'pointer';
  };

  img.src = imageUrl;
}

// 简化的鼠标预览函数
function getPreviewCursor(cursorValue) {
  // 动漫风格样式预览
  const cursorMap = {
    heart: '爱心指针',
    star: '五角星',
    cat: '猫',
    dog: '狗',
    unicorn: '独角兽'
  };

  if (cursorMap[cursorValue]) {
    return `url('/static/${cursorMap[cursorValue]}.png') 0 0, pointer`;
  }

  // 系统样式直接返回
  return cursorValue;
}

function selectCursorStyle(style) {
  cursorStyle.value = style;
  applyCursorStyle(style);
  localStorage.setItem('cursorStyle', style);
  showCursorMenu.value = false;
}
</script>

<style scoped>
.navbar {
  background: rgba(0, 0, 0, 0.15);
  /* 半透明黑，适合图片背景 */
  color: #fff;
  height: 48px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
  position: fixed;
  width: 100%;
  z-index: 100;
  top: 0;
  left: 0;
  backdrop-filter: blur(4px);
  /* 毛玻璃效果，提升可读性 */
  transition: background 0.3s, color 0.3s;
}

[data-theme="dark"] .navbar {
  background: rgba(0, 0, 0, 0.25);
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
  background: rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* 鼠标样式选择菜单 */
.cursor-dropdown {
  position: relative;
  display: inline-block;
}

/* 鼠标样式菜单 */
.cursor-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 2px;
  /* 减少间隙 */
  background: rgba(40, 44, 52, 0.98);
  color: #fff;
  min-width: 300px;
  /* 增加宽度 */
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
  animation: fadeInUp 0.2s ease;
  backdrop-filter: blur(4px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 菜单头部 */
.cursor-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: bold;
  font-size: 16px;
}

.cursor-menu-close {
  cursor: pointer;
  font-size: 20px;
  transition: color 0.2s;
}

.cursor-menu-close:hover {
  color: #ff7675;
}

/* 菜单内容 */
.cursor-menu-content {
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  overflow-y: auto;
  max-height: 350px;
}

/* 鼠标样式选项 */
.cursor-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
}

.cursor-option:hover {
  background: rgba(64, 158, 255, 0.14);
  transform: translateY(-2px);
}

.cursor-option.active {
  background: rgba(64, 158, 255, 0.2);
  border-color: #409EFF;
}

/* 鼠标预览区 */
.cursor-preview {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.1);
  /* 添加一个小点作为鼠标指针的目标，帮助用户看到指针位置 */
  position: relative;
  overflow: hidden;
}

/* 鼠标图标样式 */
.cursor-icon {
  font-size: 24px;
  color: #333;
  pointer-events: none;
}

/* 鼠标图片样式 */
.cursor-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  pointer-events: none;
}

.cursor-preview::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.cursor-option:hover .cursor-preview {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 鼠标样式标签 */
.cursor-label {
  font-size: 13px;
  color: #e6e6e6;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

/* 滚动条样式 */
.cursor-menu-content::-webkit-scrollbar {
  width: 6px;
}

.cursor-menu-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.cursor-menu-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.cursor-menu-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 深色模式适配 */
[data-theme="dark"] .cursor-menu {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .cursor-menu-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .cursor-option {
  background: rgba(255, 255, 255, 0.03);
}

[data-theme="dark"] .cursor-option:hover {
  background: rgba(64, 158, 255, 0.1);
}

[data-theme="dark"] .cursor-option.active {
  background: rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
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
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
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
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  background: rgba(64, 158, 255, 0.14);
  color: #409EFF;
}

.dropdown-item:hover .iconfont {
  color: #409EFF;
}
</style>

<style>
/* 自定义鼠标样式 - 高优先级 */
body {
  transition: cursor 0.3s ease !important;
}

/* 鼠标样式类 - 确保高优先级 */
body.cursor-default,
body.cursor-default * {
  cursor: default !important;
}

body.cursor-pointer,
body.cursor-pointer * {
  cursor: pointer !important;
}

body.cursor-crosshair,
body.cursor-crosshair * {
  cursor: crosshair !important;
}

body.cursor-text,
body.cursor-text * {
  cursor: text !important;
}

body.cursor-move,
body.cursor-move * {
  cursor: move !important;
}

body.cursor-wait,
body.cursor-wait * {
  cursor: wait !important;
}

body.cursor-grab,
body.cursor-grab * {
  cursor: grab !important;
}

/* 自定义鼠标样式支持 */
body.custom-cursor * {
  cursor: inherit !important;
}

/* 特定元素的鼠标样式 - 确保自定义鼠标样式优先 */
body *:hover {
  cursor: inherit !important;
}

/* 输入元素的特殊处理 */
body input,
body textarea,
body select {
  cursor: inherit !important;
}

/* 链接的特殊处理 */
body a {
  cursor: inherit !important;
}
</style>