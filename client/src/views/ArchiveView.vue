<template>
  <!-- 归档 -->
  <div class="archive-page">
    <NavBar></NavBar>
    <header>
      <h1>文章总览 - {{ total }}</h1>
    </header>

    <div class="archive-container" v-if="archiveData.length > 0">
      <!-- 按月分组的文章列表 -->
      <div v-for="(monthData, monthIndex) in archiveData" :key="monthIndex" class="archive-month-group">
        <div class="month-header">
          <h3>{{ monthData.yearMonthLabel }} <span class="article-count">({{ monthData.count }})</span></h3>
        </div>
        <div class="month-articles">
          <div class="article-item" v-for="(article) in monthData.articles" :key="article.id">
            <div class="article-date">{{ article.date }}</div>
            <div class="article-content">
              <router-link :to="'/posts/' + article.id" class="article-title">{{ article.title }}</router-link>
              <div class="article-meta" v-if="article.category_name || article.view_count">
                <span class="category" v-if="article.category_name">{{ article.category_name }}</span>
                <span class="view-count" v-if="article.view_count">阅读 {{ article.view_count }}</span>
              </div>
              <!-- 文章封面 -->
              <div class="article-cover" v-if="article.cover_image">
                <img :src="article.cover_image" alt="文章封面">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div class="loading" v-if="loading">
      <div class="loading-spinner"></div>
      <p>正在加载归档数据...</p>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!loading && archiveData.length === 0">
      <p>暂无文章归档</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from "@/components/NavBar.vue";
import { getArticleArchive } from "@/api/article.js";

const router = useRouter();

// 响应式数据
const articles = ref([]);
const archiveData = ref([]);
const total = ref(0);
const loading = ref(false);

// 生命周期钩子 - 组件挂载时获取数据
onMounted(() => {
  fetchArchiveData();
});

// 格式化文章封面URL
const formatCoverImage = (coverImage) => {
  if (!coverImage) return '/1.jpg';
  
  // 处理封面图片URL，确保能正确访问
  if (coverImage.startsWith('http')) {
    return coverImage;
  } else if (coverImage.startsWith('/api/')) {
    return coverImage;
  } else if (coverImage.startsWith('/uploads/')) {
    return `/api${coverImage}`;
  } else {
    return `/api/uploads/${coverImage}`;
  }
};

// 获取归档数据
const fetchArchiveData = async () => {
  loading.value = true;
  try {
    const response = await getArticleArchive();
    if (response.success) {
      // 处理返回的归档数据，格式化封面图片URL
      const processedArchive = response.data.archive.map(monthData => {
        return {
          ...monthData,
          articles: monthData.articles.map(article => ({
            ...article,
            cover_image: formatCoverImage(article.cover_image)
          }))
        };
      });
      
      archiveData.value = processedArchive;
      total.value = response.data.total;
    }
  } catch (error) {
    console.error('获取归档数据失败:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.archive-page {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 25px 20px 15px;
  color: #333;
  background-color: #f8f9fa;
  min-height: 100vh;
}

header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 25px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #eaecef;
}

/* 归档容器 */
.archive-container {
  margin-bottom: 30px;
}

/* 月份分组 */
.archive-month-group {
  margin-bottom: 30px;
}

/* 月份标题 */
.month-header {
  margin-bottom: 15px;
}

.month-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.article-count {
  font-size: 14px;
  font-weight: normal;
  color: #7f8c8d;
}

/* 月份文章列表 */
.month-articles {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* 文章项 */
.article-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 18px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover {
  background-color: #fafafa;
}

.article-date {
  width: 100px;
  color: #7f8c8d;
  font-size: 14px;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
  padding-top: 2px;
}

.article-content {
  flex-grow: 1;
  padding-right: 10px;
}

.article-title {
  font-size: 15px;
  line-height: 1.6;
  color: #34495e;
  text-decoration: none;
  transition: color 0.2s;
  display: block;
  margin-bottom: 5px;
}

.article-title:hover {
  color: #3498db;
}

.article-meta {
  font-size: 12px;
  color: #95a5a6;
  display: flex;
  gap: 15px;
  align-items: center;
}

.article-meta .category {
  background-color: #ecf0f1;
  padding: 2px 8px;
  border-radius: 10px;
  color: #7f8c8d;
}

.article-meta .view-count {
  color: #95a5a6;
}

/* 文章封面 */
.article-cover {
  margin-top: 10px;
}

.article-cover img {
  width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 50px 0;
  color: #7f8c8d;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .archive-page {
    padding: 15px 10px;
  }
  
  .article-item {
    padding: 14px 12px;
    flex-direction: column;
  }
  
  .article-date {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .month-header h3 {
    font-size: 16px;
  }
  
  .article-title {
    font-size: 14px;
  }
}
</style>