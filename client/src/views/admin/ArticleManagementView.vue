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
/* 全局变量 - 与Dashboard保持一致 */
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

.article-management {
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

/* 操作栏样式 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.search-box {
  display: flex;
  align-items: center;
  flex: 0 1 500px;
  position: relative;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
}

.search-box:focus-within {
  box-shadow: var(--shadow-base);
  border-color: var(--primary-color);
}

.search-icon {
  padding: 0 16px;
  color: var(--text-secondary);
  font-size: 16px;
  transition: var(--transition-fast);
}

.search-box:focus-within .search-icon {
  color: var(--primary-color);
}

.search-box input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
  background-color: transparent;
}

.search-box input::placeholder {
  color: var(--text-placeholder);
}

.search-btn,
.add-btn {
  padding: 12px 20px;
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
}

.search-btn {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.search-btn:hover {
  background: linear-gradient(135deg, #3390e9, #53a8ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.add-btn {
  background: linear-gradient(135deg, var(--success-color), #85ce61);
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.add-btn:hover {
  background: linear-gradient(135deg, #5daf34, #79c466);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

/* 表格容器 */
.table-container {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
}

.table-container:hover {
  box-shadow: var(--shadow-base);
}

.article-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.article-table th,
.article-table td {
  padding: 16px 20px;
  text-align: left;
}

.article-table th {
  background: linear-gradient(135deg, var(--border-light), #f8f9fa);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid var(--border-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.article-table tbody tr {
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--border-light);
}

.article-table tbody tr:last-child {
  border-bottom: none;
}

.article-table tbody tr:hover {
  background-color: #fafafa;
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 0 var(--primary-color);
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-published {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
  color: var(--success-color);
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.status-published:hover {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.2), rgba(103, 194, 58, 0.1));
  transform: scale(1.05);
}

.status-draft {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
  color: var(--warning-color);
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.status-draft:hover {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.2), rgba(230, 162, 60, 0.1));
  transform: scale(1.05);
}

.status-pending {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  color: var(--primary-color);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.status-pending:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
  transform: scale(1.05);
}

/* 操作按钮 */
.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-right: 8px;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  min-width: 60px;
  justify-content: center;
}

.edit-btn {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  color: var(--primary-color);
  border-color: rgba(64, 158, 255, 0.2);
}

.edit-btn:hover {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: var(--danger-color);
  border-color: rgba(245, 108, 108, 0.2);
}

.delete-btn:hover {
  background: linear-gradient(135deg, var(--danger-color), #f78989);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

/* 空状态样式 */
.empty-row td {
  padding: 80px 0;
  text-align: center;
  background-color: #fafafa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  transition: var(--transition-base);
}

.empty-state:hover .empty-icon {
  transform: scale(1.1) rotate(5deg);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
  transition: var(--transition-base);
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 80px 0;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transition: var(--transition-fast);
}

.loading:hover .spinner {
  transform: scale(1.2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误消息 */
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

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 12px;
  color: var(--text-secondary);
  padding: 20px;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.page-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--card-bg), #fafafa);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-regular);
  min-width: 80px;
  justify-content: center;
}

.page-btn:not(:disabled):hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: linear-gradient(135deg, #f5faff, #e6f7ff);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.page-btn:disabled {
  cursor: not-allowed;
  color: var(--text-placeholder);
  background: linear-gradient(135deg, var(--border-light), #f8f9fa);
  border-color: var(--border-light);
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.separator {
  color: var(--border-color);
  font-weight: normal;
}

/* 图标样式 */
.icon-search::before { content: '🔍'; font-size: 16px; }
.icon-plus::before { content: '➕'; font-size: 16px; }
.icon-file-text::before { content: '📄'; font-size: 48px; }
.icon-chevron-left::before { content: '◀'; font-size: 16px; }
.icon-chevron-right::before { content: '▶'; font-size: 16px; }
.icon-edit::before { content: '✏️'; font-size: 14px; }
.icon-delete::before { content: '🗑️'; font-size: 14px; }

/* 响应式调整 */
@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    flex: none;
  }

  .article-table {
    font-size: 12px;
  }

  .article-table th,
  .article-table td {
    padding: 12px 8px;
  }

  .article-table th:nth-child(4),
  .article-table td:nth-child(4) {
    display: none;
  }

  .page-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 11px;
    margin-right: 4px;
  }
}

@media (max-width: 576px) {
  .article-management {
    padding: 16px;
  }

  .operation-bar {
    padding: 16px;
  }

  .article-table th:nth-child(3),
  .article-table td:nth-child(3) {
    display: none;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 10px;
    min-width: 40px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }

  .page-info {
    order: -1;
    width: 100%;
    justify-content: center;
  }
}
</style>