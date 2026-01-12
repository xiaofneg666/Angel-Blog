/*
 * @Author: 11 1547163442@qq.com
 * @Date: 2025-06-15 22:28:29
 * @LastEditors: 11 1547163442@qq.com
 * @LastEditTime: 2025-06-19 21:25:58
 * @FilePath: \小峰大王\blog-project\client\src\api\comments.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/* comments.js - 评论相关API
 */
import { useAuthStore } from '@/stores/authStore'

const BASE_URL = 'http://localhost:3000/api'

// 获取评论列表
export const fetchComments = async (articleId) => {
  try {
    const response = await fetch(`${BASE_URL}/articles/${articleId}/comments`)
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('获取评论失败')
  }
}

// 添加评论
export const addComment = async (articleId, commentData) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    throw new Error('请先登录')
  }

  try {
    const response = await fetch(`${BASE_URL}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(commentData)
    })
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('添加评论失败')
  }
}

// 删除评论
export const deleteComment = async (commentId) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    throw new Error('请先登录')
  }

  try {
    const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('删除评论失败')
  }
}

async function loadComments() {
  const res = await fetchComments(articleId);
  if (res.success) {
    comments.value = res.data;
  } else {
    alert(res.message || '加载评论失败');
  }
}