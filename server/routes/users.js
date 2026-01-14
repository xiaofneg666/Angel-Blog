const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/head');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;
        
        // 检查用户名和邮箱是否已存在
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?', 
            [username, email]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                error: '用户名或邮箱已被注册' 
            });
        }

        // 插入新用户
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, role]
        );

        res.status(201).json({ 
            id: result.insertId,
            username,
            email,
            role
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 查询用户
        const [users] = await db.query(
            'SELECT id, username, email, role, password FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: '用户不存在' });
        }
        
        const user = users[0];
        
        // 这里应该使用bcrypt等库验证密码
        if (password !== user.password) {
            return res.status(401).json({ error: '密码错误' });
        }

        // 返回用户信息(实际项目中应该返回JWT token)
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?',
            [req.params.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('获取用户错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 管理员获取用户列表
router.get('/admin', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';
    const role = req.query.role || 'all';
    const status = req.query.status || 'all';
    const offset = (page - 1) * pageSize;

    // 构建搜索条件
    let conditions = [];
    let params = [];

    if (keyword) {
      conditions.push('(username LIKE ? OR email LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (role !== 'all') {
      conditions.push('role = ?');
      params.push(role);
    }

    if (status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // 获取用户总数
    const [totalRows] = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = totalRows[0].total;

    // 获取用户列表
    const sql = `
      SELECT 
        id,
        username,
        email,
        role,
        status,
        created_at,
        updated_at,
        avatar
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [users] = await db.query(sql, [...params, pageSize, offset]);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // 检查是否是最后一个管理员
    const [adminCount] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
    );

    const [user] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (adminCount[0].count === 1 && user[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: '不能删除最后一个管理员'
      });
    }

    // 删除用户
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败'
    });
  }
});

// 更新用户状态
router.patch('/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    // 检查是否是最后一个管理员
    const [adminCount] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND status = "active"'
    );

    const [user] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (adminCount[0].count === 1 && user[0].role === 'admin' && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: '不能禁用最后一个管理员'
      });
    }

    // 更新用户状态
    await db.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, userId]
    );

    res.json({
      success: true,
      message: '用户状态更新成功'
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
});

// 上传头像
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的头像'
      });
    }

    const avatarUrl = `/head/${req.file.filename}`;

    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        avatar: avatarUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      success: false,
      message: '上传头像失败'
    });
  }
});

// 更新用户资料
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, bio, avatar } = req.body;

    // 检查用户是否存在
    const [users] = await db.query('SELECT id, avatar FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const oldAvatar = users[0].avatar;

    // 如果修改用户名，检查是否已被占用
    if (username) {
      const [existingUser] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: '用户名已被占用'
        });
      }
    }

    // 构建更新语句
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      });
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // 如果更新了头像，删除旧头像文件（但保留默认头像 2222.jpg）
    if (avatar !== undefined && oldAvatar && oldAvatar !== avatar) {
      // 提取文件名
      let oldFileName = oldAvatar;
      if (oldAvatar.startsWith('/head/')) {
        oldFileName = oldAvatar.replace('/head/', '');
      } else if (oldAvatar.startsWith('/api/head/')) {
        oldFileName = oldAvatar.replace('/api/head/', '');
      }

      // 如果不是默认头像，则删除
      if (oldFileName !== '2222.jpg') {
        const oldFilePath = path.join(uploadDir, oldFileName);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log('已删除旧头像:', oldFileName);
          }
        } catch (error) {
          console.error('删除旧头像失败:', error);
        }
      }
    }

    // 获取更新后的用户信息
    const [updatedUser] = await db.query(
      'SELECT id, username, email, role, avatar, bio, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: '资料更新成功',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户资料失败'
    });
  }
});

module.exports = router;