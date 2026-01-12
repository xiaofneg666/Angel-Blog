<template>
  
  <div class="create-post-container">
    <NavBar />
    <div class="create-post-card">
      <h1 class="create-post-title">创作新文章</h1>
      
      <form @submit.prevent="handleSubmit" class="post-form">
        <!-- 标题 -->
        <div class="form-group">
          <label for="title" class="form-label">
            文章标题 <span class="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            required
            maxlength="255"
            placeholder="输入吸引人的标题..."
            class="form-input"
            :class="{ 'input-error': !validation.title.valid }"
            @input="validateField('title')"
          />
          <div class="input-footer">
            <p v-if="!validation.title.valid" class="error-message">
              <i class="icon-error"></i> {{ validation.title.message }}
            </p>
            <span class="char-counter">{{ form.title.length }}/255</span>
          </div>
        </div>

        <!-- 摘要 -->
        <div class="form-group">
          <label for="excerpt" class="form-label">
            文章摘要
            <span class="hint">（选填，用于文章列表预览）</span>
          </label>
          <textarea
            id="excerpt"
            v-model="form.excerpt"
            maxlength="500"
            rows="3"
            placeholder="用简洁的文字概括文章内容..."
            class="form-textarea"
          ></textarea>
          <div class="input-footer">
            <span class="char-counter">{{ form.excerpt.length }}/500</span>
          </div>
        </div>

        <!-- 内容 -->
        <div class="form-group">
          <label for="content" class="form-label">
            文章内容 <span class="required">*</span>
          </label>
          <div id="editor" style="height: 400px; padding: 10px; background: white;"></div>
          <div class="input-footer">
            <p v-if="!validation.content.valid" class="error-message">
              <i class="icon-error"></i> {{ validation.content.message }}
            </p>
            <span class="char-counter">{{ form.content.length }} 字</span>
          </div>
        </div>

        <!-- 封面图 -->
        <div class="form-group">
          <label class="form-label">
            封面图片
            <span class="hint">（选填，建议尺寸 1200×630px）</span>
          </label>
          <div class="image-uploader">
            <label for="coverImage" class="upload-label">
              <div v-if="!form.coverImage" class="upload-placeholder">
                <i class="icon-upload"></i>
                <p>点击上传封面图片</p>
              </div>
              <img v-else :src="form.coverImage" class="preview-image" alt="封面预览"/>
            </label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              @change="handleCoverImage"
              class="upload-input"
            />
            <div v-if="form.coverImage" class="image-actions">
              <button type="button" @click="form.coverImage = null" class="btn-remove">
                <i class="icon-delete"></i> 移除
              </button>
            </div>
          </div>
        </div>

        <!-- 分类 -->
        <div class="form-group">
          <label for="articleType" class="form-label">
            文章分类 <span class="required">*</span>
          </label>
          <select
            id="articleType"
            v-model="form.articleType"
            required
            class="form-select"
          >
            <option value="">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="btn-submit">
            <span v-if="isSubmitting">
              <i class="icon-loading"></i> 发布中...
            </span>
            <span v-else>
              <i class="icon-publish"></i> 发布文章
            </span>
          </button>
          
          <p v-if="error" class="error-message global-error">
            <i class="icon-error"></i> {{ error }}
          </p>
        </div>
      </form>

      <!-- 敏感词检查结果提示 -->
      <div v-if="sensitiveWords" class="sensitive-words-warning">
        <el-alert
          title="文章包含敏感词"
          type="warning"
          :closable="false"
          show-icon
        >
          <div class="sensitive-words-content">
            <p>您的文章包含以下敏感词，请修改后重新提交：</p>
            <div v-if="sensitiveWords.title && sensitiveWords.title.length > 0">
              <h4>标题中的敏感词：</h4>
              <el-tag
                v-for="word in sensitiveWords.title"
                :key="word"
                type="danger"
                class="sensitive-word-tag"
              >
                {{ word }}
              </el-tag>
            </div>
            <div v-if="sensitiveWords.content && sensitiveWords.content.length > 0">
              <h4>内容中的敏感词：</h4>
              <el-tag
                v-for="word in sensitiveWords.content"
                :key="word"
                type="danger"
                class="sensitive-word-tag"
              >
                {{ word }}
              </el-tag>
            </div>
            <div v-if="sensitiveWords.excerpt && sensitiveWords.excerpt.length > 0">
              <h4>摘要中的敏感词：</h4>
              <el-tag
                v-for="word in sensitiveWords.excerpt"
                :key="word"
                type="danger"
                class="sensitive-word-tag"
              >
                {{ word }}
              </el-tag>
            </div>
            <div class="sensitive-words-actions">
              <el-button type="primary" @click="handleEdit">修改文章</el-button>
              <el-button type="warning" @click="handleSubmitAnyway">仍要提交</el-button>
            </div>
          </div>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { useAuthStore } from '@/stores/authStore';
import { uploadImage } from '@/api/upload';
import E from 'wangeditor';
import { ElMessage } from 'element-plus';

const router = useRouter();
const articleStore = useArticleStore();
const authStore = useAuthStore();

// 检查认证状态
if (!authStore.isAuthenticated) {
  router.push('/login');
}

const form = ref({
  title: '',
  content: '',
  excerpt: '',
  articleType: '',
  coverImageFile: null
});

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

const sensitiveWords = ref(null);
const isSubmitting = ref(false);
const error = ref('');

const validation = ref({
  title: { valid: true, message: '' },
  content: { valid: true, message: '' }
});

const editor = ref(null);

const validateField = (field) => {
  if (field === 'title') {
    validation.value.title.valid = form.value.title.length >= 3;
    validation.value.title.message = validation.value.title.valid 
      ? '' 
      : '标题至少需要3个字符';
  }
  if (field === 'content') {
    validation.value.content.valid = form.value.content.length >= 50;
    validation.value.content.message = validation.value.content.valid 
      ? '' 
      : '内容至少需要50个字符';
  }
};

const handleCoverImage = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.match('image.*')) {
    error.value = '请上传有效的图片文件';
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过5MB';
    return;
  }

  form.value.coverImageFile = file;
  form.value.coverImage = URL.createObjectURL(file);
  error.value = '';
};

const validateForm = () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return false
  }
  
  if (form.value.title.length < 5 || form.value.title.length > 100) {
    ElMessage.warning('标题长度应在5-100个字符之间')
    return false
  }
  
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return false
  }
  
  if (form.value.content.length < 10) {
    ElMessage.warning('文章内容不能少于10个字符')
    return false
  }
  
  if (!form.value.articleType) {
    ElMessage.warning('请选择文章分类')
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', form.value.title);
    formDataToSend.append('content', form.value.content);
    formDataToSend.append('excerpt', form.value.excerpt);
    formDataToSend.append('articleType', form.value.articleType);
    if (form.value.coverImageFile) {
      formDataToSend.append('coverImage', form.value.coverImageFile);
    }
    
    const response = await articleStore.addArticle(formDataToSend);
    console.log('创建文章响应:', response);
    
    if (response.sensitiveWords) {
      // 显示敏感词警告
      showSensitiveWordsWarning(response.sensitiveWords);
      // 跳转到个人主页
      ElMessage.warning('文章包含敏感词，已提交等待审核');
      router.push(`/myhomeview/${authStore.user.id}`);
    } else {
      // 文章创建成功
      ElMessage.success('文章发布成功！');
      // 跳转到个人主页，这样可以看到新文章
      router.push(`/myhomeview/${authStore.user.id}`);
    }
  } catch (error) {
    console.error('提交文章失败:', error);
    ElMessage.error(error.message || '提交文章失败，请稍后重试');
  }
};

const handleSubmitAnyway = async () => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', form.value.title);
    formDataToSend.append('content', form.value.content);
    formDataToSend.append('excerpt', form.value.excerpt);
    formDataToSend.append('articleType', form.value.articleType);
    if (form.value.coverImageFile) {
      formDataToSend.append('coverImage', form.value.coverImageFile);
    }
    
    const response = await articleStore.addArticle(formDataToSend);
    console.log('强制提交响应:', response);
    
    if (response.sensitiveWords) {
      // 显示敏感词警告
      showSensitiveWordsWarning(response.sensitiveWords);
      // 跳转到个人主页
      ElMessage.warning('文章包含敏感词，请修改后重新提交');
      router.push(`/myhomeview/${authStore.user.id}`);
    } else {
      // 文章创建成功
      ElMessage.success('文章已提交，等待管理员审核');
      // 跳转到文章详情页
      router.push(`/posts/${response.id}`);
    }
  } catch (error) {
    console.error('提交文章失败:', error);
    ElMessage.error(error.message || '提交文章失败，请稍后重试');
  }
};

const handleEdit = () => {
  sensitiveWords.value = null;
};

const showSensitiveWordsWarning = (sensitiveWords) => {
  // 显示敏感词警告
  ElMessage.warning('文章包含敏感词，请修改后重新提交');
  
  // 设置敏感词信息
  sensitiveWords.value = sensitiveWords;
};

onMounted(() => {
  const editorInstance = new E('#editor');
  
  editorInstance.config.onchange = (html) => {
    form.value.content = html;
    validateField('content');
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
    'redo'
  ];
  
  editorInstance.create();
  editor.value = editorInstance;
  
  if (form.value.content) {
    editorInstance.txt.html(form.value.content);
  }
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
    editor.value = null;
  }
});
</script>

<style scoped>
.create-post-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.create-post-card {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
}

.create-post-title {
  font-size: 2.3rem;
  color: #333;
  margin-bottom: 2.2rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 1.08rem;
}

.required {
  color: #ff4d4f;
}

.hint {
  font-size: 0.92rem;
  color: #888;
  font-weight: normal;
}

.form-input,
.form-textarea,
.form-select {
  padding: 1rem;
  border: 1.5px solid #d9d9d9;
  border-radius: 8px;
  font-size: 1.08rem;
  transition: all 0.3s;
  box-shadow: 0 1px 4px rgba(24, 144, 255, 0.04);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.13);
  outline: none;
}

.input-error {
  border-color: #ff4d4f;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.error-message {
  color: #ff4d4f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.char-counter {
  color: #888;
}

/* 编辑器区域防止遮挡导航栏 */
#create-post-editor, #editor {
  margin-top: 1.5rem;
  padding-top: 1.2rem;
  z-index: 1;
}

/* 美化封面图片上传区域 */
.image-uploader {
  border: 2px dashed #b3d8fd;
  border-radius: 14px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  background: #f8fbff;
  transition: border 0.3s, background 0.3s;
}
.image-uploader:hover {
  border-color: #40a9ff;
  background: #e6f4ff;
}
.upload-label {
  display: block;
  cursor: pointer;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  color: #40a9ff;
  font-size: 1.1rem;
  opacity: 0.85;
}
.preview-image {
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.13);
  transition: transform 0.25s, box-shadow 0.25s;
  margin: 0 auto;
  display: block;
}
.preview-image:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.18);
}
.image-actions {
  margin-top: 1rem;
}
.btn-remove {
  color: #ff4d4f;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: background 0.2s;
}
.btn-remove:hover {
  background: #ffeaea;
}
/* 封面图片提示文字更柔和 */
.form-group .hint {
  color: #7da7d9;
  font-size: 0.98rem;
  font-style: italic;
  opacity: 0.85;
}

.form-actions {
  margin-top: 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.btn-submit {
  background: #1890ff;
  color: white;
  border: none;
  padding: 1rem 2.8rem;
  border-radius: 10px;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
}

.btn-submit:hover {
  background: #40a9ff;
}

.btn-submit:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.global-error {
  text-align: center;
}

.sensitive-words-warning {
  margin: 20px 0;
}

.sensitive-words-content {
  margin-top: 10px;
}

.sensitive-word-tag {
  margin: 5px;
}

.sensitive-words-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>