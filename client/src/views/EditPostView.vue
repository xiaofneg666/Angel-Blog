<!-- EditPostView.vue - 编辑文章页面 -->
<template>
    <div class="edit-post">
      <h1>编辑文章</h1>
      
      <div v-if="postStore.isLoading">加载中...</div>
      <div v-else-if="postStore.error" class="error">{{ postStore.error }}</div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">标题</label>
          <input 
            type="text" 
            id="title" 
            v-model="form.title" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="content">内容</label>
          <textarea 
            id="content" 
            v-model="form.content" 
            required
            rows="10"
          ></textarea>
        </div>
        
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '更新中...' : '更新' }} 
        </button>
        
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePostStore } from '@/stores/post';
  
  const route = useRoute();
  const router = useRouter();
  const postStore = usePostStore();
  
  const form = ref({
    title: '',
    content: ''
  });
  
  const isSubmitting = ref(false);
  const error = ref('');
  
  onMounted(async () => {
    await postStore.getPost(route.params.id);
    
    if (postStore.currentPost) {
      form.value = {
        title: postStore.currentPost.title,
        content: postStore.currentPost.content
      };
    }
  });
  
  async function handleSubmit() {
    try {
      isSubmitting.value = true;
      error.value = '';
      
      await postStore.modifyPost(route.params.id, form.value);
      
      // 更新成功后跳转到文章详情页
      router.push({ name: 'post-detail', params: { id: route.params.id } });
    } catch (err) {
      error.value = err.message;
    } finally {
      isSubmitting.value = false;
    }
  }
  </script>
  
  <style scoped>
  .edit-post {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  textarea {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 300px;
    font-family: inherit;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .error {
    color: #ff5252;
    margin-top: 1rem;
  }
  </style>