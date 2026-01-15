
<template>
  <div class="category-management">
    <h1>分类管理</h1>

    <!-- 搜索和操作栏 -->
    <div class="operation-bar">
      <div class="search-box">
        <input v-model="searchKeyword" placeholder="搜索分类名称..." />
        <button @click="handleSearch">搜索</button>
      </div>
      <button class="add-btn">+ 新增分类</button>
    </div>

    <!-- 分类列表 -->
    <div class="category-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="error" class="error-message">{{ error }}</div>

      <table class="category-table" v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>描述</th>
            <th>文章数量</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!-- 表格内容占位 -->
          <tr class="empty-row">
            <td colspan="7">暂无分类数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button class="page-btn" disabled>上一页</button>
      <span class="page-info">第 1 页 / 共 0 页</span>
      <button class="page-btn" disabled>下一页</button>
    </div>
  </div>
</template>

<script setup>
// 空脚本，仅保留样式实现
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

.category-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

/* 标题样式 */
h1 {
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

.search-box button,
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

.search-box button {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  margin-left: 8px;
}

.search-box button:hover {
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

/* 分类列表 */
.category-list {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
}

.category-list:hover {
  box-shadow: var(--shadow-base);
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.category-table th,
.category-table td {
  padding: 16px 20px;
  text-align: left;
}

.category-table th {
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

.category-table tbody tr {
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--border-light);
}

.category-table tbody tr:last-child {
  border-bottom: none;
}

.category-table tbody tr:hover {
  background-color: #fafafa;
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 0 var(--primary-color);
}

.category-table .empty-row td {
  text-align: center;
  padding: 80px;
  color: var(--text-secondary);
  background-color: #fafafa;
  font-size: 16px;
  font-weight: 500;
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

.status-active {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
  color: var(--success-color);
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.status-inactive {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: var(--danger-color);
  border: 1px solid rgba(245, 108, 108, 0.2);
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

/* 加载状态 */
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
.search-box button::before {
  content: '🔍';
  font-size: 16px;
}

.add-btn::before {
  content: '➕';
  font-size: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    flex: none;
  }

  .category-table {
    font-size: 12px;
  }

  .category-table th,
  .category-table td {
    padding: 12px 8px;
  }

  .category-table th:nth-child(5),
  .category-table td:nth-child(5) {
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
  .category-management {
    padding: 16px;
  }

  .operation-bar {
    padding: 16px;
  }

  .category-table th:nth-child(4),
  .category-table td:nth-child(4) {
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