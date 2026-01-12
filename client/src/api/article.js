/*
 * @Author: 11 1547163442@qq.com
 * @Date: 2025-06-13 11:01:08
 * @LastEditors: 11 1547163442@qq.com
 * @LastEditTime: 2025-06-13 11:22:24
 * @FilePath: \blog-project (3) (1)\blog-project\client\src\api\article.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// 获取所有文章
export const getArticles = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/articles`, { params });
    return response.data;
  } catch (error) {
    console.error('获取文章列表错误:', error);
    throw new Error('获取文章列表失败');
  }
};

// 获取单篇文章
export const getArticleById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error('获取文章详情错误:', error);
    throw new Error('获取文章详情失败');
  }
};

// 创建文章
export const createArticle = async (formData) => {
  try {
    // 获取token
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('请先登录')
    }

    console.log('发送文章数据:', {
      title: formData.get('title'),
      content: formData.get('content'),
      articleType: formData.get('articleType'),
      hasCoverImage: formData.has('coverImage')
    })

    const response = await axios.post(`${API_URL}/articles`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('服务器响应:', response.data)
    
    // 检查响应格式
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || '创建文章失败')
    }
    
    // 返回完整的响应数据
    return response.data
  } catch (error) {
    console.error('创建文章错误:', error)
    if (error.response) {
      // 服务器返回的错误信息
      const errorMessage = error.response.data.message || '创建文章失败'
      throw new Error(errorMessage)
    } else if (error.request) {
      // 请求发送失败
      throw new Error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      throw new Error(error.message || '创建文章失败')
    }
  }
}

// 更新文章
export const updateArticle = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('更新文章错误:', error);
    throw new Error('更新文章失败');
  }
};

// 删除文章
export const deleteArticle = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除文章错误:', error);
    throw new Error('删除文章失败');
  }
};

// 获取用户收藏的文章
export async function getCollectedArticles(userId) {
  try {
    const response = await axios.get(`${API_URL}/collected`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取收藏文章失败');
  }
}

// 获取用户点赞的文章
export async function getLikedArticles(userId) {
  try {
    const response = await axios.get(`${API_URL}/liked`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取点赞文章失败');
  }
}

// 获取用户自己的文章
export async function getMyArticles(userId) {
  try {
    const response = await axios.get(`${API_URL}/my`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取我的文章失败');
  }
}