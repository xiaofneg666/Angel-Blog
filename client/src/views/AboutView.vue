<template>
  <div class="angel-page">
    <NavBar></NavBar>
    <div class="angel-hero" :style="heroBackgroundStyle">
      <div class="angel-title">
        <span class="title-main">天使</span>
        <span class="title-sub">Angel</span>
      </div>
    </div>
    <div class="angel-card">
      <div class="angel-info">
        <div class="angel-avatar">
          <img src="/3.jpeg" alt="天使头像" />
        </div>
        <div class="angel-desc">
          <div class="desc-section">
            <p class="section-title">👼 天使的定义</p>
            <p class="desc-item">天使，源自希腊语“angelos”，意为“使者”。</p>
            <p class="desc-item">在许多宗教传统中，天使被视为上帝或神灵的使者。</p>
            <p class="desc-item">它们负责传达神的意志和保护人类。</p>
          </div>
          <div class="desc-section">
            <p class="section-title">🌟 天使的象征</p>
            <p class="desc-item">天使通常被描绘为拥有翅膀、光环和长袍的人类形象。</p>
            <p class="desc-item">这些元素象征着它们的纯洁、神圣和超自然的力量。</p>
          </div>
          <div class="desc-section">
            <p class="section-title">📖 天使在宗教中的角色</p>
            <p class="desc-item">在基督教、伊斯兰教和犹太教中，天使都是核心的宗教象征。</p>
            <p class="desc-item">它们执行神的命令，保护信徒，并在天堂中赞美上帝。</p>
          </div>
          <div class="desc-section">
            <p class="section-title">🎨 天使在艺术与文学中的表现</p>
            <p class="desc-item">天使在艺术和文学中的形象丰富多彩。</p>
            <p class="desc-item">从文艺复兴时期的绘画到现代电影，天使一直是艺术家和作家的灵感来源。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
import { onMounted, ref } from 'vue';

const heroBackgroundStyle = ref('');
const backgroundImages = [
  '/1.jpg',
  '/2.jpeg',
  '/2222.jpg',
  '/3.jpeg',
  '/4.jpg',
  '/default-cover.jpg'
];

onMounted(() => {
  // 随机选择一张图片
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  const selectedImage = backgroundImages[randomIndex];
  
  // 设置背景样式
  heroBackgroundStyle.value = `background: url("${selectedImage}") center/cover no-repeat`;
});
</script>

<style scoped>
.angel-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 40px;
}

.angel-hero {
  width: 100%;
  height: 300px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.angel-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.2));
}

.angel-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
  z-index: 1;
}

.title-main {
  font-size: 2.8rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.title-sub {
  font-size: 1.2rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
}

.angel-card {
  max-width: 800px;
  margin: -80px auto 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  padding: 40px;
  position: relative;
}

.angel-info {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.angel-avatar img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(66, 185, 131, 0.2);
  background: linear-gradient(135deg, #42b983, #3498db);
  object-fit: cover;
  transition: transform 0.3s ease;
}

.angel-avatar img:hover {
  transform: scale(1.05) rotate(5deg);
}

.angel-desc {
  flex: 1;
}

.desc-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  position: relative;
  padding-left: 24px;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: #42b983;
  border-radius: 4px;
}

.desc-item {
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;
  line-height: 1.6;
}

.desc-item::before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #42b983;
}

@media (max-width: 768px) {
  .angel-hero {
    height: 240px;
  }
  
  .angel-card {
    padding: 30px 20px;
    margin-top: -60px;
  }
  
  .angel-info {
    flex-direction: column;
    gap: 24px;
  }
  
  .angel-avatar {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .angel-hero {
    height: 200px;
  }
  
  .title-main {
    font-size: 2rem;
  }
  
  .title-sub {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
}
</style>