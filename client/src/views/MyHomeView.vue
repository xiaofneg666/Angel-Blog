<template>
  <div class="my-home">
    <!-- 导航栏 -->
    <NavBar />

    <!-- 个人资料头部 -->
    <div class="profile-header">
      <div class="profile-cover" :style="{ backgroundImage: `url(${coverImage})` }" />
      <div class="profile-info">
        <div class="avatar-container">
          <img :src="userAvatar" alt="用户头像" class="avatar" />
        </div>
        <div class="user-details">
          <div class="user-header">
            <h1 class="username">{{ userInfo.username || '用户名' }}</h1>
            <button class="edit-profile-btn" @click="openEditModal">
              <i class="iconfont icon-edit" />
              编辑资料
            </button>
          </div>
          <p class="user-bio">{{ userInfo.bio || '这个用户很懒，什么都没留下' }}</p>
        </div>
      </div>
    </div>

    <!-- 内容标签页 -->
    <div class="content-tabs-wrapper">
      <div class="content-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <i :class="tab.icon" />
          {{ tab.label }}
          <span class="count">{{ tab.count }}</span>
        </div>
      </div>

      <div class="actions">
        <div class="action-group">
          <router-link :to="{ name: 'create-post' }" class="create-btn">
            <i class="iconfont icon-plus" /> 创作文章
          </router-link>
          <button class="view-toggle" @click="toggleView">
            <i :class="isGrid ? 'iconfont icon-list' : 'iconfont icon-grid'" />
          </button>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-container">
      <div v-if="loading" class="loading">
        <div class="skeleton" v-for="n in 3" :key="n" />
      </div>

      <div v-else-if="articles.length === 0" class="no-articles">
        <div class="empty-content">
          <i :class="currentTab === 'posts' ? 'iconfont icon-article' : currentTab === 'liked' ? 'iconfont icon-like' : 'iconfont icon-star'" class="empty-icon" />
          <p class="empty-text">暂无{{ currentTab === 'posts' ? '发布的' : currentTab === 'liked' ? '点赞的' : '收藏的' }}文章</p>
          <router-link :to="{ name: 'create-post' }" class="create-btn" v-if="currentTab === 'posts'">
            <i class="iconfont icon-plus" /> 创作文章
          </router-link>
        </div>
      </div>

      <div :class="['articles-wrapper', isGrid ? 'grid' : 'list']">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
          :layout="isGrid ? 'grid' : 'list'"
          @like="handleLike"
        />
      </div>

    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>编辑资料</h2>
          <button class="close-btn" @click="showEditModal = false">
            <i class="iconfont icon-close" />
          </button>
        </div>

        <div class="modal-body">
          <!-- 头像上传 -->
          <div class="form-group">
            <label class="form-label">头像</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img :src="editForm.avatarPreview || userAvatar" alt="头像预览" />
              </div>
              <div class="avatar-actions">
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                  style="display: none"
                />
                <button class="upload-btn" @click="$refs.avatarInput.click()">
                  <i class="iconfont icon-upload" />
                  上传头像
                </button>
                <span class="upload-hint">支持 JPG、PNG 格式，建议尺寸 200x200</span>
              </div>
            </div>
          </div>

          <!-- 用户名 -->
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="editForm.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              maxlength="50"
            />
            <span class="char-count">{{ editForm.username.length }}/50</span>
          </div>

          <!-- 个人简介 -->
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea
              v-model="editForm.bio"
              class="form-textarea"
              placeholder="介绍一下自己吧..."
              maxlength="200"
              rows="4"
            />
            <span class="char-count">{{ editForm.bio.length }}/200</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showEditModal = false">取消</button>
          <button class="btn-save" @click="handleSaveProfile" :disabled="saving">
            <i v-if="saving" class="iconfont icon-loading icon-spin" />
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import ArticleCard from '@/components/ArticleCard.vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

/* ---------- 状态 ---------- */
const authStore = useAuthStore();
const route = useRoute();
const currentTab = ref('posts');
const loading = ref(true);
const articles = ref([]);
const isGrid = ref(false);
const coverImage = ref('/2.jpeg');
const showEditModal = ref(false);
const saving = ref(false);

const userInfo = ref({ username: '', bio: '', avatar: '' });
const articleStats = ref({ posts: 0, likes: 0, collections: 0 });

const editForm = ref({
  username: '',
  bio: '',
  avatar: null,
  avatarPreview: ''
});

// 获取用户ID：优先使用路由参数，否则使用当前登录用户的ID
const userId = computed(() => route.params.id || authStore.user?.id);

const tabs = computed(() => [
  { key: 'posts', label: '我的文章', icon: 'iconfont icon-article', count: articleStats.value.posts },
  { key: 'liked', label: '点赞文章', icon: 'iconfont icon-like', count: articleStats.value.likes }
]);

/* ---------- 计算属性 ---------- */
const userAvatar = computed(() => userInfo.value.avatar || '/api/head/2222.jpg');

/* ---------- 方法 ---------- */
const setRandomBackground = () => {
  const imgs = ['/2.jpeg', '/3.jpeg', '/4.jpg', '/1.jpg'];
  coverImage.value = imgs[Math.floor(Math.random() * imgs.length)];
};

const toggleView = () => (isGrid.value = !isGrid.value);

const switchTab = (tab) => {
  currentTab.value = tab;
  fetchArticles();
};

/* ---------- 编辑资料 ---------- */
const openEditModal = () => {
  editForm.value = {
    username: userInfo.value.username || '',
    bio: userInfo.value.bio || '',
    avatar: null,
    avatarPreview: userAvatar.value
  };
  showEditModal.value = true;
};

const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }

  editForm.value.avatar = file;
  editForm.value.avatarPreview = URL.createObjectURL(file);
};

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await axios.post('/api/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return `/api${data.data.avatar}`;
};

const handleSaveProfile = async () => {
  if (!editForm.value.username.trim()) {
    alert('用户名不能为空');
    return;
  }

  saving.value = true;
  try {
    let avatarUrl = userInfo.value.avatar;

    if (editForm.value.avatar) {
      avatarUrl = await uploadAvatar(editForm.value.avatar);
    }

    const { data } = await axios.put(`/api/users/${authStore.user.id}`, {
      username: editForm.value.username,
      bio: editForm.value.bio,
      avatar: avatarUrl.replace('/api', '')
    });

    if (data.success) {
      userInfo.value = {
        ...userInfo.value,
        username: data.data.username,
        bio: data.data.bio,
        avatar: data.data.avatar ? (data.data.avatar.startsWith('/api') ? data.data.avatar : `/api${data.data.avatar}`) : ''
      };

      authStore.updateUser({
        username: data.data.username,
        avatar: data.data.avatar ? (data.data.avatar.startsWith('/api') ? data.data.avatar : `/api${data.data.avatar}`) : ''
      });

      showEditModal.value = false;
      alert('资料更新成功');
    }
  } catch (error) {
    console.error('更新资料失败:', error);
    alert(error.response?.data?.message || '更新失败，请重试');
  } finally {
    saving.value = false;
  }
};

/* ---------- 数据获取 ---------- */
const fetchUserData = async () => {
  if (!userId.value) {
    console.error('用户ID不存在');
    loading.value = false;
    return;
  }
  
  try {
    const { data } = await axios.get(`/api/articles/user/${userId.value}/stats`);
    if (data.success) {
      const { user, stats, recentArticles } = data.data;
      userInfo.value = {
        ...user,
        avatar: user.avatar ? (user.avatar.startsWith('/api') ? user.avatar : `/api${user.avatar}`) : ''
      };
      articleStats.value = {
        posts: stats.articleCount,
        likes: stats.likeCount || 0,
        collections: stats.collectionCount || 0
      };
      articles.value = formatArticles(recentArticles);
    }
  } catch (e) {
    console.error('获取用户数据失败:', e);
  } finally {
    loading.value = false;
  }
};

const fetchArticles = async () => {
  if (!userId.value) {
    console.error('用户ID不存在');
    loading.value = false;
    return;
  }
  
  loading.value = true;
  try {
    let url = '';
    switch (currentTab.value) {
      case 'posts':
        url = `/api/articles/user/${userId.value}/stats`;
        break;
      case 'liked':
        url = `/api/articles/user/${userId.value}/liked`;
        break;
    }
    const { data } = await axios.get(url);
    articles.value = formatArticles(data.data.recentArticles || data.data);
  } catch (e) {
    console.error('获取文章失败:', e);
  } finally {
    loading.value = false;
  }
};

const formatArticles = (list) =>
  list.map((a) => ({
    ...a,
    // 使用有效的默认封面图，因为default-cover.jpg可能损坏
    cover_image: a.cover_image ? 
      (a.cover_image.startsWith('/api/') ? a.cover_image : 
       a.cover_image.startsWith('/uploads/') ? `/api${a.cover_image}` : 
       `/api/uploads/${a.cover_image}`) : 
      '/1.jpg',
    publish_time: a.publish_time ? new Date(a.publish_time).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '未知日期',
    author_name: a.author_name || '未知作者',
    excerpt: a.excerpt || '暂无摘要',
    like_count: a.like_count || 0,
    is_liked: a.is_liked || false
  }));

/* ---------- 点赞 / 收藏 ---------- */
const handleLike = async (id, liked) => {
  try {
    const method = liked ? 'DELETE' : 'POST';
    const response = await axios({ method: method, url: `/api/articles/${id}/like` });
    const data = response.data;
    
    if (data.success) {
      const a = articles.value.find((x) => x.id === id);
      if (a) {
        a.is_liked = !liked;
        a.like_count += liked ? -1 : 1;
      }
    } else {
      ElMessage.error(data.message || (liked ? '取消点赞失败' : '点赞失败'));
    }
  } catch (e) {
    console.error('点赞操作失败:', e);
    ElMessage.error('操作失败，请稍后重试');
  }
};



/* ---------- 生命周期 ---------- */
onMounted(() => {
  if (authStore.isAuthenticated) {
    setRandomBackground();
    fetchUserData();
  }
});
</script>

<style scoped>
  /* ========= 基础 ========= */
  .my-home {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  
  /* ========= 头部 ========= */
  .profile-header {
    width: 100%;
    margin-bottom: 60px;
  }
  .profile-cover {
    height: 320px;
    background-size: cover;
    background-position: center;
    border-radius: 0 0 40px 40px;
    position: relative;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
    overflow: hidden;
  }
  .profile-cover::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  }
  .profile-cover::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 70%;
    background: linear-gradient(to top, rgba(0, 0, 0, .5), transparent);
  }
  .profile-info {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 3px;
    display: flex;
    transform: translateY(-20px);
  }
  .avatar-container {
    position: relative;
    z-index: 2;
  }
  .avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 6px solid #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .15);
    object-fit: cover;
    transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .avatar:hover {
    transform: scale(1.05);
  }
  .user-details {
    margin-left: 48px;
    padding-top: 40px;
    z-index: 2;
    flex: 1;
  }
  .user-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .username {
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .edit-profile-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  .edit-profile-btn:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
  .edit-profile-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  .edit-profile-btn i {
    font-size: 16px;
  }
  .user-bio {
    color: #4e5969;
    margin: 16px 0 32px;
    max-width: 600px;
    line-height: 1.8;
    font-size: 16px;
  }
  .user-stats {
    display: flex;
    gap: 56px;
  }
  .stat-item {
    text-align: center;
    padding: 10px 22px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .06);
    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .stat-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
  }
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-label {
    color: #86909c;
    font-size: 15px;
    margin-top: 8px;
    font-weight: 500;
  }
  
  /* ========= 标签栏 ========= */
  .content-tabs-wrapper {
    max-width: 1200px;
    margin: 0 auto 28px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .content-tabs {
    display: flex;
    border-bottom: 2px solid #e5e6eb;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding: 0 12px;
  }
  .tab {
    padding: 18px 36px;
    font-size: 16px;
    color: #4e5969;
    cursor: pointer;
    position: relative;
    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px 12px 0 0;
    font-weight: 500;
  }
  .tab:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  .tab.active {
    color: #667eea;
    font-weight: 600;
    background: rgba(102, 126, 234, 0.08);
  }
  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px 3px 0 0;
  }
  .count {
    margin-left: 10px;
    font-size: 13px;
    color: #86909c;
    background: #f2f3f5;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
  }
  
  /* ========= 右侧按钮 ========= */
  .actions {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .action-group {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    padding: 6px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e6eb;
  }
  .create-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  .create-btn:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }
  .view-toggle {
    width: 48px;
    height: 48px;
    border: 2px solid transparent;
    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 20px;
    color: #4e5969;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
  }
  .view-toggle::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    opacity: 0;
    transition: opacity .3s;
  }
  .view-toggle:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
  }
  .view-toggle:hover::before {
    opacity: 1;
  }
  .view-toggle:active {
    transform: translateY(0) scale(1.02);
    box-shadow: 0 3px 12px rgba(102, 126, 234, 0.2);
  }
  .view-toggle i {
    transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .view-toggle:hover i {
    transform: scale(1.1);
  }
  
  /* ========= 文章列表 ========= */
  .articles-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px 120px;
  }
  
  /* 加载骨架屏 */
  .loading {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 80px 0;
  }
  .skeleton {
    width: 100%;
    height: 260px;
    border-radius: 20px;
    background: linear-gradient(90deg,
        rgba(240, 242, 245, .6) 25%,
        rgba(224, 227, 232, .6) 50%,
        rgba(240, 242, 245, .6) 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  
  /* 空状态 */
  .no-articles {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px 0;
  }
  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .empty-icon {
    font-size: 64px;
    color: #c9cdd4;
    transition: all .3s;
  }
  .empty-content:hover .empty-icon {
    color: #667eea;
    transform: scale(1.1);
  }
  .empty-text {
    font-size: 16px;
    color: #86909c;
    margin: 0;
  }
  .no-articles .create-btn {
    margin-top: 8px;
    background: linear-gradient(135deg, #e8ecf1 0%, #f5f7fa 100%);
    color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
  .no-articles .create-btn:hover {
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    color: #764ba2;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
  }
  
  /* 文章布局 */
  .articles-wrapper {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .articles-wrapper.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 36px;
  }
  
  /* 卡片悬停效果 */
  .articles-wrapper.grid > *,
  .articles-wrapper.list > * {
    transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow .3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .articles-wrapper.grid > *:hover,
  .articles-wrapper.list > *:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, .12);
  }
  
  /* ========= 响应式 ========= */
  @media (max-width: 992px) {
    .articles-wrapper.grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
    }
    .user-stats {
      gap: 32px;
    }
    .stat-item {
      padding: 12px 20px;
    }
  }
  @media (max-width: 768px) {
    .profile-cover {
      height: 220px;
      border-radius: 0 0 24px 24px;
    }
    .profile-info {
      flex-direction: column;
      align-items: center;
      transform: translateY(-60px);
    }
    .avatar {
      width: 120px;
      height: 120px;
    }
    .user-details {
      margin-left: 0;
      text-align: center;
      padding-top: 24px;
    }
    .user-header {
      flex-direction: column;
      gap: 16px;
    }
    .user-stats {
      justify-content: center;
      gap: 24px;
    }
    .stat-item {
      padding: 12px 16px;
    }
    .stat-value {
      font-size: 24px;
    }
    .content-tabs-wrapper {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    .content-tabs {
      border-radius: 12px;
    }
    .actions {
      justify-content: center;
    }
    .articles-wrapper.grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
  @media (max-width: 480px) {
    .username {
      font-size: 24px;
    }
    .edit-profile-btn {
      padding: 10px 20px;
      font-size: 13px;
    }
    .tab {
      padding: 12px 20px;
      font-size: 14px;
    }
  }

  /* ========= 编辑资料弹窗 ========= */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 32px;
    border-bottom: 1px solid #e5e6eb;
  }
  .modal-header h2 {
    font-size: 22px;
    font-weight: 600;
    color: #1d2129;
    margin: 0;
  }
  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f2f3f5;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .2s;
    color: #4e5969;
  }
  .close-btn:hover {
    background: #e5e6eb;
    color: #1d2129;
  }

  .modal-body {
    padding: 32px;
  }

  .form-group {
    margin-bottom: 28px;
    position: relative;
  }
  .form-label {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 10px;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #e5e6eb;
    border-radius: 10px;
    font-size: 15px;
    color: #1d2129;
    transition: all .2s;
    background: #fff;
    box-sizing: border-box;
  }
  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
  .form-input::placeholder,
  .form-textarea::placeholder {
    color: #c9cdd4;
  }
  .form-textarea {
    resize: vertical;
    line-height: 1.7;
  }

  .char-count {
    position: absolute;
    right: 0;
    bottom: -22px;
    font-size: 13px;
    color: #86909c;
  }

  .avatar-upload {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .avatar-preview {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #e5e6eb;
    flex-shrink: 0;
  }
  .avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .avatar-actions {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all .3s;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    width: fit-content;
  }
  .upload-btn:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  .upload-hint {
    font-size: 13px;
    color: #86909c;
  }

  .modal-footer {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    padding: 24px 32px;
    border-top: 1px solid #e5e6eb;
    background: #f7f8fa;
  }
  .btn-cancel,
  .btn-save {
    padding: 12px 28px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
    border: none;
  }
  .btn-cancel {
    background: #fff;
    color: #4e5969;
    border: 1px solid #e5e6eb;
  }
  .btn-cancel:hover {
    background: #f2f3f5;
    border-color: #c9cdd4;
  }
  .btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  .btn-save:hover:not(:disabled) {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .icon-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* 弹窗响应式 */
  @media (max-width: 600px) {
    .modal-content {
      margin: 16px;
      max-height: calc(100vh - 32px);
    }
    .modal-header,
    .modal-body,
    .modal-footer {
      padding: 20px;
    }
    .avatar-upload {
      flex-direction: column;
      align-items: center;
    }
    .avatar-actions {
      align-items: center;
      text-align: center;
    }
  }
  </style>