import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchPosts, fetchPostById, createPost, updatePost, deletePost } from '@/api/posts';

export const usePostStore = defineStore('posts', () => {
  const posts = ref([]);
  const currentPost = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  
  // 获取所有文章
  async function getPosts() {
    try {
      isLoading.value = true;
      posts.value = await fetchPosts();
      error.value = null;
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }
  
  // 获取单篇文章
  async function getPost(id) {
    try {
      isLoading.value = true;
      currentPost.value = await fetchPostById(id);
      error.value = null;
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }
  
  // 创建文章
  async function addPost(postData) {
    try {
      isLoading.value = true;
      const newPost = await createPost(postData);
      posts.value.unshift(newPost);
      error.value = null;
      return newPost;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // 更新文章
  async function modifyPost(id, postData) {
    try {
      isLoading.value = true;
      const updatedPost = await updatePost(id, postData);
      const index = posts.value.findIndex(p => p.id === id);
      if (index !== -1) {
        posts.value[index] = updatedPost;
      }
      if (currentPost.value && currentPost.value.id === id) {
        currentPost.value = updatedPost;
      }
      error.value = null;
      return updatedPost;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // 删除文章
  async function removePost(id) {
    try {
      isLoading.value = true;
      await deletePost(id);
      posts.value = posts.value.filter(p => p.id !== id);
      error.value = null;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  return { 
    posts, 
    currentPost, 
    isLoading, 
    error, 
    getPosts, 
    getPost, 
    addPost, 
    modifyPost, 
    removePost 
  };
});