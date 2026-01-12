
import axios from 'axios';

// 修正为后端实际接口路径
const UPLOAD_URL = 'http://localhost:3000/api/posts/upload';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file); // 字段名需与后端 `upload.single('image')` 一致
  const token = localStorage.getItem('token'); // 从本地存储获取令牌
  const response = await axios.post(UPLOAD_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}` // 添加认证头
    }
  });
  return response.data.url;
}