<template>
  <div class="dashboard-container">
    <h1>仪表盘</h1>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">数据加载中...</div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-title">文章总数</div>
        <div class="stat-value">{{ stats.articles?.total || 0 }}</div>
        <div class="stat-desc">
          较昨日 
          <span :class="stats.articles?.today > 0 ? 'stat-increase' : 'stat-decrease'">
            {{ stats.articles?.today > 0 ? '+' : '' }}{{ stats.articles?.today || 0 }}
          </span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">用户总数</div>
        <div class="stat-value">{{ stats.users?.total || 0 }}</div>
        <div class="stat-desc">
          较昨日 
          <span :class="stats.users?.today > 0 ? 'stat-increase' : 'stat-decrease'">
            {{ stats.users?.today > 0 ? '+' : '' }}{{ stats.users?.today || 0 }}
          </span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">评论总数</div>
        <div class="stat-value">{{ stats.comments?.total || 0 }}</div>
        <div class="stat-desc">
          较昨日 
          <span :class="stats.comments?.today > 0 ? 'stat-increase' : 'stat-decrease'">
            {{ stats.comments?.today > 0 ? '+' : '' }}{{ stats.comments?.today || 0 }}
          </span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">访问总量</div>
        <div class="stat-value">{{ stats.visits?.total || 0 }}</div>
        <div class="stat-desc">
          较昨日 
          <span :class="stats.visits?.today > 0 ? 'stat-increase' : 'stat-decrease'">
            {{ stats.visits?.today > 0 ? '+' : '' }}{{ stats.visits?.today || 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <div class="chart-card">
        <div class="chart-header">
          <h2>访问趋势</h2>
        </div>
        <div ref="visitsChartRef" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h2>文章分类分布</h2>
        </div>
        <div ref="categoryChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 最近活动区域 -->
    <div class="recent-activity">
      <h2>最近活动</h2>
      <div class="activity-list">
        <div v-if="loading" class="activity-item empty">加载中...</div>
        <div v-else-if="activities.length === 0" class="activity-item empty">暂无活动数据</div>
        <div v-else v-for="activity in activities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <img v-if="activity.avatar" :src="getAvatarPath(activity.avatar)" :alt="activity.user" class="activity-avatar" @error="handleAvatarError">
            <i v-else :class="activity.type === 'article' ? 'icon-article' : 'icon-comment'"></i>
          </div>
          <div class="activity-content">
            <div class="activity-user">{{ activity.user }}</div>
            <div class="activity-text">{{ activity.content }}</div>
            <div class="activity-time">{{ formatDate(activity.time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { init as initECharts } from 'echarts';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const loading = ref(true);
const error = ref(null);
const refreshInterval = ref(null);
const stats = ref({});
const activities = ref([]);
const visitsChartRef = ref(null);
const categoryChartRef = ref(null);
let visitsChart = null;
let categoryChart = null;

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 获取统计数据
async function fetchStats() {
  try {
    console.log('获取统计数据，token:', authStore.token);
    const response = await fetch('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });

    // 检查 HTTP 响应状态
    if (!response.ok) {
      throw new Error(`请求失败 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    console.log('统计数据响应:', data);

    if (data.success) {
      stats.value = {
        articles: {
          total: data.data.articleCount || 0,
          today: data.data.articleToday || 0 // 预留后端今日数据字段
        },
        users: {
          total: data.data.users || 0,
          today: data.data.usersToday || 0 // 预留后端今日数据字段
        },
        comments: {
          total: data.data.commentCount || 0,
          today: data.data.commentToday || 0 // 预留后端今日数据字段
        },
        visits: {
          total: data.data.visitCount || 0,
          today: data.data.visitToday || 0 // 预留后端今日数据字段
        }
      };
    } else {
      // 显示后端返回的错误信息
      error.value = data.message || '获取统计数据失败: 后端处理错误';
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // 根据错误类型显示不同提示
    if (error.message.includes('401')) {
      error.value = '身份验证失败，请重新登录';
    } else if (error.message.includes('NetworkError')) {
      error.value = '网络连接失败，请检查网络设置';
    } else {
      error.value = `获取统计数据失败: ${error.message}`;
    }
  }
}

// 获取访问趋势数据
async function fetchVisitsTrend() {
  try {
    console.log('获取访问趋势，token:', authStore.token);
    const response = await fetch('/api/dashboard/visits-trend', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    console.log('访问趋势响应:', data);
    if (data.success && visitsChart) {
      const dates = data.data.map(item => item.date);
      const counts = data.data.map(item => item.count);
      
      visitsChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: dates
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: counts,
          type: 'line',
          smooth: true,
          areaStyle: {}
        }]
      });
    }
  } catch (error) {
    console.error('获取访问趋势数据失败:', error);
  }
}

// 获取分类分布数据
async function fetchCategoryDistribution() {
  try {
    console.log('获取分类分布，token:', authStore.token);
    const response = await fetch('/api/dashboard/category-distribution', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    console.log('分类分布响应:', data);
    if (data.success && categoryChart) {
      const categories = data.data.map(item => item.category);
      const counts = data.data.map(item => item.count);
      
      categoryChart.setOption({
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: '70%',
          data: categories.map((category, index) => ({
            name: category,
            value: counts[index]
          }))
        }]
      });
    }
  } catch (error) {
    console.error('获取分类分布数据失败:', error);
  }
}

// 获取最近活动
async function fetchRecentActivities() {
  try {
    console.log('获取最近活动，token:', authStore.token);
    const response = await fetch('/api/dashboard/recent-activities', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    const data = await response.json();
    console.log('最近活动响应:', data);
    if (data.success) {
      activities.value = data.data.map(activity => ({
        ...activity,
        // 处理头像路径
        avatar: activity.avatar ? `/uploads/${activity.avatar}` : '/default-avatar.png'
      }));
    }
  } catch (error) {
    console.error('获取最近活动失败:', error);
    error.value = '获取最近活动失败，请稍后重试';
  }
}

// 初始化图表
function initCharts() {
  try {
    if (visitsChartRef.value) {
      visitsChart = initECharts(visitsChartRef.value);
    }
    if (categoryChartRef.value) {
      categoryChart = initECharts(categoryChartRef.value);
    }
  } catch (err) {
    console.error('图表初始化失败:', err);
    error.value = '图表初始化失败，请刷新页面重试';
  }
}

// 加载所有数据
async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    await Promise.all([
      fetchStats(),
      fetchVisitsTrend(),
      fetchCategoryDistribution(),
      fetchRecentActivities()
    ]);
  } catch (err) {
    console.error('数据加载失败:', err);
    error.value = '数据加载失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

// 设置自动刷新
function setupAutoRefresh() {
  // 每5分钟刷新一次数据
  refreshInterval.value = setInterval(loadData, 5 * 60 * 1000);
}

// 监听窗口大小变化
function handleResize() {
  visitsChart?.resize();
  categoryChart?.resize();
}

// 处理头像路径
function getAvatarPath(avatar) {
  if (!avatar) return '/2222.jpg';
  if (avatar.startsWith('/uploads/')) {
    return avatar;
  }
  if (avatar === '/2222.jpg') {
    return '/2222.jpg';
  }
  return `/uploads/${avatar}`;
}

// 处理头像加载错误
function handleAvatarError(e) {
  e.target.src = '/2222.jpg';
}

onMounted(() => {
  initCharts();
  loadData();
  setupAutoRefresh();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
  visitsChart?.dispose();
  categoryChart?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.stat-increase {
  color: #67c23a;
}

.stat-decrease {
  color: #f56c6c;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 20px;
}

.chart-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h2 {
  font-size: 16px;
  color: #303133;
  margin: 0;
}

.chart-container {
  height: 300px;
}

.recent-activity {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 20px;
}

.recent-activity h2 {
  font-size: 16px;
  color: #303133;
  margin-top: 0;
  margin-bottom: 20px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item.empty {
  justify-content: center;
  color: #909399;
  padding: 40px 0;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.article {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.activity-icon.comment {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-user {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-text {
  color: #606266;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.activity-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f5f5f5;
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 12px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  color: #606266;
  font-size: 14px;
}
</style>