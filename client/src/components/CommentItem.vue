<template>
  <div class="comment-item">
    <!-- 主评论内容 -->
    <div class="comment-header">
      <img :src="getAvatar" alt="用户头像" class="avatar" />
      <div class="comment-body">
        <div class="comment-main">
          <span class="username">{{ comment.username }}</span>
          <span v-if="comment.tag" class="user-tag">{{ comment.tag }}</span>
        </div>
        <div class="comment-content">
          <span v-if="comment.reply_to_username" class="reply-to">回复 @{{ comment.reply_to_username }}:</span>
          {{ comment.content }}
        </div>
        <div class="comment-meta">
          <span class="date">{{ formatDate(comment.created_at) }}</span>
          <button class="reply-btn" @click="showReply = !showReply" aria-label="回复">
            <span class="reply-text">回复</span>
          </button>
          <button class="more-btn" aria-label="更多操作">
            <span class="more-icon">⋯</span>
          </button>
        </div>
        
        <!-- 回复输入框 -->
        <div v-if="showReply" class="reply-form">
          <template v-if="isAuthenticated">
            <textarea 
              v-model="replyContent" 
              placeholder="写下你的回复..." 
              aria-label="回复内容" 
              :disabled="isSubmitting"
            />
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <div class="reply-actions">
              <button 
                class="reply-submit" 
                @click="submitReply" 
                :disabled="!replyContent.trim() || isSubmitting" 
                aria-label="发表回复"
              >
                {{ isSubmitting ? '提交中...' : '发表' }}
              </button>
              <button 
                class="reply-cancel" 
                @click="showReply = false" 
                :disabled="isSubmitting" 
                aria-label="取消回复"
              >
                取消
              </button>
            </div>
          </template>
          <span v-else class="login-tip">请先登录后再回复</span>
        </div>
      </div>
    </div>
    
    <!-- 子评论渲染 -->
    <div v-if="displayedReplies.length" class="replies">
      <!-- 显示回复列表 -->
      <CommentItem
        v-for="reply in displayedReplies" 
        :key="reply.id"
        :comment="reply"
        :isAuthenticated="isAuthenticated"
        :isNested="true"
        @reply="handleNestedReply"
      />
      
      <!-- 折叠/展开按钮 -->
      <div v-if="(Array.isArray(props.comment.replies) ? props.comment.replies : []).length > 2 && !props.isNested" class="more-replies">
        <button 
          class="more-replies-btn" 
          @click="showAllReplies = !showAllReplies" 
          aria-label="{{ showAllReplies ? '收起回复' : '查看全部回复' }}"
        >
          {{ showAllReplies ? '收起' : `共${(Array.isArray(props.comment.replies) ? props.comment.replies : []).length}条回复，点击查看` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { formatDate } from '@/utils/format'

// Props 定义
const props = defineProps({
  comment: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      user_id: '',
      username: '',
      avatar: '',
      tag: '',
      content: '',
      created_at: '',
      like_count: 0,
      replies: [],
      root_id: '',
      reply_to_username: '',
      reply_to_user_id: ''
    })
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  isNested: {
    type: Boolean,
    default: false
  }
})

// 事件定义
const emit = defineEmits(['reply'])

// 响应式状态
const showReply = ref(false)
const replyContent = ref('')
const showAllReplies = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

// 使用ref对象管理所有回复的状态，确保响应式更新
const replyStates = ref({})

// 计算属性
const displayedReplies = computed(() => {
  // 确保replies总是一个数组
  const replies = Array.isArray(props.comment.replies) ? props.comment.replies : []
  return showAllReplies.value 
    ? replies 
    : replies.slice(0, 2)
})

const getAvatar = computed(() => {
  const { avatar } = props.comment
  if (!avatar) {
    // 如果没有头像，使用固定的R.jpg作为默认头像
    return '/api/head/R.jpg'
  }
  return avatar.startsWith('/') ? `/api${avatar}` : avatar
})

// 方法
const submitReply = async () => {
  const content = replyContent.value.trim()
  if (!content) return
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    emit('reply', {
      content,
      parent_id: props.comment.id,
      root_id: props.comment.root_id || props.comment.id,
      reply_to_user_id: props.comment.user_id,
      reply_to_username: props.comment.username
    })
    replyContent.value = ''
    showReply.value = false
  } catch (error) {
    console.error('提交回复失败:', error)
    errorMessage.value = '提交回复失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

// 切换回复框显示/隐藏
const toggleReplyBox = (replyId) => {
  // 确保响应式赋值
  if (!replyStates.value[replyId]) {
    replyStates.value[replyId] = {
      showReply: false,
      replyContent: '',
      isSubmitting: false,
      errorMessage: ''
    };
  }
  replyStates.value[replyId].showReply = !replyStates.value[replyId].showReply;
}

// 处理嵌套回复
const handleNestedReply = (replyData) => {
  // 直接转发reply事件给父组件
  emit('reply', replyData)
}

// 提交嵌套回复
const submitNestedReply = async (reply) => {
  // 确保响应式赋值
  if (!replyStates.value[reply.id]) {
    replyStates.value[reply.id] = {
      showReply: false,
      replyContent: '',
      isSubmitting: false,
      errorMessage: ''
    };
  }
  const replyState = replyStates.value[reply.id]
  
  const content = replyState.replyContent.trim()
  if (!content) return
  
  replyState.isSubmitting = true
  replyState.errorMessage = ''
  
  try {
    emit('reply', {
      content,
      parent_id: reply.id,
      root_id: reply.root_id || props.comment.root_id || props.comment.id, // 确保root_id始终是评论树的最顶层ID
      reply_to_user_id: reply.user_id,
      reply_to_username: reply.username
    })
    // 清空内容并关闭回复框
    replyState.replyContent = ''
    replyState.showReply = false
  } catch (error) {
    console.error('提交回复失败:', error)
    replyState.errorMessage = '提交回复失败，请稍后重试'
  } finally {
    replyState.isSubmitting = false
  }
}
</script>

<style scoped>
.comment-item {
  background: #FDFBF7;
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 嵌套回复样式 - 移除框框效果 */
.comment-item:deep(.comment-item) {
  margin-bottom: 12px;
  padding: 12px 0 12px 16px;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border-left: 2px solid #E5D9C5;
}

/* 嵌套回复的头像 */
.comment-item:deep(.comment-item .avatar) {
  width: 44px;
  height: 44px;
}

/* 嵌套回复的用户名 */
.comment-item:deep(.comment-item .username) {
  font-size: 15px;
}

/* 嵌套回复的内容 */
.comment-item:deep(.comment-item .comment-content) {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

/* 嵌套回复的回复按钮 */
.comment-item:deep(.comment-item .reply-btn) {
  font-size: 13px;
  padding: 6px 12px;
}

/* 嵌套回复的回复输入框 */
.comment-item:deep(.comment-item .reply-form) {
  margin-left: 56px;
  padding: 12px 0 12px 16px;
}

/* 嵌套回复的回复列表 */
.comment-item:deep(.comment-item .replies) {
  margin-left: 56px;
  padding-left: 16px;
}

.comment-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #8B572A;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.comment-item:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.16);
  transform: translateY(-2px);
}

.comment-item:hover::before {
  transform: scaleX(1);
}

.comment-header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  width: 100%;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid transparent;
  background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
  padding: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.comment-item:hover .avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.3);
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.username {
  font-weight: 700;
  color: #8B572A;
  font-size: 17px;
  transition: all 0.3s ease;
  position: relative;
}

.username::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #8B572A;
  transition: width 0.3s ease;
}

.username:hover {
  color: #1890ff;
}

.username:hover::after {
  width: 100%;
}

.user-tag {
  font-size: 12px;
  color: #fff;
  background: #8B572A;
  padding: 3px 12px;
  border-radius: 16px;
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(139, 87, 42, 0.4);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(24, 144, 255, 0.6);
}

.comment-content {
  color: #3E3A39;
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 16px;
  word-break: break-word;
  white-space: pre-wrap;
  padding: 12px 0;
  transition: color 0.2s ease;
}

.comment-item:hover .comment-content {
  color: #262626;
}

.reply-to {
  color: #1890ff;
  font-weight: 600;
  font-size: 15px;
  margin-right: 8px;
  transition: color 0.2s ease;
}

.reply-to:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  color: #8c8c8c;
  font-size: 14px;
  flex-wrap: wrap;
}

.date {
  color: #8c8c8c;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  padding: 4px 0;
}

.date::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: #1890ff;
  transition: width 0.3s ease;
}

.date:hover {
  color: #8B572A;
  transform: translateY(-1px);
}

.date:hover::before {
  width: 100%;
  background: #8B572A;
}

/* 按钮基础样式 */
.reply-btn, .more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #8c8c8c;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.reply-btn::before, .more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.reply-btn:hover::before, .more-btn:hover::before {
  left: 100%;
}

/* 回复按钮 */
.reply-btn {
  margin-left: auto;
  background: rgba(139, 87, 42, 0.05);
  color: #8B572A;
}

.reply-btn:hover {
  background: #8B572A;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 87, 42, 0.4);
}

/* 更多按钮 */
.more-btn {
  margin-right: 0;
  padding: 8px;
  border-radius: 50%;
  background: rgba(153, 153, 153, 0.05);
}

.more-btn:hover {
  background: rgba(153, 153, 153, 0.15);
  color: #666;
  transform: rotate(180deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(153, 153, 153, 0.3);
}

/* 图标样式 */
.more-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

/* 按钮焦点状态 */
.reply-btn:focus,
.more-btn:focus,
.reply-submit:focus,
.reply-cancel:focus {
  outline: 3px solid #1890ff;
  outline-offset: 3px;
  border-radius: 24px;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
}

/* 回复输入框 */
.reply-form {
  margin: 20px 0 0 74px;
  background: #F5F0E6;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.reply-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #8B572A;
}

.reply-form:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.15);
  transform: translateX(4px);
}

.reply-form textarea {
  width: 100%;
  min-height: 100px;
  border: 2px solid #d9d9d9;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 16px;
  font-family: inherit;
  line-height: 1.7;
  box-sizing: border-box;
  background: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #434343;
}

.reply-form textarea::placeholder {
  color: #bfbfbf;
  font-style: italic;
  transition: color 0.2s ease;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
  background: #fff;
  transform: translateY(-2px);
}

.reply-form textarea:focus::placeholder {
  color: #8c8c8c;
}

.reply-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  align-items: center;
}

/* 发表按钮 */
.reply-submit {
  background: #8B572A;
  color: #fff;
  border: none;
  border-radius: 28px;
  padding: 12px 32px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(139, 87, 42, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reply-submit:hover:not(:disabled) {
  background: #A67C52;
  box-shadow: 0 6px 24px rgba(139, 87, 42, 0.6);
  transform: translateY(-2px) scale(1.05);
}

.reply-submit:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.reply-submit:disabled {
  background: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* 取消按钮 */
.reply-cancel {
  background: #fff;
  color: #595959;
  border: 2px solid #d9d9d9;
  border-radius: 28px;
  padding: 12px 32px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reply-cancel:hover {
  background: #fafafa;
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
}

.reply-cancel:active {
  transform: translateY(0) scale(0.98);
}

/* 登录提示 */
.login-tip {
  color: #ff4d4f;
  font-size: 15px;
  padding: 20px;
  margin: 20px 0 0 74px;
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%);
  border-radius: 16px;
  border: 2px solid rgba(255, 77, 79, 0.2);
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.1);
}

.login-tip:hover {
  border-color: rgba(255, 77, 79, 0.4);
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.2);
  transform: translateY(-1px);
}

/* 错误信息 */
.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 107, 107, 0.05) 100%);
  border-radius: 8px;
  border-left: 4px solid #ff4d4f;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.1);
  font-weight: 500;
}

/* 回复列表 */
.replies {
  margin: 20px 0 0 74px;
  padding-left: 24px;
  border-left: 3px solid #E5D9C5;
  position: relative;
}

.replies::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 0;
  width: 11px;
  height: 11px;
  background: #8B572A;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(139, 87, 42, 0.4);
}

/* 回复项 */
.reply-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #F5F0E6;
  border-radius: 12px;
  border: 2px solid #f0f2f5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.reply-item:hover {
  background: #fff;
  border-color: #1890ff;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
  transform: translateX(4px);
}

/* 简化的回复内容 */
.reply-content-simple {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-header-simple {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.username-simple {
  font-weight: 600;
  color: #8B572A;
  font-size: 15px;
}

.date-simple {
  color: #8c8c8c;
  font-size: 12px;
}

.comment-content-simple {
  color: #3E3A39;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  padding: 8px 0;
}

.reply-to-simple {
  color: #1890ff;
  font-weight: 500;
  margin-right: 4px;
}

.reply-actions-simple {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #8c8c8c;
  font-size: 13px;
}

/* 简化的按钮样式 */
.reply-btn-simple {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #8B572A;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
  z-index: 10;
  position: relative;
}

.reply-btn-simple:hover {
  background: rgba(139, 87, 42, 0.15);
  color: #8B572A;
  transform: translateY(-1px);
}

/* 简化的回复输入框 */
.reply-form-simple {
  margin: 12px 0 0 24px;
  background: #F5F0E6;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.reply-form-simple:hover {
  border-color: #8B572A;
  box-shadow: 0 2px 8px rgba(139, 87, 42, 0.1);
}

.reply-form-simple textarea {
  width: 100%;
  min-height: 70px;
  border: 2px solid #d9d9d9;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
  background: #fff;
  transition: all 0.3s ease;
}

.reply-form-simple textarea:focus {
  outline: none;
  border-color: #8B572A;
  box-shadow: 0 0 0 3px rgba(139, 87, 42, 0.2);
}

/* 简化的登录提示 */
.login-tip-simple {
  color: #ff4d4f;
  font-size: 13px;
  padding: 12px;
  margin: 12px 0 0 24px;
  background: rgba(255, 77, 79, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 77, 79, 0.2);
  text-align: center;
  font-weight: 500;
}

/* 更多回复按钮 */
.more-replies {
  margin-top: 16px;
  margin-bottom: 0;
  text-align: center;
}

.more-replies-btn {
  background: #8B572A;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 15px;
  padding: 12px 32px;
  border-radius: 28px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(139, 87, 42, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.more-replies-btn:hover {
  background: #A67C52;
  box-shadow: 0 6px 24px rgba(139, 87, 42, 0.6);
  transform: translateY(-2px) scale(1.05);
}

.more-replies-btn:active {
  transform: translateY(0) scale(0.98);
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 按钮点击反馈 */
.reply-btn:active,
.more-btn:active {
  transform: scale(0.92);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-item {
    padding: 20px;
    margin-bottom: 16px;
    border-radius: 12px;
  }
  
  .comment-header {
    gap: 14px;
  }
  
  .avatar {
    width: 48px;
    height: 48px;
  }
  
  .username { font-size: 16px; }
  .comment-content { font-size: 15px; line-height: 1.6; }
  
  .comment-meta {
    font-size: 13px;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .like-btn, .dislike-btn, .reply-btn, .more-btn {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
  
  .like-icon, .dislike-icon { font-size: 18px; }
  
  .reply-form, .login-tip {
    margin-left: 64px;
    padding: 16px;
  }
  
  .reply-form textarea {
    min-height: 90px;
    font-size: 15px;
    padding: 14px;
  }
  
  .reply-submit, .reply-cancel {
    padding: 10px 24px;
    font-size: 14px;
  }
  
  .replies {
    margin-left: 64px;
    padding-left: 16px;
  }
  
  .reply-item {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .reply-item .avatar {
    width: 44px;
    height: 44px;
  }
  
  .reply-item .comment-header { gap: 12px; }
  .reply-item .reply-form { margin-left: 56px; }
}

@media (max-width: 480px) {
  .comment-item {
    padding: 16px;
    margin-bottom: 12px;
    border-radius: 8px;
  }
  
  .comment-header { gap: 12px; }
  
  .avatar {
    width: 44px;
    height: 44px;
  }
  
  .username { font-size: 15px; }
  .comment-content { font-size: 14px; margin-bottom: 12px; }
  
  .comment-meta {
    font-size: 12px;
    gap: 12px;
  }
  
  .reply-form, .login-tip {
    margin-left: 56px;
    padding: 14px;
  }
  
  .reply-form textarea {
    min-height: 80px;
    font-size: 14px;
    padding: 12px;
  }
  
  .replies {
    margin-left: 56px;
    padding-left: 12px;
  }
  
  .reply-item {
    padding: 14px;
    margin-bottom: 12px;
  }
  
  .reply-item .avatar {
    width: 40px;
    height: 40px;
  }
  
  .more-replies-btn {
    padding: 10px 24px;
    font-size: 14px;
  }
}
</style>