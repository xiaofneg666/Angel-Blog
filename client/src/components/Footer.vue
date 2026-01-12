
<!-- Footer.vue - 页脚组件 -->
<template>
    <footer class="footer">
      <div class="wave-gradient"></div>
      <div class="container">
        <p>&copy; 2004 我的博客. 保留所有权利.</p>
      </div>
    </footer>
  </template>
  
  <!-- 全局样式 - 放置动画关键帧 -->
  <style>
  @keyframes wave1 {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes wave2 {
    0% { background-position: 100% 50%; }
    50% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  </style>
  
  <!-- 组件作用域样式 -->
  <style scoped>
  .footer {
    position: relative;
    padding: 2rem 0;
    /* margin-top: 3rem; */
    border-top: 1px solid #eee;
    overflow: hidden;
  }
  
  /* 波浪渐变背景 */
  .wave-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* 可爱马卡龙色系渐变 - 粉蓝渐变 */
    background: linear-gradient(45deg, #ffccd5, #b5e5cf, #a7c7e7, #d8c3e3);
    background-size: 400% 400%;
    animation: wave1 8s ease-in-out infinite;
    opacity: 0.7;
    z-index: -1;
  }
  
  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* 辅助渐变 - 增加层次感 */
    background: linear-gradient(45deg, #ffe5ec, #e3f2fd, #f3e5f5, #e8f5e9);
    background-size: 400% 400%;
    animation: wave2 12s ease-in-out infinite;
    opacity: 0.5;
    z-index: -2;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    text-align: center;
    color: #333;
    position: relative;
    z-index: 1;
  }
  </style>