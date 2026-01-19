<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <h1 class="page-title">
      <span class="icon">👤</span>
      个人资料
    </h1>

    <!-- 个人资料卡片 -->
    <div class="profile-card">
      <!-- 头像上传区域 -->
      <div class="avatar-section">
        <div 
          class="avatar-preview" 
          :style="{ backgroundImage: `url(${getAvatarUrl(formData.avatar)})` }"
          @click="triggerAvatarUpload"
        >
          <div class="avatar-overlay">
            <span class="overlay-text">更换头像</span>
          </div>
        </div>
        <input 
          type="file" 
          ref="avatarInput" 
          class="avatar-input" 
          @change="handleAvatarUpload"
        >
        <button 
          class="upload-btn" 
          @click="triggerAvatarUpload" 
          :disabled="isUploading"
        >
          {{ isUploading ? '上传中...' : '选择文件' }}
        </button>
        <p class="avatar-hint">支持 JPG、PNG、GIF，最大 5MB</p>
      </div>
      
      <!-- 表单区域 -->
      <div class="form-section">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username" 
            placeholder="输入用户名" 
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            placeholder="输入邮箱" 
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label for="bio">个人简介</label>
          <textarea 
            id="bio" 
            v-model="formData.bio" 
            placeholder="输入个人简介..." 
            class="form-control"
            rows="4"
          ></textarea>
          <div class="char-count" :class="{ 'limit': formData.bio.length > 200 }">
            {{ formData.bio.length }}/200
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button 
          class="reset-btn" 
          @click="resetForm"
          :disabled="isSubmitting"
        >
          重置
        </button>
        <button 
          class="save-btn" 
          @click="updateProfile" 
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getUserById, updateUserInfo } from '@/api/auth';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const avatarInput = ref(null);
const isSubmitting = ref(false);
const isUploading = ref(false);

// 初始数据，用于重置表单
const initialData = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: ''
});

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: ''
});

// 初始化获取用户信息
onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    try {
      const userInfo = await getUserById(authStore.user.id);
      formData.username = userInfo.username || '';
      formData.email = userInfo.email || '';
      formData.bio = userInfo.bio || '';
      formData.avatar = userInfo.avatar || '/default-avatar.png';
      
      // 保存初始数据
      Object.assign(initialData, { ...formData });
    } catch (error) {
      ElMessage.error('获取用户信息失败');
    }
  }
});

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('头像大小不能超过5MB');
      return;
    }
    
    isUploading.value = true;
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('avatar', file);
      
      // 调用上传头像API
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: uploadFormData
      });
      
      if (!response.ok) {
        throw new Error('上传失败');
      }
      
      const data = await response.json();
      if (data.success) {
        formData.avatar = data.data.avatar;
        ElMessage.success('头像上传成功');
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (error) {
      ElMessage.error('上传头像失败');
    } finally {
      isUploading.value = false;
    }
  }
};

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value.click();
};

// 处理头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) {
    return '/api/head/default-avatar.png';
  }
  
  // 如果头像已经是完整URL，直接返回
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // 如果头像已经以/api开头，直接返回
  if (avatar.startsWith('/api')) {
    return avatar;
  }
  
  // 如果头像以/开头，添加/api前缀
  if (avatar.startsWith('/')) {
    return `/api${avatar}`;
  }
  
  // 否则，添加/api/head前缀
  return `/api/head/${avatar}`;
};

// 重置表单
const resetForm = () => {
  // 重置表单数据
  Object.assign(formData, { ...initialData });
  ElMessage.info('表单已重置');
};

// 更新个人资料
const updateProfile = async () => {
  if (!authStore.user || !authStore.user.id) {
    ElMessage.error('用户未登录');
    return;
  }
  
  // 表单验证
  if (!formData.username.trim()) {
    ElMessage.warning('用户名不能为空');
    return;
  }
  
  if (!formData.email.trim()) {
    ElMessage.warning('邮箱不能为空');
    return;
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    ElMessage.warning('请输入有效的邮箱地址');
    return;
  }
  
  isSubmitting.value = true;
  try {
    await updateUserInfo(authStore.user.id, {
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      avatar: formData.avatar
    });
    
    // 更新store中的用户信息
    authStore.updateUser({ username: formData.username });
    
    // 更新初始数据
    Object.assign(initialData, { ...formData });
    
    ElMessage.success('个人资料更新成功');
  } catch (error) {
    ElMessage.error('更新失败');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 全局变量 - 与其他管理页面保持一致 */
:root {
  --primary-color: #409eff;
  --primary-dark: #3390e9;
  --primary-light: #66b1ff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --text-primary: #000000;
  --text-regular: #000000;
  --text-secondary: #333333;
  --text-placeholder: #666666;
  --border-color: #e4e7ed;
  --border-light: #ebeef5;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 24px 0 rgba(0, 0, 0, 0.15);
  --transition-base: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  --transition-fast: all 0.2s ease-in-out;
  --divider-color: linear-gradient(90deg, transparent, var(--border-color), transparent);
}

/* 基础样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 个人资料容器 */
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

/* 页面头部样式 */
.page-header {
  margin-bottom: 32px;
  text-align: center;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  padding: 24px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-title .icon {
  font-size: 36px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 个人资料卡片样式 */
.profile-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
  position: relative;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-base);
}

/* 卡片头部样式 */
.card-header {
  padding: 28px 32px;
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(135deg, var(--border-light), #f8f9fa);
  text-align: center;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.card-title::before {
  content: '';
}

.card-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 卡片内容样式 */
.card-body {
  padding: 32px;
}

/* 个人资料头部 */
.profile-header {
  margin-bottom: 32px;
}

/* 头像上传区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
}

.avatar-container {
  position: relative;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--bg-color);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 4px solid var(--primary-color);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.2);
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.avatar-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.3);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition-base);
  color: white;
  border-radius: 50%;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 32px;
  margin-bottom: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.overlay-text {
  font-size: 14px;
  font-weight: 600;
}

/* 头像信息区域 */
.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.info-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text.size-limit {
  color: var(--warning-color);
  font-weight: 500;
}

/* 表单分隔线 */
.form-divider {
  height: 1px;
  background: var(--divider-color);
  margin: 32px 0;
  position: relative;
}

.form-divider::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-bg);
  padding: 0 20px;
  color: var(--text-placeholder);
  font-size: 12px;
}

/* 表单区域 */
.form-section {
  margin-top: 24px;
}

.form-row {
  margin-bottom: 24px;
}

.form-group {
  position: relative;
}

.form-group.full-width {
  width: 100%;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--text-regular);
  font-weight: 600;
  font-size: 14px;
  transition: var(--transition-fast);
}

.label-icon {
  font-size: 16px;
  color: var(--primary-color);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper.textarea-wrapper {
  align-items: flex-start;
}

.form-control {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-primary);
  background-color: var(--card-bg);
  transition: var(--transition-base);
  outline: none;
  font-family: inherit;
  box-shadow: var(--shadow-sm);
}

.form-control.input-focused,
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-placeholder);
  font-size: 16px;
  transition: var(--transition-fast);
  z-index: 1;
}

.input-wrapper.textarea-wrapper .input-icon {
  top: 16px;
  transform: none;
}

.form-control.input-focused + .input-icon,
.form-control:focus + .input-icon {
  color: var(--primary-color);
  transform: translateY(-50%) scale(1.1);
}

.textarea-wrapper .form-control.input-focused + .input-icon,
.textarea-wrapper .form-control:focus + .input-icon {
  transform: scale(1.1);
}

textarea.form-control {
  min-height: 150px;
  resize: vertical;
  line-height: 1.6;
  padding-top: 16px;
  padding-bottom: 16px;
}

/* 字符计数 */
.char-count {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
  transition: var(--transition-fast);
}

.char-count.char-limit {
  color: var(--danger-color);
  font-weight: 600;
}

/* 卡片底部样式 */
.card-footer {
  padding: 24px 32px;
  border-top: 1px solid var(--border-light);
  background: linear-gradient(135deg, #fafafa, #f5f7fa);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.update-icon {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 按钮样式 */
.save-btn, .upload-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  letter-spacing: 0.5px;
  min-width: 120px;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.save-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: black;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

.upload-btn {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  color: black;
  border: 2px solid rgba(64, 158, 255, 0.2);
  min-width: 140px;
}

.upload-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: black;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  color: black;
}

.reset-btn {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.1), rgba(144, 147, 153, 0.05));
  color: black;
  border: 2px solid rgba(144, 147, 153, 0.2);
  min-width: 100px;
}

.reset-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--info-color), #a6a9ad);
  color: black;
  border-color: var(--info-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.3);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 16px;
}

/* 头像输入隐藏 */
.avatar-input {
  display: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-container {
    padding: 20px 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-title .icon {
    font-size: 28px;
  }
  
  .card-body,
  .card-header,
  .card-footer {
    padding: 20px 16px;
  }
  
  .avatar-section {
    gap: 24px;
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-preview {
    width: 120px;
    height: 120px;
  }
  
  .avatar-info {
    align-items: center;
  }
  
  .footer-content {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: stretch;
  }
  
  .save-btn, .upload-btn, .reset-btn {
    width: 100%;
  }
  
  .form-row {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .form-control {
    padding: 12px 14px 12px 40px;
    font-size: 14px;
  }
  
  .input-icon {
    left: 14px;
    font-size: 14px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-card {
  animation: fadeInUp 0.6s ease-out;
}

.avatar-section,
.form-section {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}
</style>