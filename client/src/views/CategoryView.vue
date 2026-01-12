<!-- 分类 -->
<template>
  <div class="category-container">
    <h1 class="category-header">文章分类统计</h1>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="category-stats">
      <div class="category-chart">
        <div class="chart-row" v-for="(category, index) in categories" :key="index">
          <div class="category-name" :style="{color: getCategoryColor(index)}">
            {{ category.name }}
          </div>
          <div class="chart-bar-container">
            <div 
              class="chart-bar" 
              :style="{width: calculateBarWidth(category.count), backgroundColor: getCategoryColor(index)}"
            ></div>
            <span class="count-badge">{{ category.count }}</span>
          </div>
        </div>
      </div>
      
      <div class="category-tags">
        <div 
          class="tag" 
          v-for="(category, index) in categories" 
          :key="'tag'+index"
          :style="{backgroundColor: getCategoryColor(index)}"
        >
          {{ category.name }} ({{ category.count }})
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const response = await axios.get('/api/articles/categories/stats');
      if (response.data.success) {
        this.categories = response.data.data;
      } else {
        this.error = '获取分类数据失败';
      }
    } catch (error) {
      console.error('获取分类数据失败:', error);
      this.error = '获取分类数据失败，请稍后重试';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    calculateBarWidth(count) {
      const maxCount = Math.max(...this.categories.map(c => c.count));
      return maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%';
    },
    getCategoryColor(index) {
      const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#34495e', '#7f8c8d', '#27ae60',
        '#8e44ad', '#c0392b'
      ];
      return colors[index % colors.length];
    }
  }
}
</script>

<style scoped>
.category-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.category-header {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
}

.category-stats {
  display: flex;
  gap: 30px;
}

.category-chart {
  flex: 2;
}

.chart-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.category-name {
  width: 150px;
  font-weight: bold;
  text-align: right;
  padding-right: 15px;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.chart-bar {
  height: 20px;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.count-badge {
  margin-left: 10px;
  background-color: #ecf0f1;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #7f8c8d;
}

.category-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 10px;
}

.tag {
  padding: 6px 12px;
  border-radius: 15px;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.tag:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .category-stats {
    flex-direction: column;
  }
  
  .category-tags {
    margin-top: 20px;
    justify-content: center;
  }
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #666;
}

.error {
  color: #e74c3c;
}
</style>

