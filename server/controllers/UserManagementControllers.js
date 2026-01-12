const db = require('../models/db');

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
      `SELECT id, username, email, role, avatar, created_at, status FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), Number(offset)]
    );

    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: '获取用户列表失败', error: err });
  }
}; 