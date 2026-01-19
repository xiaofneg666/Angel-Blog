<template>
  <div class="dashboard-management">
    <h1 class="page-title">仪表盘</h1>

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
/* 全局变量 */
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

body {
  background-color: var(--bg-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-regular);
}

.dashboard-management {
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

h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 统计卡片区域 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary-color), #66b1ff);
  border-radius: 12px 0 0 12px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-base);
}

.stat-card:nth-child(1)::before {
  background: linear-gradient(180deg, var(--primary-color), #66b1ff);
}

.stat-card:nth-child(2)::before {
  background: linear-gradient(180deg, var(--success-color), #85ce61);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(180deg, var(--warning-color), #ebb563);
}

.stat-card:nth-child(4)::before {
  background: linear-gradient(180deg, var(--danger-color), #f78989);
}

.stat-title {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.stat-desc {
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-increase {
  color: var(--success-color);
  font-weight: 500;
}

.stat-decrease {
  color: var(--danger-color);
  font-weight: 500;
}

/* 图表区域 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(580px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  padding: 24px;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-base);
}

.chart-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.chart-header h2 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
}

.chart-container {
  height: 320px;
  position: relative;
}

/* 最近活动区域 */
.recent-activity {
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  padding: 24px;
  border: 1px solid var(--border-light);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.recent-activity:hover {
  box-shadow: var(--shadow-base);
}

.recent-activity h2 {
  font-size: 16px;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.activity-list {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 8px;
}

/* 自定义滚动条 */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: var(--border-light);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: var(--text-placeholder);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.activity-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: var(--transition-fast);
}

.activity-item:hover {
  background-color: #fafafa;
  padding-left: 12px;
  border-radius: 8px;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item.empty {
  justify-content: center;
  color: var(--text-secondary);
  padding: 60px 0;
  font-size: 14px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  transition: var(--transition-fast);
}

.activity-icon.article {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  color: var(--primary-color);
}

.activity-icon.comment {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
  color: var(--success-color);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-user {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-size: 14px;
}

.activity-text {
  color: var(--text-regular);
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 1.6;
}

.activity-time {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--border-light);
  border: 2px solid var(--card-bg);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.activity-avatar:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-base);
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-light);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.error-message {
  background: linear-gradient(135deg, #fef0f0, #fdf2f2);
  color: var(--danger-color);
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #fbc4c4;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
}

.error-message::before {
  content: '⚠';
  font-size: 18px;
  font-weight: bold;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: var(--text-regular);
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-management {
    padding: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-card {
    padding: 16px;
  }
  
  .chart-container {
    height: 280px;
  }
  
  .recent-activity {
    padding: 16px;
  }
}
</style>