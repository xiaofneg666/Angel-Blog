/*
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-05-07 09:24:56
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-06-12 10:56:04
 * @FilePath: \小峰大王\blog-project\server\middleware\authMiddleware.js
 * @Description: 认证中间件
 */
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 检查用户是否存在
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: users[0].role
    };
    
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

// 检查是否为管理员中间件
const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    next();
  } catch (error) {
    console.error('管理员权限检查错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  authenticate,
  isAdmin
};