const db = require('../models/db');
const bcrypt = require('bcryptjs');

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', role = 'all', status = 'all' } = req.query;
    const offset = (page - 1) * pageSize;
    let where = 'WHERE 1=1';
    let params = [];

    if (keyword) {
      where += ' AND (username LIKE ? OR email LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (role !== 'all') {
      where += ' AND role = ?';
      params.push(role);
    }
    if (status !== 'all') {
      where += ' AND status = ?';
      params.push(status);
    }

    // 查询总数
    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    const total = countRows[0].total;

    // 查询分页数据
    const [users] = await db.query(
      `SELECT id, username, email, role, avatar, bio, status, created_at, updated_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), Number(offset)]
    );

    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: '获取用户列表失败', error: err });
  }
};

// 获取单个用户信息
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT id, username, email, role, avatar, bio, status, created_at, updated_at FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: '获取用户信息失败', error: err });
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'user', avatar, bio, status = 'active' } = req.body;
    
    // 检查用户名和邮箱是否已存在
    const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, avatar, bio, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, avatar, bio, status]
    );
    
    res.status(201).json({ message: '用户创建成功', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: '创建用户失败', error: err });
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, avatar, bio, status } = req.body;
    
    // 检查用户名和邮箱是否已被其他用户使用
    const [existingUsers] = await db.query('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?', [username, email, id]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已被其他用户使用' });
    }
    
    // 更新用户信息
    await db.query(
      'UPDATE users SET username = ?, email = ?, role = ?, avatar = ?, bio = ?, status = ? WHERE id = ?',
      [username, email, role, avatar, bio, status, id]
    );
    
    res.json({ message: '用户信息更新成功' });
  } catch (err) {
    res.status(500).json({ message: '更新用户信息失败', error: err });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 删除用户
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: '用户删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除用户失败', error: err });
  }
};

// 修改用户角色
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // 验证角色值
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: '无效的角色值' });
    }
    
    // 更新用户角色
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    
    res.json({ message: '用户角色更新成功' });
  } catch (err) {
    res.status(500).json({ message: '更新用户角色失败', error: err });
  }
};

// 更新用户状态
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }
    
    // 检查是否是最后一个管理员
    const [adminCount] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND status = "active"'
    );
    
    const [user] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    
    if (adminCount[0].count === 1 && user[0].role === 'admin' && status === 'inactive') {
      return res.status(400).json({ message: '不能禁用最后一个管理员' });
    }
    
    // 更新用户状态
    await db.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    
    res.json({ message: '用户状态更新成功' });
  } catch (err) {
    console.error('更新用户状态失败:', err);
    res.status(500).json({ message: '更新用户状态失败', error: err });
  }
};

// 重置用户密码
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    
    res.json({ message: '密码重置成功' });
  } catch (err) {
    res.status(500).json({ message: '重置密码失败', error: err });
  }
}; 