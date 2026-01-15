/* posts.js - 文章相关API */
import apiClient from './axios';

const API_URL = '/posts';

// 获取所有文章
export async function fetchPosts() {
  try {
    const response = await apiClient.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取文章列表失败');
  }
}

// 获取单篇文章
export async function fetchPostById(id) {
  try {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取文章详情失败');
  }
}

// 创建新文章
export async function createPost(postData) {
  try {
    const response = await apiClient.post(API_URL, postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '创建文章失败');
  }
}

// 更新文章
export async function updatePost(id, postData) {
  try {
    const response = await apiClient.put(`${API_URL}/${id}`, postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '更新文章失败');
  }
}

// 删除文章
export async function deletePost(id) {
  try {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除文章错误:', error);
    console.error('错误响应:', error.response);
    throw new Error(error.response?.data?.message || '删除文章失败');
  }
}