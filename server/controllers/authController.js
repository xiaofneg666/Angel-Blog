/*
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-06-10 08:59:02
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-06-13 14:10:59
 * @FilePath: \小峰大王\blog-project\server\controllers\authController.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// 
/* authController.js - 登录后端 */
const pool = require('../models/db');
const bcrypt = require('bcryptjs');  // 替换原来的bcrypt
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 验证输入
    if (!username || !password || !email) {
      return res.status(400).json({ message: '请提供用户名、密码和邮箱' });
    }
    
    // 检查用户是否已存在
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: '用户名或邮箱已存在',
        details: existingUser[0].username === username ? '用户名已被使用' : '邮箱已被注册'
      });
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, '/2222.jpg']
    );
    
    // 获取创建时间
    const [newUser] = await pool.query('SELECT created_at FROM users WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: '用户注册成功', 
      userId: result.insertId,
      createdAt: newUser[0].created_at
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ message: '请提供邮箱和密码' });
    }
    
    // 查找用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?', 
      [email, userType || 'user']
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在或角色不匹配' });
    }
    
    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' } // 将此处从'1h'修改为'24h'或更长时间
    );
    
    res.json({ 
      message: '登录成功', 
      token, 
      userId: user.id, 
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: '未提供刷新令牌' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    const [users] = await pool.query('SELECT id, username, role FROM users WHERE id = ?', [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = users[0];
    const newToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: '刷新令牌无效或已过期' });
  }
};

// 身份验证中间件
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.error('令牌验证失败:', error);
    return res.status(401).json({ success: false, message: '认证令牌无效或已过期' });
  }
};