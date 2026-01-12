<template>
  <div class="comment-item">
    <div class="comment-header">
      <img :src="getCommentAvatar(comment.user?.avatar)" alt="用户头像" class="avatar" />
      <span class="username">{{ comment.username }}</span>
      <span class="date">{{ formatDate(comment.created_at) }}</span>
      <button class="reply-btn" @click="showReply = !showReply">回复</button>
    </div>
    <div class="comment-content">
      <template v-if="comment.reply_to_username">
        <span class="at-user">@{{ comment.reply_to_username }}</span>
      </template>
      {{ comment.content }}
    </div>
    <!-- 回复输入框 -->
    <div v-if="showReply && isAuthenticated" class="reply-form">
      <textarea v-model="replyContent" placeholder="写下你的回复..." />
      <div class="reply-actions">
        <button class="reply-submit" @click="submitReply" :disabled="!replyContent.trim()">提交</button>
        <button class="reply-cancel" @click="showReply = false">取消</button>
      </div>
    </div>
    <div v-else-if="showReply && !isAuthenticated" class="reply-form">
      <span class="login-tip">请先登录后再回复</span>
    </div>
    <!-- 子评论递归渲染 -->
    <div class="replies" v-if="comment.replies && comment.replies.length">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :isAuthenticated="isAuthenticated"
        @reply="handleReply"
      />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { formatDate } from '@/utils/format'
const props = defineProps({
  comment: Object,
  isAuthenticated: Boolean
})
const emit = defineEmits(['reply'])
const showReply = ref(false)
const replyContent = ref('')
function submitReply() {
  if (!replyContent.value.trim()) return
  emit('reply', {
    content: replyContent.value.trim(),
    parent_id: props.comment.id,
    root_id: props.comment.root_id || props.comment.id,
    reply_to_user_id: props.comment.user_id,
    reply_to_username: props.comment.username
  })
  replyContent.value = ''
  showReply.value = false
}
function handleReply(replyData) {
  emit('reply', replyData)
}
function getCommentAvatar(avatar) {
  if (avatar) {
    if (avatar.startsWith('/')) {
      return '/api' + avatar;
    }
    return avatar;
  }
  return '/api/head/2222.jpg';
}
</script>
<style scoped>
.comment-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(60,60,60,0.06);
  padding: 1.2rem 1.5rem 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.2s;
}
.comment-item:hover {
  box-shadow: 0 4px 16px rgba(66,185,131,0.10);
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 0.3rem;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(60,60,60,0.10);
  object-fit: cover;
  border: 2px solid #e6f9f0;
}
.username {
  font-weight: 600;
  color: #42b983;
  margin-left: 0.7rem;
  font-size: 1.08em;
}
.date {
  color: #b0b0b0;
  font-size: 0.92em;
  margin-left: 1.2rem;
}
.reply-btn {
  margin-left: auto;
  color: #42b983;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.98em;
  padding: 0.2em 0.7em;
  border-radius: 6px;
  transition: background 0.2s;
}
.reply-btn:hover {
  background: #e6f9f0;
}
.comment-content {
  color: #333;
  font-size: 1.08em;
  line-height: 1.7;
  margin: 0.5rem 0 0.2rem 0;
  word-break: break-all;
}
.reply-form {
  margin-top: 0.7rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.7rem 1rem 0.8rem 1rem;
  box-shadow: 0 1px 4px rgba(60,60,60,0.04);
}
.reply-form textarea {
  width: 100%;
  min-height: 48px;
  border: 1px solid #d6e9e0;
  border-radius: 6px;
  padding: 0.5em 0.8em;
  font-size: 1em;
  resize: vertical;
  margin-bottom: 0.6em;
  background: #fff;
  transition: border 0.2s;
}
.reply-form textarea:focus {
  border: 1.5px solid #42b983;
  outline: none;
}
.reply-actions {
  display: flex;
  gap: 0.7em;
}
.reply-submit {
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.35em 1.2em;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}
.reply-submit:disabled {
  background: #b0e5d0;
  cursor: not-allowed;
}
.reply-submit:hover:not(:disabled) {
  background: #369e6f;
}
.reply-cancel {
  background: #f5f5f5;
  color: #888;
  border: none;
  border-radius: 6px;
  padding: 0.35em 1.2em;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}
.reply-cancel:hover {
  background: #e0e0e0;
}
.login-tip {
  color: #ff5252;
  font-size: 1em;
}
.replies {
  margin-left: 2.2rem;
  margin-top: 0.7rem;
  border-left: 2.5px solid #e6f9f0;
  padding-left: 1.2rem;
}
.at-user {
  color: #42b983;
  font-weight: 600;
  margin-right: 0.3em;
}
</style> 