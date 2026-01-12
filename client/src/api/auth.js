/* auth.js - 认证相关API
 */
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';  // 确保端口3000正确

// 用户登录
export async function loginUser(username, password) {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登录失败');
  }
}

// 用户注册
export async function registerUser(username, email, password) {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '注册失败');
  }
}