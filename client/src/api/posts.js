/* posts.js - 文章相关API */
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/posts';

// 获取所有文章
export async function fetchPosts() {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取文章列表失败');
  }
}

// 获取单篇文章
export async function fetchPostById(id) {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取文章详情失败');
  }
}

// 创建新文章
export async function createPost(postData) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, postData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '创建文章失败');
  }
}

// 更新文章
export async function updatePost(id, postData) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${id}`, postData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '更新文章失败');
  }
}

// 删除文章
export async function deletePost(id) {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || '删除文章失败');
  }
}