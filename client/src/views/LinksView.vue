<template>
  <div class="friend-links-container">
    <NavBar />
    <header class="page-header">
      <h2>友情链接</h2>
      <p class="subtitle">与优秀的人同行，走得更远</p>
    </header>

    <div class="links-grid">
      <!-- 使用v-for循环渲染友链 -->
      <a 
        v-for="link in friendLinks" 
        :key="link.name" 
        :href="link.url" 
        class="link-card" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <div class="link-logo">
          <img :src="link.logo" :alt="link.name" />
        </div>
        <div class="link-info">
          <div class="link-header">
            <h3>{{ link.name }}</h3>
            <span class="link-tag">{{ link.category }}</span>
          </div>
          <p class="link-desc">{{ link.description }}</p>
          <div class="link-stats">
            <span v-if="link.articles" class="stat-item">
              <i class="iconfont icon-article"></i> {{ link.articles }} 文章
            </span>
            <span v-if="link.followers" class="stat-item">
              <i class="iconfont icon-user"></i> {{ link.followers }} 关注者
            </span>
          </div>
        </div>
        <div class="link-action">
          <span>访问</span>
          <i class="iconfont icon-arrow-right"></i>
        </div>
      </a>

      <!-- 空卡片作为添加新友链的入口 -->
      <div class="link-card add-new">
        <div class="add-icon">+</div>
        <p>申请友链</p>
      </div>
    </div>

    <div class="friend-links-footer">
      <h3>友链申请说明</h3>
      <p>欢迎技术类、学习类博客申请友链，请确保您的网站内容健康积极。</p>
      <p>申请格式：网站名称 | 网站地址 | 描述 | 图标(可选)</p>
    </div>
  </div>
</template>

<script setup>
/* -------------------- 1. 引用 -------------------- */
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'

// 友链数据
const friendLinks = ref([
  // 中文技术博客
  {
    name: '阮一峰的网络日志',
    url: 'https://www.ruanyifeng.com/blog/',
    logo: 'https://www.ruanyifeng.com/blog/favicon.ico',
    category: '中文技术博客',
    description: '记录每周值得分享的科技内容，涵盖前端、后端、人工智能等多个领域',
    articles: '2200+',
    followers: '100万+'
  },
  {
    name: '张鑫旭的博客',
    url: 'https://www.zhangxinxu.com/',
    logo: 'https://www.zhangxinxu.com/favicon.ico',
    category: '中文技术博客',
    description: 'CSS专家，分享CSS、JavaScript、HTML等前端技术文章',
    articles: '1500+',
    followers: '50万+'
  },
  {
    name: '廖雪峰的官方网站',
    url: 'https://www.liaoxuefeng.com/',
    logo: 'https://www.liaoxuefeng.com/favicon.ico',
    category: '中文技术博客',
    description: '提供Python、Java、Git等编程技术的入门教程和进阶知识',
    articles: '800+',
    followers: '80万+'
  },
  
  // 设计资源
  {
    name: 'Dribbble',
    url: 'https://dribbble.com/',
    logo: 'https://dribbble.com/assets/favicon-512x512-23d9422e059c8eebd7580526b823d1b56969325224ee6c1c9b7d23b2f7e402bb.png',
    category: '设计资源',
    description: '全球顶尖的设计灵感分享平台，汇聚了来自世界各地的优秀设计师作品',
    articles: '1000万+',
    followers: '1200万+'
  },
  {
    name: 'Figma Community',
    url: 'https://www.figma.com/community/',
    logo: 'https://www.figma.com/favicon.ico',
    category: '设计资源',
    description: 'Figma设计社区，提供大量免费的设计资源、模板和组件',
    articles: '50万+',
    followers: '500万+'
  },
  
  // 知识库
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/',
    logo: 'https://developer.mozilla.org/favicon.ico',
    category: '知识库',
    description: 'Mozilla开发者网络，提供最权威的HTML、CSS、JavaScript等前端技术文档',
    articles: '5万+',
    followers: '2000万+'
  },
  {
    name: 'GitHub Learn',
    url: 'https://docs.github.com/zh/get-started',
    logo: 'https://github.githubassets.com/favicons/favicon.svg',
    category: '知识库',
    description: 'GitHub官方学习平台，提供Git和GitHub的入门到进阶教程',
    articles: '1000+',
    followers: '500万+'
  },
  {
    name: 'Ness Labs',
    url: 'https://nesslabs.com/',
    logo: 'https://nesslabs.com/favicon.ico',
    category: '知识库',
    description: '探索好奇心、创造力和正念生产力的游乐场，帮助你成为自己生活的科学家',
    articles: '500+',
    followers: '5万+'
  },
  
  // 生活阅读
  {
    name: '豆瓣阅读',
    url: 'https://read.douban.com/',
    logo: 'https://read.douban.com/favicon.ico',
    category: '生活阅读',
    description: '豆瓣旗下的电子书阅读平台，提供大量优质的电子书和原创作品',
    articles: '50万+',
    followers: '1500万+'
  },
  {
    name: '简书',
    url: 'https://www.jianshu.com/',
    logo: 'https://www.jianshu.com/favicon.ico',
    category: '生活阅读',
    description: '简单易用的创作平台，让每个人都能轻松分享自己的想法和故事',
    articles: '1000万+',
    followers: '2000万+'
  },
  
  // 个人网站
  {
    name: '我的个人网站',
    url: 'http://localhost:5173/',//有服务器了再改
    logo: '/1.jpg',
    category: '个人博客',
    description: '分享我的学习心得、技术实践和生活感悟，记录成长的每一步',
    articles: '100+',
    followers: '1万+'
  }
])
</script>

<style scoped>
/* 基础样式 */
.friend-links-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 友链网格布局 */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 3rem;
}

/* 友链卡片样式 */
.link-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e5e6eb;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  position: relative;
}

.link-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.link-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.link-card:hover::before {
  opacity: 1;
}

/* Logo样式 */
.link-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.link-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.link-card:hover .link-logo img {
  transform: scale(1.05);
}

/* 友链信息 */
.link-info {
  flex: 1;
  margin-bottom: 16px;
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.link-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1d2129;
  transition: color 0.3s;
}

.link-card:hover .link-header h3 {
  color: #667eea;
}

/* 分类标签 */
.link-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.link-card:hover .link-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

/* 描述文字 */
.link-desc {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 统计信息 */
.link-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #86909c;
  background: #f2f3f5;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s;
}

.link-card:hover .stat-item {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.stat-item i {
  font-size: 14px;
}

/* 访问按钮 */
.link-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 12px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s;
  margin-top: auto;
}

.link-action:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.link-action i {
  font-size: 14px;
  transition: transform 0.3s;
}

.link-card:hover .link-action i {
  transform: translateX(3px);
}

/* 添加友链卡片 */
.add-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e5e6eb;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
  cursor: pointer;
}

.add-new:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.add-icon {
  font-size: 3rem;
  font-weight: 300;
  color: #667eea;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.add-new:hover .add-icon {
  transform: scale(1.1);
}

.add-new p {
  margin: 0;
  color: #667eea;
  font-weight: 500;
  transition: color 0.3s;
}

.add-new:hover p {
  color: #764ba2;
}

/* 页脚说明 */
.friend-links-footer {
  background: rgba(255, 255, 255, 0.8);
  padding: 24px;
  border-radius: 16px;
  margin-top: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.friend-links-footer h3 {
  margin-top: 0;
  color: #1d2129;
  font-size: 1.2rem;
  margin-bottom: 16px;
}

.friend-links-footer p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .links-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .friend-links-container {
    padding: 1rem;
  }
  
  .page-header {
    padding: 2rem 1rem;
  }
  
  .page-header h2 {
    font-size: 2rem;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .link-card {
    padding: 20px;
  }
}
</style>