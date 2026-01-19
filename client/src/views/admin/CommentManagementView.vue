<template>
  <div class="comment-management">
    <h1 class="page-title">评论管理</h1>

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
/* 全局变量 - 与其他管理页面保持一致 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;
  --border-color: #e4e7ed;
  --border-light: #ebeef5;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 24px 0 rgba(0, 0, 0, 0.15);
  --transition-base: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  --transition-fast: all 0.2s ease-in-out;
}

/* 基础样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.comment-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

/* 标题样式 */
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-light);
}

/* 搜索框样式 */
.search-box {
  margin: 0 0 24px 0;
  display: flex;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.search-box input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--card-bg);
  transition: var(--transition-base);
  outline: none;
}

.search-box input:focus {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.search-box input::placeholder {
  color: var(--text-placeholder);
}

.search-box button {
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.search-box button:hover {
  background: linear-gradient(135deg, #3390e9, #53a8ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 搜索按钮图标 */
.search-box button::before {
  content: '🔍';
  font-size: 16px;
}

/* 评论列表样式 */
.comment-list {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
  padding: 0;
}

.comment-list:hover {
  box-shadow: var(--shadow-base);
}

/* 评论项样式 */
.comment-item {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-left: 4px solid transparent;
  box-shadow: inset 0 0 0 0 var(--primary-color);
}

.comment-item:hover {
  background-color: #fafafa;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left-color: var(--primary-color);
}

.comment-item:last-child {
  border-bottom: none;
}

/* 评论头部样式 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: var(--transition-fast);
}

.username:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
  transform: scale(1.05);
}

.date {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.article-title {
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: var(--transition-fast);
}

.article-title:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
}

/* 评论内容样式 */
.comment-content {
  margin-bottom: 16px;
  line-height: 1.7;
  color: var(--text-regular);
  font-size: 14px;
  background-color: var(--card-bg);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.comment-item:hover .comment-content {
  box-shadow: var(--shadow-base);
  border-color: var(--primary-color);
}

/* 评论操作样式 */
.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.comment-actions button {
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: var(--danger-color);
  border: 1px solid rgba(245, 108, 108, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  min-width: 80px;
  justify-content: center;
}

.comment-actions button:hover {
  background: linear-gradient(135deg, var(--danger-color), #f78989);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

/* 删除按钮图标 */
.comment-actions button::before {
  content: '🗑️';
  font-size: 14px;
}

/* 加载状态样式 */
.loading {
  text-align: center;
  padding: 80px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  font-size: 16px;
  font-weight: 500;
}

.loading::before {
  content: '';
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误消息样式 */
.error-message {
  color: var(--danger-color);
  padding: 16px 20px;
  text-align: center;
  background: linear-gradient(135deg, #fef0f0, #fdf2f2);
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #fbc4c4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.error-message::before {
  content: '⚠';
  font-size: 18px;
  font-weight: bold;
}

/* 无评论样式 */
.no-comments {
  text-align: center;
  padding: 80px;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
  background-color: #fafafa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-management {
    padding: 16px;
  }

  .search-box {
    flex-direction: column;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-item {
    padding: 16px;
  }

  .comment-content {
    padding: 12px;
  }

  .comment-actions {
    justify-content: center;
    width: 100%;
    margin-top: 12px;
  }
}

@media (max-width: 576px) {
  .comment-header {
    font-size: 12px;
  }

  .comment-content {
    font-size: 13px;
  }

  .comment-actions button {
    padding: 6px 12px;
    font-size: 11px;
    min-width: 60px;
  }
}
</style>