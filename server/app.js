/*
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-06-09 08:47:10
 * @LastEditors: 11 1547163442@qq.com
 * @LastEditTime: 2025-06-20 00:41:39
 * @FilePath: \小峰大王\blog-project\server\app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 导入所需模块
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const pool = require('./models/db');
const messageRoutes = require('./routes/messageRoutes');
const sayingsRouter = require('./routes/sayings');
const articlesRouter = require('./routes/articles');
const fs = require('fs');
const articleManagementRoutes = require('./routes/ArticleManagementRoutes');
const userManagementRoutes = require('./routes/UserManagementRoutes');

// 创建Express应用
const app = express();

// 使用中间件
// 添加 JSON 解析中间件（关键修复）
app.use(express.json());

// 配置CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Range']
}));

app.use(bodyParser.json()); // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析URL编码请求体
app.use(helmet());
app.use(compression());

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    console.log('成功连接到MySQL数据库');
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

// 导入路由
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/postRoutes');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// 使用留言路由
app.use('/api/messages', messageRoutes);
//金句
app.use('/api/sayings', sayingsRouter);

// 注册文章路由
app.use('/api/articles', articleManagementRoutes);
app.use('/api/articles', articlesRouter);

// 使用用户管理路由（管理员专用）
app.use('/api/admin/users', userManagementRoutes);

// 配置 head 目录的静态文件服务
app.use('/api/head', express.static(path.join(__dirname, 'public/head')));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, '../client/public')));  // 添加客户端public目录的静态文件服务

// 配置uploads目录的静态文件服务
const uploadsPath = path.join(__dirname, 'public/uploads');
console.log('上传目录路径:', uploadsPath);

// 确保uploads目录存在
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// 配置静态文件服务 - 允许直接通过/uploads访问，不需要/api前缀
app.use('/uploads', (req, res, next) => {
  // 允许所有来源访问
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cache-Control': 'public, max-age=31536000'
  });

  console.log('静态文件请求:', {
    path: req.path,
    headers: res.getHeaders()
  });

  next();
}, express.static(uploadsPath));

// 同时保留/api/uploads路径用于向后兼容
app.use('/api/uploads', express.static(uploadsPath));

// 添加默认封面图片路由
app.get('/api/default-cover', (req, res) => {
  const defaultCoverPath = path.join(uploadsPath, '1749919075986-308926987.webp');
  res.sendFile(defaultCoverPath, {
    headers: {
      'Access-Control-Allow-Origin': 'https://yourdomain.com',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// 添加一个测试路由来验证图片访问
app.get('/api/test-image', (req, res) => {
  const testImagePath = path.join(uploadsPath, '1749919075986-308926987.webp');
  console.log('测试图片路径:', testImagePath);

  res.sendFile(testImagePath, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// 处理所有其他路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 设置服务器端口
const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 导出app用于测试
module.exports = app;

function getCommentAvatar(avatar) {
  if (avatar) {
    if (avatar.startsWith('/')) {
      return '/api' + avatar;
    }
    return avatar;
  }
  return '/api/head/2222.jpg';
}

