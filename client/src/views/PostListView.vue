
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
          </h2>
          <p class="meta">
            作者: {{ post.username }} | 发布于: {{ formatDate(post.created_at) }}
          </p>
          <p class="excerpt">{{ post.content ? post.content.substring(0, 100) + '...' : '暂无内容' }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { usePostStore } from '@/stores/post';
  
  const postStore = usePostStore();
  
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
  }
  
  .post-card h2 a {
    color: #2c3e50;
    text-decoration: none;
  }
  
  .post-card h2 a:hover {
    color: #42b983;
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