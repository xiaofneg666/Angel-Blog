const jwt = require('jsonwebtoken');
const db = require('../models/db');

const auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    console.log('认证头:', authHeader);

    const token = authHeader?.replace('Bearer ', '');
    console.log('提取的token:', token);

    if (!token) {
      console.log('未提供token');
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('解码后的用户信息:', decoded);

    // 从数据库获取完整的用户信息，包括头像和角色
    const [users] = await db.query('SELECT id, username, avatar, role FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 将完整的用户信息添加到请求对象
    req.user = {
      ...decoded,
      userId: users[0].id,
      username: users[0].username,
      avatar: users[0].avatar,
      role: users[0].role
    };

    console.log('完整的用户信息:', req.user);

    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
};

module.exports = auth; 