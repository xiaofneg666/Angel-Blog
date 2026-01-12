
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
.category-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.search-box {
  display: flex;
  gap: 10px;
  flex: 0 1 500px;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-box button,
.add-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-box button {
  background-color: #409eff;
  color: white;
}

.add-btn {
  background-color: #67c23a;
  color: white;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.category-table th,
.category-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.category-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
}

.category-table .empty-row td {
  text-align: center;
  padding: 40px;
  color: #909399;
  background-color: #fafafa;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
  color: #606266;
}

.page-btn {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #c0c4cc;
  background-color: #f5f7fa;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #606266;
}

.error-message {
  color: #f56c6c;
  padding: 10px;
  text-align: center;
  background-color: #fef0f0;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>