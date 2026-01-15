
<!-- PostListView.vue - 文章列表页面 -->
<template>
    <div class="post-list">
      <h1>文章列表</h1>
      
      <div v-if="postStore.isLoading">加载中...</div>
      <div v-else-if="postStore.error" class="error">{{ postStore.error }}</div>
      <div v-else>
        <div v-for="post in postStore.posts" :key="post.id" class="post-card">
          <h2>
            <router-link :to="{ name: 'post-detail', params: { id: post.id } }">
              {{ post.title }}
            </router-link>
            <!-- 管理员或文章作者可以看到删除按钮 -->
            <button 
              v-if="canDeletePost(post)" 
              class="delete-btn" 
              @click="confirmDelete(post.id)"
            >
              删除
            </button>
          </h2>
          <p class="meta">
            作者: {{ post.username }} | 发布于: {{ formatDate(post.publish_time) }}
          </p>
          <p class="excerpt">{{ post.content ? post.content.substring(0, 100) + '...' : '暂无内容' }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { usePostStore } from '@/stores/post';
  import { useAuthStore } from '@/stores/authStore';
  
  const postStore = usePostStore();
  const authStore = useAuthStore();
  
  // 初始化用户状态
  authStore.init();
  
  // 检查是否有权限删除文章
  function canDeletePost(post) {
    if (!authStore.isAuthenticated || !authStore.user) {
      return false;
    }
    // 管理员或文章作者可以删除
    return authStore.user.role === 'admin' || authStore.user.id == post.author_id;
  }
  
  // 删除文章
  async function confirmDelete(postId) {
    if (confirm('确定要删除这篇文章吗？此操作不可恢复，会同时删除相关评论和封面图片。')) {
      try {
        await postStore.removePost(postId);
        alert('文章删除成功');
      } catch (error) {
        alert('删除失败：' + (error.response?.data?.message || error.message || '未知错误'));
      }
    }
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  onMounted(() => {
    postStore.getPosts();
  });
  </script>
  
  <style scoped>
  .post-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .post-card {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    position: relative;
  }
  
  .post-card h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0;
  }
  
  .post-card h2 a {
    color: #2c3e50;
    text-decoration: none;
    flex: 1;
  }
  
  .post-card h2 a:hover {
    color: #42b983;
  }
  
  .delete-btn {
    background-color: #ff4d4f;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-left: 1rem;
  }
  
  .delete-btn:hover {
    background-color: #ff7875;
  }
  
  .meta {
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  .excerpt {
    color: #333;
    line-height: 1.6;
  }
  
  .error {
    color: #ff5252;
  }
  </style>