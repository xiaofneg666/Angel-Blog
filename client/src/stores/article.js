import { defineStore } from 'pinia';
import { createArticle, getArticles, getArticleById, updateArticle, deleteArticle } from '@/api/article';

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    currentArticle: null,
    loading: false,
    error: null
  }),

  actions: {
    async addArticle(formData) {
      try {
        this.loading = true;
        this.error = null;
        const response = await createArticle(formData);
        console.log('API响应:', response);
        
        // 检查响应中是否包含敏感词信息
        if (response.data && response.data.sensitiveWords) {
          // 返回敏感词信息
          return {
            id: response.data.id,
            sensitiveWords: response.data.sensitiveWords
          };
        }
        
        // 如果没有敏感词，返回文章数据
        return response.data;
      } catch (error) {
        console.error('创建文章错误:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchArticles(params = {}) {
      try {
        this.loading = true;
        this.error = null;
        const data = await getArticles(params);
        this.articles = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchArticleById(id) {
      try {
        this.loading = true;
        this.error = null;
        const data = await getArticleById(id);
        this.currentArticle = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateArticle(id, formData) {
      try {
        this.loading = true;
        this.error = null;
        const data = await updateArticle(id, formData);
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
          this.articles[index] = data;
        }
        if (this.currentArticle?.id === id) {
          this.currentArticle = data;
        }
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeArticle(id) {
      try {
        this.loading = true;
        this.error = null;
        await deleteArticle(id);
        this.articles = this.articles.filter(article => article.id !== id);
        if (this.currentArticle?.id === id) {
          this.currentArticle = null;
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});