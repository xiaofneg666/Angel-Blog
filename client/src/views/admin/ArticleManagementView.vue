<template>
  <div class="article-management">
    <h1 class="page-title">文章管理</h1>

    <!-- 搜索和操作栏 -->
    <div class="operation-bar">
      <div class="search-box">
        <div class="search-icon"><i class="icon-search"></i></div>
        <input v-model="searchKeyword" placeholder="搜索文章标题或内容..." @keyup.enter="handleSearch" />
        <button @click="handleSearch" class="search-btn">搜索</button>
      </div>
      <button class="add-btn" @click="$router.push('/admin/articles/new')">
        <i class="icon-plus"></i> 新增文章
      </button>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="table-container" v-else>
        <table class="article-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>作者</th>
              <th>发布日期</th>
              <th>状态</th>
              <th>阅读量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="articles.length > 0">
              <tr v-for="article in articles" :key="article.id">
                <td>{{ article.id }}</td>
                <td>{{ article.title }}</td>
                <td>{{ article.author || '未知' }}</td>
                <td>{{ formatDate(article.publish_time) }}</td>
                <td>
                  <span :class="['status-tag', getStatusClass(article.status)]">
                    {{ getStatusText(article.status) }}
                  </span>
                </td>
                <td>{{ article.view_count }}</td>
                <td>
                  <button class="action-btn edit-btn" @click="$router.push(`/admin/articles/edit/${article.id}`)">
                    <i class="icon-edit"></i> 编辑
                  </button>
                  <button class="action-btn delete-btn" @click="handleDelete(article.id)">
                    <i class="icon-delete"></i> 删除
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else class="empty-row">
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-icon"><i class="icon-file-text"></i></div>
                  <p>暂无文章数据</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button 
        class="page-btn prev-btn" 
        :disabled="currentPage === 1"
        @click="currentPage--; fetchArticles()"
      >
        <i class="icon-chevron-left"></i> 上一页
      </button>
      <div class="page-info">
        <span>第 {{ currentPage }} 页</span>
        <span class="separator">/</span>
        <span>共 {{ totalPages }} 页</span>
      </div>
      <button 
        class="page-btn next-btn" 
        :disabled="currentPage === totalPages"
        @click="currentPage++; fetchArticles()"
      >
        下一页 <i class="icon-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { deletePost } from '../../api/posts'

const loading = ref(false)
const error = ref('')
const articles = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const totalPages = ref(3) // 假设3页
const pageSize = 10

const fetchArticles = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/articles/admin`, {
      params: {
        page: currentPage.value,
        pageSize: pageSize,
        keyword: searchKeyword.value
      }
    });
    articles.value = response.data.articles;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    error.value = '获取文章列表失败';
  } finally {
    loading.value = false;
  }
};

// 随机生成模拟文章数据
const generateMockArticles = () => {
  const statusArr = ['published', 'draft', 'pending']
  const mock = []
  for (let i = 1; i <= pageSize; i++) {
    mock.push({
      id: (currentPage.value - 1) * pageSize + i,
      title: `测试文章标题 ${Math.floor(Math.random() * 1000)}`,
      author: { username: `作者${Math.ceil(Math.random() * 5)}` },
      publish_time: new Date(Date.now() - Math.random() * 100000000).toISOString(),
      status: statusArr[Math.floor(Math.random() * statusArr.length)],
      view_count: Math.floor(Math.random() * 1000)
    })
  }
  articles.value = mock
}

// 搜索文章
const handleSearch = () => {
  currentPage.value = 1
  generateMockArticles()
}

// 删除文章
const handleDelete = async (id) => {
  if (!confirm('确定要删除这篇文章吗？')) return
  try {
    await deletePost(id)
    articles.value = articles.value.filter(a => a.id !== id)
    alert('文章删除成功')
  } catch (error) {
    console.error('删除文章失败:', error)
    alert('删除文章失败: ' + (error.message || '未知错误'))
  }
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签样式
const getStatusClass = (status) => {
  switch (status) {
    case 'published':
      return 'status-published'
    case 'draft':
      return 'status-draft'
    case 'pending':
      return 'status-pending'
    default:
      return ''
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'pending':
      return '待审核'
    default:
      return status
  }
}

// 页面加载时生成模拟数据
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
/* 基础样式变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --light-color: #f5f7fa;
  --dark-color: #303133;
  --border-color: #e4e7ed;
  --shadow-color: rgba(0, 0, 0, 0.05);
  --transition-speed: 0.3s;
}

.article-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 60px);
}

.page-title {
  margin-bottom: 24px;
  color: var(--dark-color);
  font-size: 20px;
  font-weight: 500;
  position: relative;
  padding-bottom: 12px;
}

.page-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
  flex-wrap: wrap;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  flex: 0 1 500px;
  position: relative;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--shadow-color);
  overflow: hidden;
  transition: box-shadow var(--transition-speed);
}

.search-box:focus-within {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-icon {
  padding: 0 12px;
  color: var(--info-color);
  font-size: 16px;
}

.search-box input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--dark-color);
}

.search-box input::placeholder {
  color: var(--info-color);
}

.search-btn,
.add-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-speed);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.search-btn {
  background-color: var(--primary-color);
  color: white;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.search-btn:hover {
  background-color: #3390e9;
}

.add-btn {
  background-color: var(--success-color);
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.add-btn:hover {
  background-color: #5daf34;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

/* 表格容器 */
.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px var(--shadow-color);
  overflow: hidden;
  transition: box-shadow var(--transition-speed);
}

.table-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.article-table {
  width: 100%;
  border-collapse: collapse;
}

.article-table th,
.article-table td {
  padding: 14px 16px;
  text-align: left;
}

.article-table th {
  background-color: var(--light-color);
  font-weight: 500;
  color: var(--dark-color);
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.article-table tbody tr {
  transition: background-color var(--transition-speed);
  border-bottom: 1px solid var(--border-color);
}

.article-table tbody tr:last-child {
  border-bottom: none;
}

.article-table tbody tr:hover {
  background-color: #f7faff;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-published {
  background-color: rgba(103, 194, 58, 0.1);
  color: var(--success-color);
}

.status-draft {
  background-color: rgba(230, 162, 60, 0.1);
  color: var(--warning-color);
}

.status-pending {
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
}

/* 操作按钮 */
.action-btn {
  padding: 5px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
}

.edit-btn:hover {
  background-color: rgba(64, 158, 255, 0.2);
}

.delete-btn {
  background-color: rgba(245, 108, 108, 0.1);
  color: var(--danger-color);
}

.delete-btn:hover {
  background-color: rgba(245, 108, 108, 0.2);
}

/* 空状态样式 */
.empty-row td {
  padding: 60px 0;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--info-color);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--info-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(64, 158, 255, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误消息 */
.error-message {
  color: var(--danger-color);
  padding: 12px;
  text-align: center;
  background-color: #fef0f0;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #fde2e2;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 16px;
  color: var(--info-color);
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-speed);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.page-btn:not(:disabled):hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: #f5faff;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #c0c4cc;
  background-color: var(--light-color);
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  color: var(--border-color);
}

/* 图标样式占位 */
.icon-search::before { content: '🔍'; }
.icon-plus::before { content: '➕'; }
.icon-file-text::before { content: '📄'; }
.icon-chevron-left::before { content: '◀'; }
.icon-chevron-right::before { content: '▶'; }
.icon-edit::before { content: '✏️'; }
.icon-delete::before { content: '🗑️'; }

/* 响应式调整 */
@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    flex: none;
  }

  .article-table th:nth-child(4),
  .article-table td:nth-child(4) {
    display: none;
  }

  .page-btn {
    padding: 6px 12px;
  }
}

@media (max-width: 576px) {
  .article-management {
    padding: 12px;
  }

  .article-table th:nth-child(3),
  .article-table td:nth-child(3) {
    display: none;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>