<template>
  <div class="post-detail vue3-style">
    <NavBar></NavBar>
    <div v-if="articleLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载文章内容中...</span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="articleError" class="error-container">
      <i class="icon-error"></i>
      <span>{{ articleError }}</span>
      <button @click="fetchArticleDetail" class="retry-button">重试</button>
    </div>

    <!-- 文章内容 -->
    <template v-else>
      <!-- Hero Section with Background Image -->
      <div 
        class="post-hero" 
        :style="{ backgroundImage: `url(${getImageUrl(articleStore.currentArticle?.cover_image)})` }"
        @click="handleCoverClick"
        :class="{ 'editable-cover': isAuthor }"
      >
        <input 
          ref="coverInput" 
          type="file" 
          accept="image/*" 
          style="display: none" 
          @change="handleCoverChange"
        >
        <div class="hero-overlay">
          <h1 class="hero-title">{{ articleStore.currentArticle?.title }}</h1>
          <div class="hero-meta">
            <span class="meta-item">
              <i class="icon-calendar"></i> 发表于 {{ formatDate(articleStore.currentArticle?.publish_time) }}
            </span>
            <span class="meta-item">
              <i class="icon-update"></i> 更新于 {{ formatDate(articleStore.currentArticle?.update_time) }}
            </span>
            <span class="meta-item">
              <i class="icon-eye"></i> 阅读量: {{ formatNumber(articleStore.currentArticle?.view_count || 0) }}
            </span>
            <span class="meta-item">
              <i class="icon-file-text"></i> 字数统计: {{ formatNumber(articleStore.currentArticle?.word_count || 0) }}
            </span>
            <span class="meta-item">
              <i class="icon-clock"></i> 阅读时长: {{ calculateReadingTime(articleStore.currentArticle?.word_count || 0) }}分钟
            </span> 
            <span v-if="isAuthor" class="meta-item edit-cover-hint">
              <i class="icon-edit"></i> 点击封面修改
            </span>
          </div>
        </div>
      </div>

      <div class="post-layout">
        <!-- Sidebar with Table of Contents -->
        <aside class="post-sidebar">
          <div class="sidebar-content">
            <h3 class="sidebar-title">目录</h3>
            <div v-if="tableOfContents.length > 0" class="toc-list">
              <ul>
              <li v-for="item in tableOfContents" 
                  :key="item.id" 
                  class="toc-item"
                  :class="{ 
                    'active': item.id === activeHeading,
                    [`level-${item.level}`]: true
                  }">
                <a href="#" @click.prevent="scrollToHeading(item.id)">
                  {{ item.title }}
                </a>
              </li>
            </ul>
            </div>
            <div v-else class="no-toc-message">
              <i class="icon-info"></i>
              <span>没有找到文章的标题级别</span>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="post-main">
          <article class="post-article">
            <div class="post-content" v-html="articleStore.currentArticle?.content" ref="contentRef"></div>

            <!-- 文章操作按钮 -->
            <div class="post-actions-wrapper">
              <div class="post-actions">
                <div class="action-group">
                  <button 
                    class="action-btn like-btn" 
                    :class="{ 'active': articleStore.currentArticle?.is_liked }"
                    @click="handleLike"
                    :disabled="!authStore.isAuthenticated"
                  >
                    <i class="icon-heart" :class="{ 'filled': articleStore.currentArticle?.is_liked }"></i>
                    <span>点赞 {{ formatNumber(articleStore.currentArticle?.like_count || 0) }}</span>
                  </button>
                  <button 
                    class="action-btn favorite-btn" 
                    :class="{ 'active': articleStore.currentArticle?.is_favorited }"
                    @click="handleFavorite"
                    :disabled="!authStore.isAuthenticated"
                  >
                    <i class="icon-star" :class="{ 'filled': articleStore.currentArticle?.is_favorited }"></i>
                    <span>收藏 {{ formatNumber(articleStore.currentArticle?.favorite_count || 0) }}</span>
                  </button>
                </div>
                <div class="action-group" v-if="authStore.isAuthenticated">
              <router-link 
                v-if="authStore.user.username === articleStore.currentArticle?.author_name"
                :to="{ name: 'edit-post', params: { id: articleStore.currentArticle?.id } }"
                class="action-button edit-button"
              >
                <i class="icon-edit"></i> 编辑
              </router-link>
              <button 
                v-if="authStore.user.username === articleStore.currentArticle?.author_name"
                @click="handleDelete"
                class="action-button delete-button"
              >
                <i class="icon-delete"></i> 删除
              </button>
                </div>
              </div>
            </div>
          </article>

          <!-- 评论 -->
          <section class="comments-section">
            <div class="comments-header">
      <h2 class="comments-title"><i class="icon-comments"></i> 评论 <span class="comments-count">{{ comments.length }}</span></h2>
    </div>
            
            <!-- 评论输入框 -->
            <div v-if="authStore.isAuthenticated" class="comment-form">
              <div class="user-avatar">
                <img :src="getUserAvatar()" alt="用户头像">
              </div>
              <div class="form-content">
                <textarea 
                  v-model="newComment" 
                  placeholder="写下你的评论..." 
                  class="comment-textarea"
                ></textarea>
                <div class="form-actions">
                  <button 
                    @click="submitComment" 
                    :disabled="!newComment.trim()" 
                    class="submit-comment-button"
                  >
                    <i class="icon-send"></i> 发布评论
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="commentsLoading" class="loading-comments">
              <div class="loading-spinner"></div>
              <span>加载评论中...</span>
            </div>
            <div v-else-if="commentsError" class="error-message">{{ commentsError }}</div>
            <div v-else class="comments-list">
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                :isAuthenticated="authStore.isAuthenticated"
                @reply="handleAddComment"
              />
            </div>
          </section>
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import { ref, onMounted, nextTick, watch, onBeforeUnmount, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { useAuthStore } from '@/stores/authStore'
import { useCommentStore } from '@/stores/comment'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate, formatNumber, calculateReadingTime } from '@/utils/format'
import { fetchComments, addComment as addCommentApi, deleteComment as deleteCommentApi } from '@/api/comments'
import CommentItem from '@/components/CommentItem.vue'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const authStore = useAuthStore()
const commentStore = useCommentStore()

const comments = ref([])
const commentsLoading = ref(false)
const commentsError = ref('')
const newComment = ref('')
const replyContent = ref('') // 回复内容
const replyToCommentId = ref(null) // 当前回复的评论ID
const articleLoading = ref(true)
const articleError = ref('')

// 封面修改相关
const coverInput = ref(null)
const isAuthor = computed(() => {
  return authStore.isAuthenticated && authStore.user?.username === articleStore.currentArticle?.author_name
})

// 目录相关
const tableOfContents = ref([])
const activeHeading = ref('')

// 处理文章内容
const processArticleContent = (content) => {
  if (!content) return ''
  
  // 确保所有标题都有id
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/g
  let index = 0
  
  // 先提取所有标题
  const headings = []
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const title = match[2].replace(/<[^>]+>/g, '').trim() // 移除标题中的HTML标签
    const id = `heading-${index}`
    
    headings.push({
      level,
      title,
      id
    })
    
    index++
  }
  
  // 更新目录数据
  tableOfContents.value = headings
  
  // 替换原始内容中的标题标签，添加id属性
  return content.replace(headingRegex, (match, level, title) => {
    const id = `heading-${headings.findIndex(h => h.title === title)}`
    return `<h${level} id="${id}">${title}</h${level}>`
  })
}

// 获取文章详情
const fetchArticleDetail = async () => {
  articleLoading.value = true
  articleError.value = null
  
  try {
    const response = await fetch(`/api/articles/${route.params.id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.success) {
      // 添加日志查看服务器返回的时间
      console.log('服务器返回的时间:', {
        publish_time: data.data.publish_time,
        update_time: data.data.update_time
      });

      // 处理文章内容
      const processedContent = processArticleContent(data.data.content)
      
      // 计算文章字数（如果后端没有提供）
      const wordCount = data.data.word_count || calculateWordCount(processedContent)
      
      // 更新文章数据，确保使用数据库中的时间
      articleStore.currentArticle = {
        ...data.data,
        content: processedContent,
        word_count: wordCount,
        publish_time: data.data.publish_time,
        update_time: data.data.update_time
      }
      
      // 添加日志查看格式化后的时间
      console.log('格式化后的时间:', {
        publish_time: formatDate(articleStore.currentArticle.publish_time),
        update_time: formatDate(articleStore.currentArticle.update_time)
      });
    } else {
      console.error('获取文章详情失败:', data.message)
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    articleError.value = '获取文章详情失败，请稍后重试'
  } finally {
    articleLoading.value = false
  }
}

// 计算文章字数
const calculateWordCount = (content) => {
  if (!content) return 0
  // 移除HTML标签
  const textContent = content.replace(/<[^>]+>/g, '')
  // 计算中文字符和英文单词
  const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (textContent.match(/[a-zA-Z]+/g) || []).length
  // 计算其他字符（数字、标点等）
  const otherChars = textContent.replace(/[\u4e00-\u9fa5]|[a-zA-Z]/g, '').length
  
  return chineseChars + englishWords + otherChars
}

// 生成目录
const generateTableOfContents = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const toc = []
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1])
    const title = heading.textContent
    const id = heading.id || `heading-${index}`
    
    // 如果没有id，添加一个
    if (!heading.id) {
      heading.id = id
    }
    
    toc.push({
      level,
      title,
      id
    })
  })
  
  // 更新目录数据
  tableOfContents.value = toc
}

// 滚动到指定位置
const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const navHeight = 64 // 导航栏高度
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - navHeight
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    
    // 更新活动标题
    activeHeading.value = id
  }
}

// 更新当前活动标题
const updateActiveHeading = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const scrollPosition = window.scrollY
  const navHeight = 64

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i]
    const headingTop = heading.getBoundingClientRect().top + window.pageYOffset
    
    if (headingTop <= scrollPosition + navHeight + 100) {
      activeHeading.value = heading.id
      break
    }
  }
}

// 处理图片URL
const getImageUrl = (path) => {
  if (!path) return '/default-cover.jpg'
  if (path.startsWith('/uploads/')) return `/api${path}`
  return `/api/uploads/${path}`
}

// 初始化
onMounted(() => {
  fetchArticleDetail()
  window.addEventListener('scroll', updateActiveHeading)
  
  // 检查 URL hash 并滚动到对应位置
  nextTick(() => {
    generateTableOfContents()
    const hash = window.location.hash
    if (hash) {
      const id = hash.substring(1)
      setTimeout(() => {
        scrollToHeading(id)
      }, 100)
    }
  })
  
  // 加载评论
  loadComments()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})

// 加载评论
async function loadComments() {
  commentsLoading.value = true;
  commentsError.value = '';
  try {
    const res = await fetchComments(route.params.id)
    if (res.success) {
      // 直接使用后端返回的嵌套结构数据
      comments.value = res.data;
    } else {
      commentsError.value = res.message || '加载评论失败'
    }
  } catch (e) {
    commentsError.value = '加载评论失败'
  } finally {
    commentsLoading.value = false
  }
}

// 发布顶级评论
async function submitComment() {
  if (!newComment.value.trim()) return
  try {
    const res = await addCommentApi(route.params.id, { content: newComment.value.trim() })
    if (res.success) {
    newComment.value = ''
    await loadComments()
    } else {
      commentsError.value = res.message || '评论失败'
    }
  } catch (e) {
    commentsError.value = '评论失败'
  }
}

// 回复评论
async function handleAddComment(replyData) {
  if (!replyData.content) return
  try {
    const res = await addCommentApi(route.params.id, replyData)
    if (res.success) {
      await loadComments()
    } else {
      commentsError.value = res.message || '回复失败'
    }
  } catch (e) {
    commentsError.value = '回复失败'
  }
}

// 处理点赞
const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再点赞')
    return
  }

  try {
    const response = await fetch(`/api/articles/${route.params.id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      throw new Error('点赞失败')
    }

    const data = await response.json()
    if (data.success) {
      // 更新文章数据
      articleStore.currentArticle = {
        ...articleStore.currentArticle,
        is_liked: !articleStore.currentArticle.is_liked,
        like_count: articleStore.currentArticle.is_liked 
          ? articleStore.currentArticle.like_count - 1 
          : articleStore.currentArticle.like_count + 1
      }
      ElMessage.success(articleStore.currentArticle.is_liked ? '点赞成功' : '取消点赞')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 处理收藏
const handleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再收藏')
    return
  }

  try {
    const response = await fetch(`/api/articles/${route.params.id}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      throw new Error('收藏失败')
    }

    const data = await response.json()
    if (data.success) {
      // 更新文章数据
      articleStore.currentArticle = {
        ...articleStore.currentArticle,
        is_favorited: !articleStore.currentArticle.is_favorited,
        favorite_count: articleStore.currentArticle.is_favorited 
          ? articleStore.currentArticle.favorite_count - 1 
          : articleStore.currentArticle.favorite_count + 1
      }
      ElMessage.success(articleStore.currentArticle.is_favorited ? '收藏成功' : '取消收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 引入getUserById函数
import { getUserById } from '@/api/auth';

// 当前登录用户的头像URL
const currentUserAvatar = ref('/api/head/R.jpg');

// 获取当前登录用户的最新头像
const fetchCurrentUserAvatar = async () => {
  if (authStore.isAuthenticated && authStore.user) {
    try {
      // 通过用户ID从数据库获取最新用户信息
      const user = await getUserById(authStore.user.id);
      if (user && user.avatar) {
        // 构建正确的头像URL
        currentUserAvatar.value = user.avatar.startsWith('/') ? `/api${user.avatar}` : user.avatar;
      } else {
        // 如果没有头像，使用默认头像
        currentUserAvatar.value = '/api/head/R.jpg';
      }
    } catch (error) {
      console.error('获取当前用户头像失败:', error);
      // 如果API调用失败，使用authStore中的头像或默认头像
      if (authStore.user.avatar) {
        currentUserAvatar.value = authStore.user.avatar.startsWith('/') ? `/api${authStore.user.avatar}` : authStore.user.avatar;
      } else {
        currentUserAvatar.value = '/api/head/R.jpg';
      }
    }
  } else {
    // 如果未登录，使用默认头像
    currentUserAvatar.value = '/api/head/R.jpg';
  }
};

// 组件挂载时获取当前用户头像
onMounted(() => {
  fetchCurrentUserAvatar();
});

// 监听用户认证状态变化，重新获取头像
watch(
  () => authStore.isAuthenticated,
  () => {
    fetchCurrentUserAvatar();
  }
);

// 用户头像获取方法，供模板使用
function getUserAvatar() {
  return currentUserAvatar.value;
}

// 处理封面点击
const handleCoverClick = () => {
  if (isAuthor.value) {
    coverInput.value?.click();
  }
}

// 处理封面更改
const handleCoverChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    console.log('开始上传封面:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      articleId: route.params.id,
      token: authStore.token ? '已获取' : '未获取',
      userId: authStore.user?.id,
      isAuthor: isAuthor.value
    });

    // 检查是否已登录
    if (!authStore.token) {
      ElMessage.error('请先登录');
      return;
    }

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('cover_image', file);

    // 发送 PUT 请求更新封面
    const response = await fetch(`/api/articles/${route.params.id}/cover`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    });

    console.log('服务器响应状态:', response.status);

    const data = await response.json();
    console.log('服务器响应数据:', data);

    if (!response.ok) {
      // 如果是认证错误，清除过期的 token 并提示用户重新登录
      if (response.status === 401) {
        authStore.logout();
        ElMessage.error('登录已过期，请重新登录');
        return;
      }
      throw new Error(data.message || '更新封面失败');
    }

    if (data.success) {
      // 更新文章数据
      articleStore.currentArticle = {
        ...articleStore.currentArticle,
        cover_image: data.data.cover_image,
        update_time: data.data.update_time
      };
      ElMessage.success('封面更新成功');
    } else {
      ElMessage.error(data.message || '更新封面失败');
    }
  } catch (error) {
    console.error('更新封面失败:', error);
    ElMessage.error(error.message || '更新封面失败，请稍后重试');
  } finally {
    // 重置文件输入
    if (coverInput.value) {
      coverInput.value.value = '';
    }
  }
}
</script>

<style scoped>
/* 全局变量和基础样式 */
.vue3-style {
  --primary-color: #42b983;
  --text-color: #333;
  --light-text: #666;
  --border-color: #e0e0e0;
  --bg-color: #fff;
  --sidebar-bg: #f5f5f5;
  --code-bg: #282c34;
  --hero-overlay: rgba(0, 0, 0, 0.6);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --radius-sm: 4px;
  --radius-md: 6px;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  line-height: 1.6;
}

/* Hero Section with Background Image */
.post-hero {
  height: 250px;
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: white;
}

/* 可编辑封面样式 */
.editable-cover {
  cursor: pointer;
}

.edit-cover-hint {
  opacity: 0.8;
  cursor: pointer;
}

.hero-title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Post Layout (Main content + Sidebar) */
.post-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* 更新目录样式以匹配图片 */
.post-sidebar {
  position: sticky;
  top: 84px;
  height: calc(100vh - 84px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.sidebar-content {
  background: var(--sidebar-bg);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.sidebar-title {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0 0 0.6rem 0;
  font-weight: 600;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 0.15rem 0;
  line-height: 1.4;
  transition: all 0.2s ease;
}

.toc-item a {
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  display: block;
  padding: 4px 8px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  border-radius: 4px;
}

.toc-item a:hover {
  color: #fff;
  background: #ff4757;
}

.toc-item.active a {
  color: #fff;
  font-weight: 500;
  background: #ff4757;
}

/* 目录层级缩进 */
.toc-item.level-1 { padding-left: 0; }
.toc-item.level-2 { padding-left: 12px; }
.toc-item.level-3 { padding-left: 24px; }
.toc-item.level-4 { padding-left: 36px; }
.toc-item.level-5 { padding-left: 48px; }
.toc-item.level-6 { padding-left: 60px; }

/* Article Content */
.post-main {
  flex: 1;
  max-width: 900px;
  margin: 0;
}

.post-article {
  background: var(--bg-color);
  margin-bottom: 1.5rem;
}

/* 更新内容区域样式 */
.post-content {
  padding: 1.5rem;
  line-height: 1.8;
  font-size: 1rem;
  color: var(--text-color);
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.post-content h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eaecef;
}

.post-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.post-content h3 { font-size: 1.3rem; }
.post-content h4 { font-size: 1.1rem; }
.post-content h5 { font-size: 1rem; }
.post-content h6 { font-size: 0.9rem; }

.post-content p {
  margin: 1rem 0;
  text-align: justify;
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 1.5rem auto;
  display: block;
}

.post-content pre {
  background: #282c34;
  color: #abb2bf;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.2rem 0;
  font-size: 0.9rem;
}

.post-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background: #282c34;
  color: #abb2bf;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

.post-content blockquote {
  border-left: 4px solid var(--primary-color);
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  background: rgba(66, 185, 131, 0.1);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.post-content ul,
.post-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.post-content li {
  margin: 0.5rem 0;
}

/* 连接器配置样式 - 模仿图片中的代码块 */
.connector-config {
  background: #f5f5f5;
  border-left: 4px solid #42b983;
  padding: 0.8rem 1rem;
  margin: 1rem 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #333;
  overflow-x: auto;
}

/* Article Actions */
.post-actions-wrapper {
  padding: 1.2rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--sidebar-bg);
  margin-top: 1.5rem;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.action-group {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 1rem;
}

/* 评论区域整体美化 */
.comments-section {
  background: var(--sidebar-bg);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin: 1.5rem auto 0 auto;
  max-width: 820px;
}
.comments-header {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}
.comments-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
}
.comments-title .icon-comments {
  color: var(--primary-color);
  margin-right: 0.5rem;
  font-size: 1.1em;
}
.comments-count {
  color: var(--light-text);
  font-size: 0.9em;
  margin-left: 0.5em;
}
.comment-form {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}
.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.form-content {
  flex: 1;
  margin-left: 1rem;
}
.comment-textarea {
  width: 100%;
  min-height: 54px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.6em 1em;
  font-size: 1rem;
  resize: vertical;
  background: #fff;
  margin-bottom: 0.5em;
}
.comment-textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
.submit-comment-button {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.45em 1.2em;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.submit-comment-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.loading-comments {
  display: flex;
  align-items: center;
  color: #42b983;
  font-size: 1.1em;
  margin: 1.2em 0;
}
.loading-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #e6f9f0;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  margin-right: 0.7em;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-message {
  color: #ff5252;
  background: #fff0f0;
  border-radius: 7px;
  padding: 0.7em 1.2em;
  margin: 1em 0;
  font-size: 1.08em;
  border: 1px solid #ffd6d6;
}

/* 评论列表样式 */
.comments-list {
  background: #fff;
  border-radius: var(--radius-md);
  padding: 1rem;
  border: 1px solid var(--border-color);
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pagination-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-button:not(.active):hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.disabled:hover {
  border-color: #eee;
  color: #ccc;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

/* 错误提示样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--danger-color);
  text-align: center;
  padding: 2rem;
}

.error-container i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .post-layout {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .post-sidebar {
    display: none;
  }
  
  .post-main {
    max-width: 100%;
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .post-content {
    padding: 1rem;
  }
  
  .post-content h1 {
    font-size: 1.5rem;
  }
  
  .post-content h2 {
    font-size: 1.3rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-meta {
    flex-wrap: wrap;
  }
  
  .meta-item {
    font-size: 0.8rem;
  }
  
  .post-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-group {
    width: 100%;
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

/* 添加无目录时的提示样式 */
.no-toc-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--light-text);
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  margin-top: 0.5rem;
}

.no-toc-message i {
  color: var(--warning-color);
  font-size: 1.1rem;
}

/* 文章操作按钮样式 */
.article-actions {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.action-btn.active {
  color: #ff4757;
  border-color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn i {
  font-size: 1.1rem;
}

.action-btn i.filled {
  color: #ff4757;
}

.like-btn:hover:not(:disabled) {
  color: #ff4757;
  border-color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.favorite-btn:hover:not(:disabled) {
  color: #ffa502;
  border-color: #ffa502;
  background: rgba(255, 165, 2, 0.1);
}

.favorite-btn.active {
  color: #ffa502;
  border-color: #ffa502;
  background: rgba(255, 165, 2, 0.1);
}

.favorite-btn i.filled {
  color: #ffa502;
}
</style>