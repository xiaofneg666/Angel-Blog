<template>
  <div class="comment-item" :class="{ 'is-nested': isNested }">
    <!-- 评论主体 -->
    <div class="comment-card" :class="{ 'highlighted': showReply }">
      <!-- 头像区域 -->
      <div class="avatar-wrapper">
        <div class="avatar-frame">
          <img :src="getAvatar" alt="用户头像" class="user-avatar" />
          <div v-if="!isNested" class="avatar-glow"></div>
        </div>
        <!-- 引导线已隐藏 -->
        <!-- <div v-if="!isNested && hasReplies" class="thread-connector"></div> -->
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 头部：用户信息 + 时间 -->
        <div class="comment-header">
          <div class="user-info">
            <span class="username">{{ comment.username }}</span>
            <span v-if="comment.tag" class="user-tag" :class="tagClass">{{ comment.tag }}</span>
            <span class="timestamp">{{ formatDate(comment.created_at) }}</span>
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="comment-content">
          <span v-if="comment.reply_to_username" class="reply-mention">
            @{{ comment.reply_to_username }}
          </span>
          {{ comment.content }}
        </div>

        <!-- 操作按钮 -->
        <div class="comment-actions">
          <button 
            class="action-btn reply-btn" 
            @click="toggleReply"
            :class="{ 'active': showReply }"
          >
            <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
            </svg>
            <span>{{ showReply ? '取消回复' : '回复' }}</span>
          </button>
          <!-- 删除按钮 -->
          <button 
            class="action-btn delete-btn" 
            @click="handleDeleteComment"
            v-if="canDeleteComment"
          >
            <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>删除</span>
          </button>
          <button class="action-btn more-btn">
            <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- 回复输入框（平滑展开） -->
        <transition name="slide-fade">
          <div v-if="showReply" class="reply-form">
            <div v-if="isAuthenticated" class="reply-input-group">
              <div class="input-header">
                <span class="reply-hint">回复 @{{ comment.username }}</span>
                <span class="char-counter" :class="{ 'warning': replyContent.length > 180 }">
                  {{ replyContent.length }}/200
                </span>
              </div>
              <textarea
                v-model="replyContent"
                :placeholder="`想对 @${comment.username} 说些什么...`"
                :disabled="isSubmitting"
                ref="replyInput"
                class="reply-textarea"
                rows="3"
                maxlength="200"
              />
              <div class="input-actions">
                <button 
                  class="btn btn-secondary" 
                  @click="cancelReply"
                  :disabled="isSubmitting"
                >
                  取消
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="submitReply"
                  :disabled="!replyContent.trim() || isSubmitting"
                  :class="{ 'loading': isSubmitting }"
                >
                  <span v-if="!isSubmitting">发送回复</span>
                  <span v-else class="loading-dots">发送中</span>
                </button>
              </div>
            </div>
            <div v-else class="auth-prompt">
              <span>请先 <a href="/login" class="login-link">登录</a> 后参与讨论</span>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 嵌套回复列表 -->
        <div v-if="hasReplies" class="replies-container">
          <div class="replies-list">
            <CommentItem
              v-for="reply in displayedReplies"
              :key="reply.id"
              :comment="reply"
              :isAuthenticated="isAuthenticated"
              :isNested="true"
              @reply="handleNestedReply"
              @delete="handleNestedDelete"
            />

            <!-- 展开更多回复 -->
            <div v-if="hasMoreReplies && !isNested" class="more-replies">
              <button class="expand-btn" @click="showAllReplies = !showAllReplies">
                <span class="btn-text">
                  {{ showAllReplies ? '收起回复' : `展开 ${comment.replies.length - 2} 条回复` }}
                </span>
                <svg 
                  class="chevron" 
                  :class="{ 'expanded': showAllReplies }" 
                  viewBox="0 0 24 24" 
                  width="16" 
                  height="16"
                >
                  <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { formatDate } from '@/utils/format'
import { getUserById } from '@/api/auth'
import { deleteComment } from '@/api/comments'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  comment: { type: Object, required: true },
  isAuthenticated: { type: Boolean, default: false },
  isNested: { type: Boolean, default: false }
})

const emit = defineEmits(['reply', 'delete'])
const authStore = useAuthStore()

// 初始化authStore，确保用户状态正确
authStore.init()

const showReply = ref(false)
const replyContent = ref('')
const showAllReplies = ref(false)
const isSubmitting = ref(false)
const replyInput = ref(null)

// 判断当前用户是否有权限删除评论
const canDeleteComment = computed(() => {
  console.log('canDeleteComment调试信息:');
  console.log('authStore.isAuthenticated:', authStore.isAuthenticated);
  console.log('authStore.user:', authStore.user);
  console.log('authStore.user?.userId:', authStore.user?.userId);
  console.log('props.comment.user_id:', props.comment.user_id);
  console.log('props.comment:', props.comment);
  
  // 临时修改：为了测试，让删除按钮始终显示
  // return authStore.isAuthenticated && authStore.user?.userId === props.comment.user_id
  return authStore.isAuthenticated;
})

// 删除评论
const handleDeleteComment = async () => {
  console.log('点击了删除按钮，开始执行删除操作')
  if (confirm('确定要删除这条评论吗？')) {
    try {
      console.log('删除评论，ID:', props.comment.id)
      // 使用authStore中的token，确保token的正确性
      if (!authStore.isAuthenticated) {
        alert('请先登录');
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/comments/${props.comment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      
      const result = await response.json();
      console.log('删除结果:', result)
      
      if (result.success) {
        emit('delete', props.comment.id);
        alert('评论删除成功');
      } else {
        alert('删除评论失败：' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除评论失败：' + error.message);
    }
  }
}

// 计算属性
const hasReplies = computed(() => {
  return (props.comment.replies || []).length > 0
})

const displayedReplies = computed(() => {
  const replies = Array.isArray(props.comment.replies) ? props.comment.replies : []
  return (showAllReplies.value || props.isNested) ? replies : replies.slice(0, 2)
})

const hasMoreReplies = computed(() => {
  return (props.comment.replies || []).length > 2
})

// 头像URL，支持异步获取最新头像
const avatarUrl = ref('/api/head/R.jpg')

// 获取用户头像的方法
const fetchUserAvatar = async () => {
  const { user_id, avatar, username } = props.comment
  
  // 默认头像
  let newAvatarUrl = '/api/head/R.jpg'
  
  if (user_id) {
    try {
      // 通过user_id获取最新用户信息
      const user = await getUserById(user_id)
      if (user) {
        console.log(`获取用户 ${username} (ID: ${user_id}) 的信息:`, user)
        if (user.avatar) {
          // 用户信息返回的avatar如果是以/开头，添加/api前缀，否则直接使用
          newAvatarUrl = user.avatar.startsWith('/') ? `/api${user.avatar}` : user.avatar
          console.log(`使用从API获取的头像: ${newAvatarUrl}`)
        } else {
          console.log(`用户 ${username} 没有设置头像，使用默认头像`)
        }
      }
    } catch (error) {
      console.error('获取用户头像失败:', error)
      // 如果获取失败，使用comment对象中存储的avatar或默认头像
      if (avatar) {
        newAvatarUrl = avatar.startsWith('/') ? `/api${avatar}` : avatar
        console.log(`API调用失败，使用comment中的头像: ${newAvatarUrl}`)
      }
    }
  } else if (avatar) {
    // 如果没有user_id但有avatar，使用comment对象中的avatar
    newAvatarUrl = avatar.startsWith('/') ? `/api${avatar}` : avatar
    console.log(`没有user_id，使用comment中的头像: ${newAvatarUrl}`)
  }
  
  avatarUrl.value = newAvatarUrl
}

// 组件挂载时获取头像
onMounted(() => {
  fetchUserAvatar()
})

// 监听评论变化，重新获取头像
watch(
  () => props.comment,
  () => {
    fetchUserAvatar()
  },
  { deep: true }
)

const getAvatar = computed(() => {
  return avatarUrl.value
})

const tagClass = computed(() => {
  if (props.comment.tag === '作者') return 'tag-author'
  return 'tag-default'
})

// 方法
const toggleReply = async () => {
  showReply.value = !showReply.value
  if (showReply.value && replyInput.value) {
    await nextTick()
    replyInput.value.focus()
  }
}

const cancelReply = () => {
  showReply.value = false
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  
  isSubmitting.value = true
  try {
    await emit('reply', {
      content: replyContent.value.trim(),
      parent_id: props.comment.id,
      root_id: props.comment.root_id || props.comment.id,
      reply_to_user_id: props.comment.user_id,
      reply_to_username: props.comment.username
    })
    
    // 成功后的反馈
    replyContent.value = ''
    showReply.value = false
    
    // 自动展开回复列表
    if (!showAllReplies.value) {
      showAllReplies.value = true
    }
  } catch (error) {
    console.error('回复失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleNestedReply = (data) => emit('reply', data)

// 处理嵌套回复的删除事件
const handleNestedDelete = (commentId) => {
  console.log('嵌套回复删除事件，向上传递:', commentId)
  emit('delete', commentId)
}
</script>

<style scoped>
/* ====== 设计变量 ====== */
.comment-item {
  /* 主色调 - 暖色系 */
  --color-primary: #8B572A;
  --color-primary-light: rgba(139, 87, 42, 0.06);
  --color-primary-hover: #7A4C24;
  --color-secondary: #E5D9C5;
  --color-tertiary: #D1BFA7;
  
  /* 背景色 */
  --color-background: #FFFFFF;
  --color-reply-bg: #FDFBF7;
  --color-card-hover: #F8F5F0;
  
  /* 文字颜色 */
  --color-text: #3E3A39;
  --color-text-light: #8C8C8C;
  --color-text-muted: #B0A8A0;
  
  /* 边框和分割线 */
  --color-border: rgba(229, 217, 197, 0.6);
  --color-border-light: rgba(229, 217, 197, 0.3);
  --color-divider: #E5D9C5;
  
  /* 状态颜色 */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* 阴影效果 - 更轻量 */
  --shadow-card: 0 1px 6px rgba(139, 87, 42, 0.02);
  --shadow-hover: 0 2px 8px rgba(139, 87, 42, 0.04);
  --shadow-float: 0 3px 12px rgba(139, 87, 42, 0.06);
  --shadow-inner: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  
  /* 圆角设计 - 更小巧 */
  --radius-card: 8px;
  --radius-input: 6px;
  --radius-btn: 4px;
  --radius-avatar: 50%;
  
  /* 动画效果 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 间距设计 - 更紧凑 */
  --spacing-xs: 1px;
  --spacing-sm: 2px;
  --spacing-md: 4px;
  --spacing-lg: 8px;
  --spacing-xl: 12px;
  
  /* 字体大小 - 更小 */
  --font-xs: 9px;
  --font-sm: 10px;
  --font-base: 11px;
  --font-md: 12px;
  --font-lg: 13px;
  
  position: relative;
  margin-bottom: 6px;
}

/* ====== 主评论卡片 ====== */
.comment-card {
  display: flex;
  gap: 6px;
  background: var(--color-background);
  padding: 8px 10px;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

/* 卡片顶部装饰条 */
.comment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.comment-card:hover {
  box-shadow: var(--shadow-hover);
  border-color: rgba(139, 87, 42, 0.4);
  background: var(--color-card-hover);
  transform: translateY(-2px);
}

.comment-card:hover::before {
  transform: scaleX(1);
}

.comment-card.highlighted {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, #fff, var(--color-reply-bg));
  box-shadow: var(--shadow-float);
}

.comment-card.highlighted::before {
  transform: scaleX(1);
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
}

/* ====== 头像区域 ====== */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-frame {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar, .user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-avatar);
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(139, 87, 42, 0.12);
  position: relative;
  z-index: 2;
  transition: all var(--transition-normal);
  background: linear-gradient(135deg, var(--color-secondary), var(--color-tertiary));
}

.user-avatar:hover, .user-avatar img:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 4px 12px rgba(139, 87, 42, 0.2);
}

/* 头像光晕效果 - 更小巧 */
.avatar-frame::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 87, 42, 0.15), transparent 70%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.avatar-frame:hover::before {
  opacity: 1;
}

/* 隐藏回复连接线条 */
.thread-connector {
  display: none;
}

/* .comment-card:hover .thread-connector {
  opacity: 0.6;
} */

/* ====== 内容区域 ====== */
.content-wrapper {
  flex: 1;
  min-width: 0;
}

.comment-header {
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
}

.username {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 12px;
  position: relative;
  transition: all var(--transition-fast);
}

.username:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* 用户标签美化 - 更小 */
.user-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all var(--transition-fast);
}

.tag-author {
  background: linear-gradient(135deg, #FEE2E2, #FCA5A5);
  color: var(--color-error);
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.15);
}

.tag-author:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.tag-default {
  background: linear-gradient(135deg, #E5D9C5, #D1BFA7);
  color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(139, 87, 42, 0.15);
}

.tag-default:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 87, 42, 0.2);
}

/* 时间戳美化 - 更小 */
.timestamp {
  color: var(--color-text-muted);
  font-size: 10px;
  margin-left: auto;
  transition: all var(--transition-fast);
  position: relative;
  padding: 1px 4px;
  border-radius: 8px;
}

.timestamp:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

/* ====== 评论内容 ====== */
.comment-content {
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text);
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 6px;
  padding: 4px 6px;
  border-radius: var(--radius-input);
  background: rgba(229, 217, 197, 0.05);
  transition: all var(--transition-fast);
  border-left: 1px solid transparent;
}

.comment-content:hover {
  background: rgba(229, 217, 197, 0.1);
  border-left-color: var(--color-secondary);
}

/* 回复提及样式 - 更小 */
.reply-mention {
  color: var(--color-primary);
  font-weight: 500;
  margin-right: 3px;
  background: var(--color-primary-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  transition: all var(--transition-fast);
}

.reply-mention:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
}

/* ====== 操作按钮 ====== */
.comment-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border-light);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: var(--radius-btn);
  color: var(--color-text-light);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

/* 删除按钮特殊样式 */
.action-btn.delete-btn {
  color: var(--color-error);
}

.action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--color-error);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(139, 87, 42, 0.1), transparent);
  transition: left var(--transition-normal);
}

.action-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: rgba(139, 87, 42, 0.2);
  transform: translateY(-1px);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.action-btn .icon {
  transition: transform var(--transition-fast);
}

.action-btn:hover .icon {
  transform: translateX(2px) scale(1.1);
}

/* ====== 回复输入框 ====== */
.reply-form {
  margin-top: 8px;
  animation: slideIn var(--transition-normal);
}

.reply-input-group {
  background: var(--color-reply-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 10px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-inner);
}

.reply-input-group:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 87, 42, 0.1);
  transform: translateY(-2px);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.reply-hint {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.reply-hint::before {
  content: '💬';
  font-size: 16px;
}

.char-counter {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
  transition: all var(--transition-fast);
  background: rgba(139, 87, 42, 0.05);
  padding: 4px 12px;
  border-radius: 12px;
}

.char-counter.warning {
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.1);
}

.reply-textarea {
  width: 100%;
  min-height: 90px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  resize: vertical;
  outline: none;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text);
  padding: 12px 16px;
  border-radius: var(--radius-btn);
  transition: all var(--transition-fast);
  font-family: inherit;
}

.reply-textarea:focus {
  outline: none;
  background: white;
  box-shadow: var(--shadow-inner);
  border-color: var(--color-primary);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

/* 按钮美化 */
.btn {
  padding: 6px 12px;
  border-radius: var(--radius-btn);
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform var(--transition-fast);
}

.btn:hover::before {
  transform: translateX(100%);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 87, 42, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-light);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

/* 登录提示美化 */
.auth-prompt {
  text-align: center;
  padding: 24px;
  background: var(--color-reply-bg);
  border-radius: var(--radius-input);
  border: 1px dashed var(--color-border);
  transition: all var(--transition-normal);
}

.auth-prompt:hover {
  border-color: var(--color-primary);
  background: rgba(139, 87, 42, 0.05);
}

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);
  background: linear-gradient(135deg, rgba(139, 87, 42, 0.1), rgba(139, 87, 42, 0.2));
  padding: 6px 16px;
  border-radius: 20px;
}

.login-link:hover {
  text-decoration: none;
  color: white;
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 87, 42, 0.3);
}

.auth-prompt {
  text-align: center;
  padding: 24px;
  background: var(--color-reply-bg);
  border-radius: var(--radius-input);
  border: 1px dashed var(--color-border);
}

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

/* ====== 嵌套回复 ====== */
.replies-container {
  margin-left: 28px;
  position: relative;
  padding-left: 0;
}

.replies-list {
  position: relative;
}

/* 隐藏嵌套回复连接线 */
/* .replies-list::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, 
    transparent,
    var(--color-primary) 20%,
    var(--color-secondary) 80%,
    transparent
  );
  opacity: 0.5;
} */

/* 嵌套评论的特殊样式 */
.is-nested {
  margin-bottom: 4px;
}

.is-nested .comment-card {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 6px 0 6px 12px;
  margin: 0;
  border-radius: 0;
  border-left: 2px solid var(--color-border-light);
  transition: all var(--transition-normal);
}

.is-nested .comment-card::before {
  display: none;
}

.is-nested .comment-card:hover {
  box-shadow: 0 4px 16px rgba(139, 87, 42, 0.08);
  background: var(--color-reply-bg);
  border-radius: var(--radius-input);
  border-left-color: var(--color-primary);
  transform: translateY(-1px) translateX(8px);
}

.is-nested .avatar-frame {
  width: 24px;
  height: 24px;
}

.is-nested .user-avatar, .is-nested .user-avatar img {
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(139, 87, 42, 0.15);
}

.is-nested .comment-content {
  font-size: 14px;
  padding: 8px 12px;
  background: rgba(229, 217, 197, 0.08);
  border-left-color: transparent;
}

.is-nested .comment-content:hover {
  border-left-color: var(--color-secondary);
}

.is-nested .comment-actions {
  padding-top: 8px;
}

.is-nested .action-btn {
  padding: 5px 12px;
  font-size: 13px;
}

/* ====== 展开更多按钮 ====== */
.more-replies {
  margin-top: 6px;
  display: flex;
  justify-content: center;
}

.expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}

.expand-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(139, 87, 42, 0.1), transparent);
  transition: left var(--transition-normal);
}

.expand-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.expand-btn:hover::before {
  left: 100%;
}

.expand-btn:active {
  transform: translateY(0);
}

.chevron {
  transition: all var(--transition-normal);
  font-size: 16px;
  font-weight: bold;
}

.chevron.expanded {
  transform: rotate(180deg) scale(1.1);
}

/* ====== 加载动画 ====== */
.loading-dots::after {
  content: '';
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0%, 100% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}

/* ====== 动画 ====== */
@keyframes rotate-glow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ====== 响应式设计 ====== */
@media (max-width: 768px) {
  .comment-card {
    padding: 8px 10px;
    gap: 6px;
  }
  
  .replies-container {
    margin-left: 32px;
    padding-left: 6px;
  }
  
  .avatar-frame {
    width: 26px;
    height: 26px;
  }
  
  .is-nested .avatar-frame {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 480px) {
  .comment-actions {
    flex-wrap: wrap;
    gap: 3px;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .timestamp {
    margin-left: 0;
    font-size: 10px;
  }
  
  .comment-content {
    font-size: 11px;
    line-height: 1.3;
    margin-bottom: 4px;
    padding: 3px 5px;
  }
  
  .action-btn {
    padding: 2px 5px;
    font-size: 10px;
    gap: 2px;
  }
}
</style>