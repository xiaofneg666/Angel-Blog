const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
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

    // 将用户信息添加到请求对象
    req.user = decoded;

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