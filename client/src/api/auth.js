/* auth.js - 认证相关API
 */
import apiClient from './axios';

const API_URL = '/auth';
const USERS_URL = '/users';

// 用户登录
export async function loginUser(username, password) {
  try {
    const response = await apiClient.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登录失败');
  }
}

// 用户注册
export async function registerUser(username, email, password) {
  try {
    const response = await apiClient.post(`${API_URL}/register`, { username, email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '注册失败');
  }
}

// 根据用户ID获取用户信息
export async function getUserById(userId) {
  try {
    const response = await apiClient.get(`${USERS_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取用户信息失败');
  }
}

// 更新用户信息
export async function updateUserInfo(userId, userData) {
  try {
    const response = await apiClient.put(`${USERS_URL}/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '更新用户信息失败');
  }
}