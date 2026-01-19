<template>
  <div class="article-edit">
    <h1 class="page-title">{{ isEditing ? '编辑文章' : '新建文章' }}</h1>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div class="edit-container">
      <!-- 左侧编辑区域 -->
      <div class="main-content">
        <!-- 标题输入 -->
        <div class="form-group">
          <label for="title">文章标题 <span class="required">*</span></label>
          <input v-model="form.title" id="title" type="text" placeholder="请输入文章标题" class="form-control" required
            maxlength="255" @input="validateTitle">
          <div class="input-footer">
            <span class="char-counter">{{ form.title.length }}/255</span>
            <p v-if="validationErrors.title" class="error-text">{{ validationErrors.title }}</p>
          </div>
        </div>

        <!-- 摘要输入 -->
        <div class="form-group">
          <label for="excerpt">文章摘要</label>
          <textarea v-model="form.excerpt" id="excerpt" placeholder="请输入文章摘要（可选）" class="form-control" rows="4"
            maxlength="500"></textarea>
          <div class="input-footer">
            <span class="char-counter">{{ form.excerpt.length }}/500</span>
          </div>
        </div>

        <!-- 富文本编辑器 -->
        <div class="form-group">
          <label for="editor">文章内容 <span class="required">*</span></label>
          <div id="editor" style="height: 500px; padding: 10px; background: white;"></div>
          <div class="input-footer">
            <p v-if="validationErrors.content" class="error-text">{{ validationErrors.content }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧设置面板 -->
      <div class="side-panel">
        <!-- 发布设置 -->
        <div class="panel-section">
          <h3>发布设置</h3>

          <!-- 分类选择 -->
          <div class="form-group">
            <label for="articleType">文章分类 <span class="required">*</span></label>
            <select v-model="form.articleType" id="articleType" class="form-control" required>
              <option value="">请选择分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <p v-if="validationErrors.articleType" class="error-text">{{ validationErrors.articleType }}</p>
          </div>

          <!-- 发布状态 -->
          <div class="form-group">
            <label for="status">发布状态</label>
            <select v-model="form.status" id="status" class="form-control">
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="pending">待审核</option>
            </select>
          </div>

          <!-- 封面图上传 -->
        <div class="form-group">
          <label>封面图片</label>
          <div class="image-uploader">
            <label for="coverImage" class="upload-label">
              <div v-if="!form.coverImage" class="upload-placeholder">
                <i class="icon-upload"></i>
                <p>点击上传封面图片</p>
              </div>
              <img v-else :src="form.coverImage" class="preview-image" alt="封面预览" 
                   @error="form.coverImage = ''" />
            </label>
            <input type="file" id="coverImage" accept="image/*" @change="handleCoverImage" class="upload-input" />
            <div v-if="form.coverImage" class="image-actions">
              <button type="button" @click="form.coverImage = null; form.coverImageFile = null" class="btn-remove">
                移除
              </button>
            </div>
          </div>
        </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button @click="handleSubmit" class="btn btn-primary btn-block" :disabled="isSubmitting">
              <span v-if="isSubmitting">处理中...</span>
              <span v-else>{{ isEditing ? '更新文章' : '发布文章' }}</span>
            </button>
            <button @click="handleSaveDraft" class="btn btn-secondary btn-block" :disabled="isSubmitting">
              保存草稿
            </button>
            <button @click="handleCancel" class="btn btn-cancel btn-block" :disabled="isSubmitting">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { ElMessage } from 'element-plus';
import E from 'wangeditor';
import { uploadImage } from '@/api/upload';

const route = useRoute();
const router = useRouter();
const articleStore = useArticleStore();

// 计算属性：是否为编辑状态
const isEditing = computed(() => !!route.params.id);

// 表单数据
const form = ref({
  title: '',
  content: '',
  excerpt: '',
  articleType: '',
  coverImage: '',
  coverImageFile: null,
  status: 'draft'
});

// 编辑器实例
const editor = ref(null);

// 加载状态
const isSubmitting = ref(false);

// 错误信息
const error = ref('');
const successMessage = ref('');

// 验证错误
const validationErrors = ref({
  title: '',
  content: '',
  articleType: ''
});

// 分类列表 - 使用默认分类
const categories = ref([
  { id: 1, name: '前端' },
  { id: 2, name: '后端' },
  { id: 3, name: 'UI' },
  { id: 4, name: '游戏' },
  { id: 5, name: '音乐' },
  { id: 6, name: '文学' },
  { id: 7, name: '运维' },
  { id: 8, name: '生活' },
  { id: 9, name: '其他' }
]);

// 初始化编辑器
const initEditor = () => {
  const editorInstance = new E('#editor');
  
  editorInstance.config.onchange = (html) => {
    form.value.content = html;
    validateContent();
  };
  
  // 配置图片上传
  editorInstance.config.uploadImgServer = '/api/posts/upload';
  editorInstance.config.uploadImgMaxSize = 5 * 1024 * 1024; // 5MB
  editorInstance.config.uploadImgAccept = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  editorInstance.config.uploadImgMaxLength = 10; // 最多上传10张
  editorInstance.config.uploadFileName = 'image';
  
  // 处理图片上传回调
  editorInstance.config.uploadImgHooks = {
    customInsert: function(insertImgFn, result) {
      // 假设服务器返回 { success: true, data: { url: '图片地址' } }
      if (result.success && result.data && result.data.url) {
        insertImgFn(result.data.url);
      } else {
        ElMessage.error('图片上传失败: ' + (result.message || '未知错误'));
      }
    }
  };
  
  editorInstance.config.placeholder = '在这里写下你的精彩内容...';
  
  editorInstance.config.menus = [
    'head',
    'bold',
    'fontSize',
    'fontName',
    'italic',
    'underline',
    'strikeThrough',
    'indent',
    'lineHeight',
    'foreColor',
    'backColor',
    'link',
    'list',
    'todo',
    'justify',
    'quote',
    'emoticon',
    'table',
    'code',
    'splitLine',
    'undo',
    'redo',
    'uploadImg' // 添加图片上传菜单项
  ];
  
  editorInstance.create();
  editor.value = editorInstance;
  
  if (form.value.content) {
    editorInstance.txt.html(form.value.content);
  }
};



// 加载文章数据
const loadArticle = async () => {
  if (isEditing.value) {
    try {
      // 使用普通文章API端点，这是系统中正确的端点格式
      const response = await fetch(`/api/articles/${route.params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('获取文章失败，HTTP状态码: ' + response.status);
      }
      
      const result = await response.json();
      console.log('加载到的文章响应:', result);
      
      // 检查响应结构，系统返回的数据格式是 { success: true, data: article }
      if (!result.success || !result.data) {
        throw new Error('获取到的数据格式不正确: ' + (result.message || '未知错误'));
      }
      
      const data = result.data;
      
      // 确保content字段存在
      const content = data.content || '';
      
      // 更新表单数据，注意字段映射关系
  form.value = {
    title: data.title || '',
    content: content,
    excerpt: data.excerpt || '',
    // 确保文章类型有默认值，避免空字符串
    articleType: data.article_type || '1', // 注意字段名是 article_type，不是 articleType
    coverImage: data.cover_image || '', // 注意字段名是 cover_image，不是 coverImage
    coverImageFile: null,
    status: data.status || 'draft'
  };
      
      // 确保编辑器已初始化，然后设置内容
      if (editor.value) {
        // 延迟设置内容，确保编辑器已完全初始化
        setTimeout(() => {
          editor.value.txt.html(content);
          console.log('编辑器内容已设置:', content.substring(0, 50) + '...');
        }, 100);
      } else {
        console.error('编辑器尚未初始化');
        // 如果编辑器还没初始化，初始化它
        initEditor();
        // 延迟设置内容
        setTimeout(() => {
          if (editor.value) {
            editor.value.txt.html(content);
          }
        }, 200);
      }
    } catch (err) {
      error.value = '加载文章失败: ' + err.message;
      console.error('加载文章失败:', err);
    }
  }
};

// 验证标题
const validateTitle = () => {
  if (!form.value.title.trim()) {
    validationErrors.value.title = '标题不能为空';
    return false;
  }
  if (form.value.title.length < 3) {
    validationErrors.value.title = '标题至少需要3个字符';
    return false;
  }
  validationErrors.value.title = '';
  return true;
};

// 验证内容
const validateContent = () => {
  if (!form.value.content.trim()) {
    validationErrors.value.content = '内容不能为空';
    return false;
  }
  if (form.value.content.length < 10) {
    validationErrors.value.content = '内容至少需要10个字符';
    return false;
  }
  validationErrors.value.content = '';
  return true;
};

// 验证表单
const validateForm = () => {
  let isValid = true;
  
  // 确保从编辑器获取最新内容
  if (editor.value) {
    form.value.content = editor.value.txt.html();
  }
  
  if (!validateTitle()) {
    isValid = false;
  }
  
  if (!validateContent()) {
    isValid = false;
  }
  
  // 确保文章类型有有效值
  if (!form.value.articleType || form.value.articleType === '') {
    validationErrors.value.articleType = '请选择文章分类';
    // 设置默认文章类型
    form.value.articleType = '1';
    isValid = false;
  } else {
    validationErrors.value.articleType = '';
  }
  
  console.log('验证结果:', { isValid, form: form.value });
  return isValid;
};

// 处理封面图上传
const handleCoverImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.match('image.*')) {
    error.value = '请上传有效的图片文件';
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过5MB';
    return;
  }

  try {
    form.value.coverImageFile = file;
    form.value.coverImage = URL.createObjectURL(file);
    error.value = '';
  } catch (err) {
    error.value = '图片预览失败: ' + err.message;
    console.error('图片预览失败:', err);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  error.value = '';
  successMessage.value = '';
  
  try {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('content', form.value.content);
    formData.append('excerpt', form.value.excerpt);
    formData.append('status', form.value.status);
    
    // 根据请求类型使用不同的字段名
    const coverImageFieldName = isEditing.value ? 'cover_image' : 'coverImage';
    const articleTypeFieldName = isEditing.value ? 'article_type' : 'articleType';
    
    formData.append(articleTypeFieldName, form.value.articleType);
    
    if (form.value.coverImageFile) {
      formData.append(coverImageFieldName, form.value.coverImageFile);
    }
    
    let response;
    const url = isEditing.value ? `/api/articles/${route.params.id}` : '/api/articles';
    const method = isEditing.value ? 'PUT' : 'POST';
    
    const token = localStorage.getItem('token');
    console.log('发送请求:', { url, method, hasToken: !!token, tokenLength: token ? token.length : 0 });
    console.log('表单数据:', {
      title: form.value.title,
      content: form.value.content.substring(0, 50) + '...',
      excerpt: form.value.excerpt,
      articleType: form.value.articleType,
      status: form.value.status,
      hasCoverImage: !!form.value.coverImageFile
    });
    
    // 创建请求头，只有当token存在时才添加Authorization
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    response = await fetch(url, {
      method: method,
      body: formData,
      headers: headers
    });
    
    console.log('响应状态:', response.status, response.statusText);
    
    let result;
    try {
      result = await response.json();
      console.log('响应数据:', result);
    } catch (jsonError) {
      console.error('JSON解析错误:', jsonError);
      throw new Error(`服务器响应格式错误 (${response.status} ${response.statusText})`);
    }
    
    if (!response.ok) {
      // 从服务器响应中获取更详细的错误信息
      let errorMessage = result.message || `操作失败 (${response.status} ${response.statusText})`;
      
      // 处理认证错误
      if (response.status === 401) {
        errorMessage = '身份验证失败，请重新登录';
        // 清除无效令牌
        localStorage.removeItem('token');
        // 跳转到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
      
      throw new Error(errorMessage);
    }
    
    successMessage.value = isEditing ? '文章更新成功' : '文章创建成功';
    
    // 跳转回文章列表
    setTimeout(() => {
      router.push('/admin/articles');
    }, 1500);
  } catch (err) {
    console.error('提交表单失败:', err);
    error.value = `操作失败: ${err.message}`;
    // 显示更友好的错误提示
    ElMessage.error(`操作失败: ${err.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

// 保存为草稿
const handleSaveDraft = () => {
  form.value.status = 'draft';
  handleSubmit();
};

// 取消操作
const handleCancel = () => {
  router.push('/admin/articles');
};

// 生命周期钩子
onMounted(() => {
  initEditor();
  loadArticle();
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
    editor.value = null;
  }
});
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;
  --border-color: #e4e7ed;
  --border-light: #ebeef5;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 24px 0 rgba(0, 0, 0, 0.15);
  --transition-base: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  --transition-fast: all 0.2s ease-in-out;
}

.article-edit {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-light);
}

/* 提示信息 */
.error-message {
  background: linear-gradient(135deg, #fef0f0, #fdf2f2);
  color: var(--danger-color);
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #fbc4c4;
  box-shadow: var(--shadow-sm);
}

.success-message {
  background: linear-gradient(135deg, #f0f9eb, #f6ffed);
  color: var(--success-color);
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #b7eb8f;
  box-shadow: var(--shadow-sm);
}

.edit-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--danger-color);
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--card-bg);
  transition: var(--transition-base);
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.char-counter {
  font-weight: 500;
}

.error-text {
  color: var(--danger-color);
  margin: 0;
  font-size: 12px;
}

/* 编辑器样式 */
#editor {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
}

/* 侧边栏样式 */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel-section {
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.panel-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

/* 图片上传样式 */
.image-uploader {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: var(--card-bg);
  transition: var(--transition-base);
}

.image-uploader:hover {
  border-color: var(--primary-color);
  background-color: rgba(64, 158, 255, 0.05);
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 6px;
  transition: var(--transition-base);
}

.preview-image:hover {
  transform: scale(1.02);
}

.upload-input {
  display: none;
}

.image-actions {
  margin-top: 12px;
}

.btn-remove {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: var(--danger-color);
  border: 1px solid rgba(245, 108, 108, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: var(--transition-base);
}

.btn-remove:hover {
  background: linear-gradient(135deg, var(--danger-color), #f78989);
  color: pink;
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition-base);
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: black;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-height: 44px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: black !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  background: linear-gradient(135deg, #3390e9, #53a8ff);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--border-light), #f8f9fa);
  color: black !important;
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e6e8eb, #d9dbdf);
  color: var(--text-primary) !important;
}

.btn-cancel {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: black !important;
  border: 1px solid rgba(245, 108, 108, 0.2);
}

.btn-cancel:hover {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.2), rgba(245, 108, 108, 0.1));
  color: var(--danger-color) !important;
}

.btn-block {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .edit-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .article-edit {
    padding: 16px;
  }
  
  .form-group {
    padding: 16px;
  }
  
  #editor {
    height: 300px;
  }
}
</style>