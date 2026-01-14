<template>
  
  <div class="friend-links-container">
    <NavBar />
    <header class="page-header">
      <h2>友情链接</h2>
      <p class="subtitle">与优秀的人同行，走得更远</p>
    </header>

    <div class="links-grid">
      <!-- 示例友链卡片1 - 来自图片中的Angel -->
      <div class="link-card">
        <div class="link-header">
          <h3>Angel</h3>
          <span class="link-tag">技术博客</span>
        </div>
        <p class="link-desc">学习知识是为了提升更好的感知</p>
        <p class="link-motto">优秀的人往往比别人更努力。</p>
        <a href="#" class="visit-btn">访问网站</a>
      </div>

      <!-- 示例友链卡片2 - 来自图片中的Vue Router -->
      <div class="link-card">
        <div class="link-header">
          <h3>Vue Router</h3>
          <span class="link-tag">技术框架</span>
        </div>
        <p class="link-desc">Vue技术的创新引擎，用于构建多维应用(SPA)、空间分布流(VR)等全球领先的移动网络平台</p>
        <div class="link-stats">
          <span>2台服务器</span>
          <span>6.25%的灯管</span>
        </div>
        <a href="#" class="visit-btn">访问官网</a>
      </div>

      <!-- 示例友链卡片3 - 来自图片中的小峰 -->
      <div class="link-card">
        <div class="link-header">
          <h3>小峰的博客</h3>
          <span class="link-tag">个人博客</span>
        </div>
        <p class="link-desc">分享技术与生活感悟</p>
        <div class="link-stats">
          <span>44 文章</span>
          <span>12 分类</span>
          <span>41 标签</span>
        </div>
        <a href="#" class="visit-btn">访问博客</a>
      </div>

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
import NavBar from '@/components/NavBar.vue'
</script>
<style scoped>
.friend-links-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h2 {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.link-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.link-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.link-tag {
  background: #f0f7ff;
  color: #1890ff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.link-desc {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.link-motto {
  font-style: italic;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.link-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.link-stats span {
  background: #f5f5f5;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.visit-btn {
  display: inline-block;
  background: #1890ff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.2s;
}

.visit-btn:hover {
  background: #40a9ff;
}

.add-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed #eee;
  background: #fafafa;
}

.add-new:hover {
  border-color: #1890ff;
  background: #f0f7ff;
}

.add-icon {
  font-size: 2rem;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.friend-links-footer {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.friend-links-footer h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.2rem;
}

.friend-links-footer p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}
</style>