<template>
  <div class="home">
    <NavBar />

    <!-- 头部大图+标题 -->
    <header class="hero-header">
      <div class="hero-bg" :style="currentBackgroundStyle" />
      <button class="carousel-control prev" @click="prevBackground" aria-label="上一张" />
      <button class="carousel-control next" @click="nextBackground" aria-label="下一张" />
      <div class="carousel-indicators">
        <button
          v-for="(img, idx) in backgroundImages"
          :key="idx"
          :class="{ active: currentIndex === idx }"
          @click="goToBackground(idx)"
          :aria-label="`切换到图片 ${idx + 1}`"
        />
      </div>
      <div class="hero-center">
        <h1 class="hero-title">Angel</h1>
        <p class="hero-desc">{{ displayedText || '学习知识是为了提出更好的问题。' }}</p>
      </div>
    </header>

    <div class="main-content-wrapper">
      <div class="main-content">
        <!-- 格言条 -->
        <div class="slogan">
          <span class="slogan-icon">🔊</span>
          <span class="slogan-text">优秀的人往往比别人更努力。</span>
          <span class="slogan-arrow">»</span>
        </div>

        <!-- 推荐轮播 -->
        <div class="carousel">
          <span class="carousel-badge">推荐</span>
          <button class="carousel-arrow left" @click="prevRecommended">‹</button>
          <img
            :src="getImageUrl(currentArticle?.cover_image)"
            :alt="currentArticle?.title"
            @error="handleImageError"
            loading="lazy"
          />
          <div class="carousel-caption">
            <h2 class="carousel-title">{{ currentArticle?.title }}</h2>
            <div class="carousel-info">
              <span class="carousel-author">{{ currentArticle?.author_name }}</span>
              <span class="carousel-date">{{ currentArticle?.publish_time }}</span>
            </div>
            <p class="carousel-excerpt">{{ currentArticle?.excerpt || '暂无摘要' }}</p>
          </div>
          <button class="carousel-arrow right" @click="nextRecommended">›</button>
        </div>

        <!-- 文章列表（无限滚动） -->
        <div class="article-list">
          <div
            class="article"
            v-for="(item, idx) in articles"
            :key="item.id"
            :class="{ reverse: idx % 2 === 1 }"
          >
            <div class="article-image">
              <img
                :src="getImageUrl(item.cover_image)"
                :alt="item.title"
                @error="handleImageError"
                loading="lazy"
              />
            </div>
            <div class="article-content"> 
              <div class="article-meta">
                <span class="meta-top">
                  <span v-if="item.is_pinned" class="meta-pin">📌 置顶</span>
                  <span class="meta-date">{{
                    item.update_time ? formatUpdateTime(item.update_time) : formatDate(item.publish_time)
                  }}</span>
                  <span class="meta-tag">{{ item.category_name }}</span>
                </span>
              </div>
              <div class="article-title">{{ item.title }}</div>
              <div class="article-desc">{{ item.excerpt || '暂无摘要' }}</div>
              <router-link :to="{ name: 'post-detail', params: { id: item.id }}" class="more-btn">
                更多...
              </router-link>
            </div>
          </div>

          <!-- 无限滚动触发锚点 -->
          <div ref="loadMoreAnchor" class="load-more-anchor" />

          <!-- 加载提示 -->
          <div class="load-more-tips">
            <span v-if="isLoading">加载中...</span>
            <span v-else-if="noMore">—— 没有更多了 ——</span>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="profile">
          <router-link v-if="authStore.user" :to="{ name: 'myhomeview', params: { id: authStore.user.id }}">
            <img
              class="profile-pic"
              :src="getUserAvatar(authStore.user.avatar)"
              :alt="authStore.user.username || '用户头像'"
            />
          </router-link>
          <div v-else class="profile-pic-container">
            <img class="profile-pic" :src="getUserAvatar()" alt="默认头像" />
          </div>

          <router-link
            v-if="authStore.user"
            :to="{ name: 'myhomeview', params: { id: authStore.user.id }}"
            class="profile-name"
          >
            {{ authStore.user.username || 'Angel' }}
          </router-link>
          <div v-else class="profile-name">Angel</div>

          <div class="profile-info">
            个人介绍<br />
            <template v-if="statsLoading">加载中...</template>
            <template v-else-if="statsError">{{ statsError }}</template>
            <template v-else>{{ stats.articleCount }} 文章 | {{ stats.categoryCount }} 分类</template>
          </div>
          <div class="profile-links">
            <a href="#">🐧</a>
            <a href="#">📧</a>
            <a href="#">🌐</a>
          </div>
        </div>

        <div class="notice">
          <div class="notice-title"> 公告 |笔记与思考的栖息地</div>
          <div class="notice-list">
            <div>欢迎留言讨论、提出建议，一起进步</div>
            <div>一起构建一个有温度的讨论角落</div>
          </div>
        </div>
        <!-- 最新评论 -->
        <div class="comments">
          <div class="comments-title">最新评论</div>
          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            class="comment-item"
          >
            <div class="comment-avatar">
              <img 
                :src="getUserAvatar(comment.avatar)" 
                :alt="comment.username" 
              />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-username">{{ comment.username }}</span>
                <span class="comment-time">{{ comment.created_at }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stats-title">网站统计</div>
          <div>文章数：44</div>
          <div>访问量：350788499369</div>
          <div>评论数：0</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
/* -------------------- 1. 引用 -------------------- */
import NavBar from '@/components/NavBar.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatUpdateTime, getImageUrl } from '@/utils/format'

/* -------------------- 2. 用户信息 -------------------- */
const authStore = useAuthStore()

/* -------------------- 3. 打字名言 -------------------- */
const displayedText = ref('')
let typingInterval = null
const typingSpeed = 100
function startTyping(text) {
  if (typingInterval) clearInterval(typingInterval)
  displayedText.value = ''
  let i = 0
  typingInterval = setInterval(() => {
    if (i < text.length) displayedText.value += text.charAt(i++)
    else clearInterval(typingInterval)
  }, typingSpeed)
}
async function fetchRandomSaying() {
  try {
    const res = await fetch('/api/sayings/random')
    const json = await res.json()
    if (json.success) startTyping(json.data.content)
    else startTyping('学习知识是为了提出更好的问题。')
  } catch {
    startTyping('学习知识是为了提出更好的问题。')
  }
}

/* -------------------- 4. 头部轮播 -------------------- */
const backgroundImages = ['/1.jpg', '/2.jpeg', '/3.jpeg', '/4.jpg']
const currentIndex = ref(0)
const isTransitioning = ref(false)
let heroCarouselTimer = null
const currentBackgroundStyle = ref({
  backgroundImage: `url('${backgroundImages[0]}')`,
  opacity: 1
})
function goToBackground(idx) {
  if (isTransitioning.value || currentIndex.value === idx) return
  isTransitioning.value = true
  currentBackgroundStyle.value.opacity = 0
  setTimeout(() => {
    currentIndex.value = idx
    currentBackgroundStyle.value.backgroundImage = `url('${backgroundImages[idx]}')`
    currentBackgroundStyle.value.opacity = 1
    isTransitioning.value = false
  }, 500)
}
function prevBackground() {
  goToBackground((currentIndex.value - 1 + backgroundImages.length) % backgroundImages.length)
}
function nextBackground() {
  goToBackground((currentIndex.value + 1) % backgroundImages.length)
}
function startHeroCarousel() {
  if (heroCarouselTimer) clearInterval(heroCarouselTimer)
  heroCarouselTimer = setInterval(nextBackground, 5000)
}
function stopHeroCarousel() {
  if (heroCarouselTimer) clearInterval(heroCarouselTimer)
}

/* -------------------- 5. 推荐文章轮播 -------------------- */
const recommendedArticles = ref([])
const recommendedIndex = ref(0)
const currentArticle = computed(() => recommendedArticles.value[recommendedIndex.value])
let recommendedTimer = null
function prevRecommended() {
  recommendedIndex.value =
    (recommendedIndex.value - 1 + recommendedArticles.value.length) % recommendedArticles.value.length
}
function nextRecommended() {
  recommendedIndex.value = (recommendedIndex.value + 1) % recommendedArticles.value.length
}
function startRecommendedCarousel() {
  if (recommendedTimer) clearInterval(recommendedTimer)
  recommendedTimer = setInterval(nextRecommended, 5000)
}
function stopRecommendedCarousel() {
  if (recommendedTimer) clearInterval(recommendedTimer)
}
async function fetchRecommendedArticles() {
  try {
    const res = await fetch('http://localhost:3000/api/articles/recommended')
    const data = await res.json()
    recommendedArticles.value = data
  } catch (e) {
    console.error(e)
  }
}

/* -------------------- 6. 无限滚动文章列表 -------------------- */
const articles = ref([])
const currentPage = ref(1)
const pageSize = 5
const isLoading = ref(false)
const noMore = ref(false)
const loadMoreAnchor = ref(null)
let io = null

async function fetchArticles() {
  isLoading.value = true
  try {
    const res = await fetch(
      `http://localhost:3000/api/articles?page=${currentPage.value}&pageSize=${pageSize}`
    )
    const json = await res.json()
    if (!json.success) throw new Error('接口异常')
    articles.value.push(...json.data.articles)
    if (json.data.articles.length < pageSize) noMore.value = true
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function startIntersection() {
  io = new IntersectionObserver(
    async ([entry]) => {
      if (entry.isIntersecting && !isLoading.value && !noMore.value) {
        currentPage.value += 1
        await fetchArticles()
      }
    },
    { rootMargin: '100px' }
  )
  io.observe(loadMoreAnchor.value)
}
function stopIntersection() {
  io && io.disconnect()
}

/* -------------------- 7. 统计数据 -------------------- */
const stats = ref({ articleCount: 0, categoryCount: 0 })
const statsLoading = ref(false)
const statsError = ref('')
async function fetchStats() {
  statsLoading.value = true
  try {
    const res = await fetch('/api/dashboard/stats')
    const json = await res.json()
    if (json.success) stats.value = json.data
  } catch {
    statsError.value = '获取统计数据失败'
  } finally {
    statsLoading.value = false
  }
}

/* -------------------- 8. 最新评论 -------------------- */
const comments = ref([
  {
    id: 1,
    user_id: 1,
    username: '用户A',
    avatar: '/2222.jpg',
    content: '文章写得很好！',
    created_at: '2026-01-10 15:30:00'
  },
  {
    id: 2,
    user_id: 2,
    username: '用户B',
    avatar: '/2222.jpg',
    content: '学习了，感谢分享！',
    created_at: '2026-01-09 10:20:00'
  }
])

// 处理用户头像URL
function getUserAvatar(avatar) {
  if (!avatar) {
    return '/2222.jpg';
  }
  
  // 检查头像URL是否已经是完整的URL
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // 处理相对路径
  if (avatar.startsWith('/api/') || avatar.startsWith('/head/') || avatar.startsWith('/uploads/')) {
    return avatar;
  }
  
  // 默认情况
  return `/uploads/${avatar}`;
}

async function fetchComments() {
  try {
    const res = await fetch('http://localhost:3000/api/comments/latest')
    const data = await res.json()
    if (data.success) {
      comments.value = data.data
    }
  } catch (e) {
    console.error('获取评论失败:', e)
    // 保持模拟数据，避免页面空白
  }
}

/* -------------------- 8. 工具函数 -------------------- */
function handleImageError(e) {
  e.target.src = '/default-cover.jpg'
}

/* -------------------- 9. 生命周期 -------------------- */
onMounted(() => {
  startHeroCarousel()
  fetchRandomSaying()
  fetchRecommendedArticles()
  startRecommendedCarousel()
  fetchArticles()      // 拉第一页
  startIntersection()  // 启动无限滚动
  fetchStats()
  fetchComments()      // 获取最新评论
})
onBeforeUnmount(() => {
  stopHeroCarousel()
  if (typingInterval) clearInterval(typingInterval)
  stopRecommendedCarousel()
  stopIntersection()
})
</script>

<style scoped>
.home {
  font-family: '微软雅黑', Arial, sans-serif;
  background: #f6f8fa;
}

/* 主内容和侧边栏整体布局 */
.main-content-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  max-width: 1300px;
  margin: 5px auto 0; /* 修改：将-20px改为0，使内容向下移动20px */
  padding: 0 20px;
  gap: 36px;
}

/* 主内容区宽度 */
.main-content {
  flex: 1 1 800px;
  max-width: 800px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 侧边栏 */
.sidebar {
  flex: 0 0 320px;
  max-width: 320px;
  min-width: 260px;
  /* margin-top: 0px; 修改：将30px改为0px */
  max-height: calc(400vh - 200px); /* 限制侧边栏高度为视口高度减去200px */
  overflow-y: auto; /* 启用垂直滚动 */
  position: sticky; /* 粘性定位，随页面滚动保持可见 */
  top: 20px; /* 距离顶部20px */
}

/* 导航栏、格言条、轮播图统一宽度和卡片风格 */
.nav,
.slogan,
.carousel {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.10);
  background: #fff;
  margin: 0 auto;
}

/* 导航栏样式 */
.nav {
  padding: 16px 0;
  text-align: center;
  margin-bottom: 0;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  justify-content: center;
  gap: 18px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* 格言条样式 */
.slogan {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 18px 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: #444;
  letter-spacing: 1.5px;
  margin: 0 0 0 0;
  width: 100%;
}

/* 轮播图样式 */
.carousel {
  position: relative;
  width: 100%;
  height: 300px; /* 降低高度 */
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.hero-header {
  position: relative; /* 确保控制按钮可以绝对定位 */
  height: 500px; /* 原高度为420px，增加到500px */
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

/* 轮播控制按钮 */
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  transition: background 0.3s, transform 0.3s;
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

.carousel-control:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.carousel-control::before {
  content: '';
  width: 16px;
  height: 16px;
  border-top: 2px solid white;
  border-left: 2px solid white;
}

.carousel-control.prev::before {
  transform: rotate(-45deg);
  margin-left: 6px;
}

.carousel-control.next::before {
  transform: rotate(135deg);
  margin-right: 6px;
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 4;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}

.carousel-indicators button.active {
  background: white;
  transform: scale(1.3);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: center center/cover no-repeat;
  z-index: 1;
  filter: brightness(0.85);
  transition: opacity 1s ease-in-out; /* 平滑过渡动画 */
}
.hero-center {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
}
.hero-title {
  color: #fff;
  font-size: 3.2rem;
  font-family: 'Times New Roman', serif;
  font-weight: bold;
  text-shadow: 0 4px 16px rgba(0,0,0,0.35);
  margin-bottom: 1rem;
}
.hero-desc {
  color: #fff;
  font-size: 1.3rem;
  text-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.wave {
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 100px;
  z-index: 3;
  pointer-events: none;
}
.nav a, .nav .router-link {
  margin: 0 16px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s, font-weight 0.2s;
}
.nav a:hover, .nav .router-link:hover {
  color: #ff7675;
  font-weight: bold;
}
.carousel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.carousel:hover img {
  transform: scale(1.02);
}
.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 30px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
}
.carousel-title {
  font-size: 22px;
  margin-bottom: 8px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.carousel-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
  font-size: 13px;
}
.carousel-author {
  color: #ffd700;
  font-weight: 500;
}
.carousel-date {
  color: #888;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 4px;
}
.carousel-date::before {
  content: "🕒";
  font-size: 1.1em;
}
.carousel-excerpt {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.carousel-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff4d4f;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}
.carousel-arrow.left {
  left: 15px;
}
.carousel-arrow.right {
  right: 15px;
}
.profile,
.notice,
.comments,
.stats {
  background: #fff;
  padding: 32px 20px;
  border-radius: 22px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.10);
  margin-bottom: 32px;
}
.profile-pic {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 18px;
  display: block;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-pic:hover {
  transform: scale(1.05);
}

.profile-name {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block; /* 新增：强制块级元素 */
  width: 100%; /* 新增：确保占满父容器宽度 */
}

.profile-name:hover {
  color: #409eff;
}

.profile-info {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  margin-bottom: 10px;
}
.profile-links {
  text-align: center;
  margin-top: 8px;
}
.profile-links a {
  margin: 0 4px;
  color: #888;
}
.notice-title {
  color: #ff7675;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.notice-title::before {
  content: "📢";
  font-size: 1.2em;
}
.notice-list {
  color: #666;
  font-size: 0.97em;
}
.comments-title,
.stats-title {
  font-weight: bold;
  margin-bottom: 6px;
}

/* 评论项样式 */
.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* 评论头像 */
.comment-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* 评论内容 */
.comment-content {
  flex: 1;
  min-width: 0;
}

/* 评论头部 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

/* 评论用户名 */
.comment-username {
  font-weight: 500;
  color: #333;
}

/* 评论时间 */
.comment-time {
  font-size: 0.85em;
  color: #999;
}

/* 评论文本 */
.comment-text {
  color: #666;
  line-height: 1.5;
  font-size: 0.95em;
  word-break: break-word;
}

/* 深色模式下的评论样式 */
[data-theme="dark"] .comment-item {
  border-bottom-color: #333;
}

[data-theme="dark"] .comment-username {
  color: #fff;
}

[data-theme="dark"] .comment-time {
  color: #666;
}

[data-theme="dark"] .comment-text {
  color: #ccc;
}
.footer {
  text-align: center;
  color: #fff;
  background: linear-gradient(90deg, #4fd1c5, #38a1db);
  padding: 16px 0;
  margin-top: 40px;
}
.slogan-icon {
  margin-right: 12px;
  font-size: 1.3em;
  color: #ffb84d;
}
.slogan-arrow {
  margin-left: 12px;
  font-size: 1.3em;
  color: #ccc;
}
.article-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 24px;
}

.article {
  display: flex;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.10);
  overflow: hidden;
  align-items: stretch;
  transition: all 0.3s ease;
  min-height: 220px;
  position: relative;
}

.article:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.article.reverse {
  flex-direction: row-reverse;
}

.article-image {
  width: 50%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 auto;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  will-change: transform;
}

.article-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.02) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.article-image:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.article-image:hover img {
  transform: scale(1.05);
}

.article-image:hover::after {
  opacity: 1;
}

.article-content {
  flex: 1;
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(to right, #fff, #f8f9fa);
}

.article-meta {
  margin-bottom: 16px;
  font-size: 0.95em;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.meta-pin {
  color: #ff7675;
  font-weight: 500;
  font-size: 0.95em;
  background: rgba(255, 118, 117, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.meta-pin:hover {
  background: rgba(255, 118, 117, 0.2);
  transform: translateY(-1px);
}

.meta-date {
  color: #666;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(136, 136, 136, 0.08);
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.meta-date::before {
  content: "🕒";
  font-size: 1em;
}

.meta-date:hover {
  background: rgba(136, 136, 136, 0.15);
  transform: translateY(-1px);
}

.meta-tag {
  color: #38a1db;
  background: rgba(56, 161, 219, 0.1);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.9em;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-tag::before {
  content: "🏷️";
  font-size: 1em;
}

.meta-tag:hover {
  background: #38a1db;
  color: #fff;
  transform: translateY(-1px);
}

/* 深色模式适配 */
[data-theme="dark"] .meta-pin {
  background: rgba(255, 118, 117, 0.15);
}

[data-theme="dark"] .meta-pin:hover {
  background: rgba(255, 118, 117, 0.25);
}

[data-theme="dark"] .meta-date {
  background: rgba(184, 184, 184, 0.1);
  color: #b8b8b8;
}

[data-theme="dark"] .meta-date:hover {
  background: rgba(184, 184, 184, 0.15);
}

[data-theme="dark"] .meta-tag {
  background: rgba(56, 161, 219, 0.15);
}

[data-theme="dark"] .meta-tag:hover {
  background: #38a1db;
}

@media (max-width: 900px) {
  .meta-top {
    gap: 8px;
  }
  
  .meta-pin,
  .meta-date,
  .meta-tag {
    padding: 3px 8px;
    font-size: 0.85em;
  }
}

.article-title {
  font-size: 1.8rem;
  color: #2d3436;
  font-weight: bold;
  margin-bottom: 16px;
  margin-top: 4px;
  line-height: 1.4;
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 12px;
}

.article-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ff7675, #ffb84d);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.article:hover .article-title {
  color: #ff4d6d;
}

.article:hover .article-title::after {
  width: 100px;
}

.article-desc {
  color: #555;
  font-size: 1.15em;
  margin-bottom: 20px;
  line-height: 1.8;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  letter-spacing: 0.3px;
}

.more-btn {
  align-self: flex-end;
  color: #fff;
  background: linear-gradient(90deg, #ff7675, #ffb84d);
  border-radius: 18px;
  padding: 10px 32px;
  font-size: 1.1em;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255,184,77,0.2);
  transition: all 0.3s ease;
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.more-btn:hover {
  background: linear-gradient(90deg, #ffb84d, #ff7675);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,184,77,0.3);
}

.more-btn:hover::before {
  left: 100%;
}

.pagination {
  text-align: center;
  margin: 30px 0 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pagination span,
.pagination a {
  margin: 0 4px;
  color: #666;
  text-decoration: none;
  font-size: 1.1em;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  min-width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pagination span {
  background: linear-gradient(90deg, #ff7675, #ffb84d);
  color: #fff;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255,184,77,0.2);
}

.pagination a {
  background: #f8f9fa;
  border: 1px solid #eee;
}

.pagination a:hover {
  background: linear-gradient(90deg, #ffb84d, #ff7675);
  color: #fff;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255,184,77,0.2);
}

@media (max-width: 900px) {
  .article {
    flex-direction: column !important;
  }
  .article img {
    width: 100%;
    max-height: 220px;
  }
  .article-content {
    padding: 20px 16px 16px 16px;
  }
  .meta-top {
    gap: 8px;
  }
  
  .meta-pin,
  .meta-date,
  .meta-tag {
    padding: 4px 12px;
    font-size: 0.9em;
  }
  
  .article-title {
    font-size: 1.5rem;
  }
  
  .article-desc {
    font-size: 1.1em;
    line-height: 1.6;
  }
}

/* 可选：添加光标闪烁效果 */
.hero-desc::after {
  content: '|';
  animation: blink 1s step-end infinite;
  margin-left: 4px;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}


/* 新增：深色模式样式 */
[data-theme="dark"] .home {
  background: #1a1a2e;
}

[data-theme="dark"] .main-content,
[data-theme="dark"] .sidebar,
[data-theme="dark"] .slogan,
[data-theme="dark"] .carousel,
[data-theme="dark"] .article,
[data-theme="dark"] .profile,
[data-theme="dark"] .notice,
[data-theme="dark"] .comments,
[data-theme="dark"] .stats {
  background: #16213e;
  color: #e6e6e6;
}

[data-theme="dark"] .hero-title,
[data-theme="dark"] .hero-desc,
[data-theme="dark"] .article-title,
[data-theme="dark"] .profile-name,
[data-theme="dark"] .notice-title,
[data-theme="dark"] .comments-title,
[data-theme="dark"] .stats-title {
  color: #fff;
}

[data-theme="dark"] .article-desc,
[data-theme="dark"] .profile-info,
[data-theme="dark"] .notice-list {
  color: #b8b8b8;
}

[data-theme="dark"] .slogan-text {
  color: #e0e0e0;
}

[data-theme="dark"] .pagination a {
  background: #1a1a2e;
  border-color: #2d3436;
}

[data-theme="dark"] .pagination a:hover {
  background: linear-gradient(90deg, #ffb84d, #ff7675);
  border-color: transparent;
}

/* 关于2025-12-18 */
.load-more-anchor {
  height: 1px;
  pointer-events: none;
}
.load-more-tips {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}


/* 响应式调整 */
@media (max-width: 900px) {
  .article-image {
    width: 85%;
    height: 240px;
    border-radius: 12px;
  }
}

@media (max-width: 600px) {
  .article-image {
    width: 80%;
    height: 200px;
    border-radius: 10px;
  }
}
</style>



