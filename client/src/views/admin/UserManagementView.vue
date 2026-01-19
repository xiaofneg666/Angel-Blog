<!--
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-06-17 10:14:12
 * @LastEditors: 11 1547163442@qq.com
 * @LastEditTime: 2025-06-18 15:36:28
 * @FilePath: \blog-project\client\src\views\admin\UserManagementView.vue
 * @Description: 用户管理页面，包含用户列表展示、搜索和删除功能
-->

<template>
  <div class="user-management">
    <div class="header">
      <h1 class="page-title">用户管理</h1>
      <div class="filters">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          clearable
          @clear="fetchUsers"
          @keyup.enter="fetchUsers"
        >
          <template #append>
            <el-button @click="fetchUsers">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-select v-model="selectedRole" placeholder="角色" @change="fetchUsers">
          <el-option label="全部" value="all" />
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
        </el-select>

        <el-select v-model="selectedStatus" placeholder="状态" @change="fetchUsers">
          <el-option label="全部" value="all" />
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="users"
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :size="40" :src="getAvatarUrl(row.avatar)">
            {{ row.username.charAt(0).toUpperCase() }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            :type="row.status === 'active' ? 'warning' : 'success'"
            size="small"
            @click="handleStatusChange(row.id, row.status === 'active' ? 'inactive' : 'active')"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchUsers"
        @current-change="fetchUsers"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const loading = ref(false);
const users = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const selectedRole = ref('all');
const selectedStatus = ref('all');

// 处理头像URL，确保能正确访问
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return '/api/head/R.jpg'; // 默认头像
  }
  
  // 如果头像路径以/开头，添加/api前缀
  if (avatar.startsWith('/')) {
    return `/api${avatar}`;
  }
  
  // 如果已经是完整URL，直接返回
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // 其他情况，默认添加/api/head/前缀
  return `/api/head/${avatar}`;
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/admin/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value,
        role: selectedRole.value,
        status: selectedStatus.value
      }
    });
    users.value = response.data.users;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
      type: 'warning'
    });
    await axios.delete(`/api/admin/users/${userId}`);
    ElMessage.success('删除成功');
    fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
    }
  }
};

const handleStatusChange = async (userId, newStatus) => {
  try {
    await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus });
    ElMessage.success('状态更新成功');
    fetchUsers();
  } catch (error) {
    console.error('更新用户状态失败:', error);
    ElMessage.error('更新用户状态失败');
  }
};

onMounted(() => {
  fetchUsers();
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

/* 用户管理容器 */
.user-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

/* 头部样式 */
.header {
  margin-bottom: 24px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-light);
}

/* 筛选区域样式 */
.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  flex-wrap: wrap;
}

.filters .el-input {
  width: 320px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: var(--transition-base);
}

.filters .el-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-base);
}

.filters .el-select {
  min-width: 150px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: var(--transition-base);
}

.filters .el-select:focus-within {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-base);
}

/* Element Plus 组件样式穿透 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  transition: var(--transition-base);
}

:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-select__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  transition: var(--transition-base);
}

:deep(.el-select__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 表格样式 */
:deep(.el-table) {
  margin-top: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  background-color: var(--card-bg);
  transition: var(--transition-base);
}

:deep(.el-table:hover) {
  box-shadow: var(--shadow-base);
}

:deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, var(--border-light), #f8f9fa);
}

:deep(.el-table__header-wrapper th) {
  background-color: transparent !important;
  font-weight: 600;
  color: var(--text-primary);
  padding: 16px 20px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.el-table__body-wrapper td) {
  padding: 16px 20px !important;
  border-bottom: 1px solid var(--border-light);
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: #fafafa !important;
}

:deep(.el-table__body-wrapper tr:last-child td) {
  border-bottom: none;
}

/* 按钮样式 */
:deep(.el-button) {
  border-radius: 6px;
  transition: var(--transition-base);
  font-weight: 500;
  padding: 8px 16px;
}

:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
  color: var(--warning-color);
  border-color: rgba(230, 162, 60, 0.2);
}

:deep(.el-button--warning:hover) {
  background: linear-gradient(135deg, var(--warning-color), #ebb563);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
  color: var(--success-color);
  border-color: rgba(103, 194, 58, 0.2);
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, var(--success-color), #85ce61);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: var(--danger-color);
  border-color: rgba(245, 108, 108, 0.2);
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, var(--danger-color), #f78989);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 16px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: var(--transition-fast);
}

:deep(.el-tag:hover) {
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

/* 分页样式 */
.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

:deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-pagination__sizes),
:deep(.el-pagination__jump) {
  border-radius: 6px;
  border: 1px solid var(--border-light);
  padding: 6px 12px;
  background-color: var(--card-bg);
}

:deep(.el-pager li) {
  border-radius: 6px;
  transition: var(--transition-fast);
  margin: 0 4px;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-pager li:hover) {
  color: var(--primary-color);
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-pager li.active) {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  box-shadow: var(--shadow-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 16px;
  }
  
  .header .page-title {
    font-size: 20px;
  }
  
  :deep(.el-table__header-wrapper th),
  :deep(.el-table__body-wrapper td) {
    padding: 12px 8px !important;
    font-size: 12px;
  }
  
  :deep(.el-button--small) {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .pagination {
    justify-content: center;
  }
  
  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>