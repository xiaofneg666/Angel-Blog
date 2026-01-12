<template>
  <!-- 归档 -->
  <div class="archive-page">
    <NavBar></NavBar>
    <header>
      <h1>文章总览 - 45</h1>
    </header>

    <div class="article-list">
      <div class="article-item" v-for="(article, index) in articles" :key="index">
        <div class="article-date">{{ article.date }}</div>
        <div class="article-content">
          {{ article.content }}
          <div class="article-images" v-if="article.images">
            <img 
              v-for="(img, imgIndex) in article.images" 
              :key="imgIndex" 
              :src="img" 
              alt="文章图片"
              @click="openImage(img)"
            >
          </div>
        </div>
        <div class="article-checkbox">
          <input type="checkbox" :id="'article'+index" :checked="article.checked">
          <label :for="'article'+index"></label>
        </div>
      </div>
    </div>

    <div class="pagination">
      <div class="page-numbers">
        <span class="page-arrow">&lt;</span>
        <span class="page-number active">1</span>
        <span class="page-number">2</span>
        <span class="page-number">3</span>
        <span class="page-ellipsis">...</span>
        <span class="page-number">9</span>
        <span class="page-arrow">&gt;</span>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div class="image-modal" v-if="showModal" @click.self="closeModal">
      <div class="modal-content">
        <img :src="currentImage" alt="预览图片">
        <button class="close-btn" @click="closeModal">×</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import NavBar from "@/components/NavBar.vue";
</script>
<script>

export default {
  name: 'ArchivePage',
  data() {
    return {
      articles: [
        { 
          date: '2024-06-09', 
          content: '朝花夕拾', 
          checked: false,
          images: [
            'https://via.placeholder.com/150x100?text=示例图片1',
            'https://via.placeholder.com/150x100?text=示例图片2'
          ]
        },
        { 
          date: '2024-06-10', 
          content: '突然翻到了23年的日记，一片恍惚的岁月...', 
          checked: false,
          images: [
            'https://via.placeholder.com/150x100?text=日记照片'
          ]
        },
        { date: '2024-06-12', content: '2024-06-12', checked: false },
        { 
          date: '2024-06-24', 
          content: '网络安全(OSI-TCP/IP) 1', 
          checked: false,
          images: [
            'https://via.placeholder.com/150x100?text=网络拓扑图'
          ]
        },
        { 
          date: '2024-06-25', 
          content: 'Docker-CentOS基操', 
          checked: false,
          images: [
            'https://via.placeholder.com/150x100?text=Docker示例',
            'https://via.placeholder.com/150x100?text=CentOS界面'
          ]
        }
      ],
      showModal: false,
      currentImage: ''
    }
  },
  methods: {
    openImage(img) {
      this.currentImage = img;
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    closeModal() {
      this.showModal = false;
      document.body.style.overflow = '';
    }
  }
}
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

.article-list {
  margin-bottom: 20px;
}

.article-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 18px;
  margin-bottom: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.article-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.article-date {
  width: 100px;
  color: #7f8c8d;
  font-size: 14px;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
}

.article-content {
  flex-grow: 1;
  font-size: 15px;
  line-height: 1.5;
  color: #34495e;
  padding-right: 30px;
}

.article-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.article-images img {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.article-images img:hover {
  transform: scale(1.03);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.article-checkbox {
  position: absolute;
  right: 18px;
  top: 16px;
}

input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

input[type="checkbox"]:hover {
  border-color: #3498db;
}

input[type="checkbox"]:checked {
  background-color: #3498db;
  border-color: #3498db;
}

input[type="checkbox"]:checked::after {
  content: "✓";
  color: white;
  position: absolute;
  left: 4px;
  top: -1px;
  font-size: 14px;
}

.pagination {
  margin: 30px 0;
}

.page-numbers {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.page-number, .page-arrow, .page-ellipsis {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number {
  background-color: #f1f3f5;
  color: #495057;
}

.page-number:hover {
  background-color: #e9ecef;
}

.page-number.active {
  background-color: #3498db;
  color: white;
}

.page-arrow {
  background-color: transparent;
  color: #3498db;
  font-weight: bold;
}

.page-ellipsis {
  background-color: transparent;
  color: #adb5bd;
  cursor: default;
}

/* 图片预览模态框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 0 10px;
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
  
  .article-checkbox {
    position: static;
    margin-top: 10px;
    align-self: flex-end;
  }
  
  .article-images img {
    width: 100%;
    height: auto;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>