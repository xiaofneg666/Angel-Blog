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
      <h2>用户管理</h2>
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
          <el-avatar :size="40" :src="row.avatar">
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

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/users/admin', {
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
    await axios.delete(`/api/users/admin/${userId}`);
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
    await axios.put(`/api/users/admin/${userId}/status`, { status: newStatus });
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
.user-management {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.filters .el-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  margin-top: 20px;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light);
}
</style>