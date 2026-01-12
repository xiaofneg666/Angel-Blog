/*
 * @Author: 11 1547163442@qq.com
 * @Date: 2025-06-15 23:13:30
 * @LastEditors: 11 1547163442@qq.com
 * @LastEditTime: 2025-06-16 00:10:39
 * @FilePath: \小峰大王\blog-project\client\src\stores\comment.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchComments, addComment, deleteComment } from '@/api/comments'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 获取评论列表
  const getComments = async (articleId) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetchComments(articleId)
      if (response.success) {
        comments.value = response.data
      } else {
        throw new Error(response.message || '获取评论失败')
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 添加评论
  const createComment = async (articleId, content) => {
    loading.value = true
    error.value = null
    try {
      const response = await addComment(articleId, content)
      if (response.success) {
        comments.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.message || '添加评论失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除评论
  const removeComment = async (commentId) => {
    loading.value = true
    error.value = null
    try {
      const response = await deleteComment(commentId)
      if (response.success) {
        comments.value = comments.value.filter(comment => comment.id !== commentId)
      } else {
        throw new Error(response.message || '删除评论失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    loading,
    error,
    getComments,
    createComment,
    removeComment
  }
}) 