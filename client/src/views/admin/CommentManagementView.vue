<template>
  <div class="comment-management">
    <h1>评论管理</h1>

    <!-- 简单搜索 -->
    <div class="search-box">
      <input v-model="searchKeyword" placeholder="搜索评论..." />
      <button @click="loadComments">搜索</button>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      

      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <span class="username">{{ comment.username }}</span>
          <span class="date">{{ comment.createdAt }}</span>
          <span class="article-title">{{ comment.articleTitle }}</span>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        <div class="comment-actions">
          <button @click="deleteComment(comment.id)">删除</button>
        </div>
      </div>
      

      <div v-if="comments.length === 0 && !loading && !error" class="no-comments">
        暂无评论数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCommentStore } from '@/stores/comment';
import { formatDate } from '@/utils/format';

// 状态管理
const commentStore = useCommentStore();

// 数据状态
const comments = ref([]);
const loading = ref(false);
const error = ref('');
const searchKeyword = ref('');

// 获取评论列表
async function loadComments() {
  try {
    loading.value = true;
    error.value = '';
    // 使用简化的API调用
    await commentStore.getComments();
    // 简单过滤评论
    let filteredComments = commentStore.comments;
    if (searchKeyword.value) {
      filteredComments = filteredComments.filter(comment => 
        comment.content.includes(searchKeyword.value) || 
        comment.username.includes(searchKeyword.value)
      );
    }
    // 格式化日期
    comments.value = filteredComments.map(comment => ({
      ...comment,
      createdAt: formatDate(comment.created_at),
      articleTitle: comment.articleTitle || '未知文章'
    }));
  } catch (err) {
    error.value = '获取评论失败: ' + (err.message || '未知错误');
    console.error('加载评论错误:', err);
  } finally {
    loading.value = false;
  }
}

// 删除评论
async function deleteComment(commentId) {
  if (!confirm('确定要删除这条评论吗?')) return;

  try {
    loading.value = true;
    await commentStore.removeComment(commentId);
    // 重新加载评论
    loadComments();
    alert('删除成功');
  } catch (err) {
    error.value = '删除评论失败: ' + (err.message || '未知错误');
    console.error('删除评论错误:', err);
  } finally {
    loading.value = false;
  }
}

// 页面加载时获取评论
onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.comment-management {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-box button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-list {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #666;
}

.username {
  font-weight: bold;
  color: #333;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.5;
}

.comment-actions button {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  color: #f56c6c;
  padding: 10px;
  text-align: center;
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>