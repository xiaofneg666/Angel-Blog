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
import apiClient from './axios'

// 获取评论列表
export const fetchComments = async (articleId) => {
  try {
    const response = await apiClient.get(`/articles/${articleId}/comments`)
    return response.data
  } catch (error) {
    throw new Error('获取评论失败')
  }
}

// 添加评论
export const addComment = async (articleId, commentData) => {
  try {
    const response = await apiClient.post(`/articles/${articleId}/comments`, commentData)
    return response.data
  } catch (error) {
    throw new Error('添加评论失败')
  }
}

// 删除评论
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`)
    return response.data
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