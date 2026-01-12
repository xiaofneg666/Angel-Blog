/*
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-05-07 09:24:56
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-06-12 10:56:04
 * @FilePath: \小峰大王\blog-project\server\middleware\authMiddleware.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

// 认证中间件
module.exports = async (req, res, next) => {
  try {
    // 对留言板接口特殊处理 - 允许匿名访问
    if (req.path.startsWith('/api/messages')) {
      // 匿名用户设置默认ID
      req.userId = 0;
      req.username = '游客';
      return next();
    }

    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 检查用户是否存在
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 将用户信息添加到请求对象
    req.userId = decoded.userId;
    req.username = decoded.username;
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ message: '无效的认证令牌' });
  }
};