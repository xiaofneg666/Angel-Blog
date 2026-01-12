const pool = require('../models/db');

// 获取后台文章列表（分页+搜索）
exports.getAdminArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';

    const offset = (page - 1) * pageSize;

    // 统计总数
    let countSql = `
      SELECT COUNT(*) as count
      FROM articles
      WHERE title LIKE ? OR content LIKE ?
    `;
    let [countRows] = await pool.query(countSql, [`%${keyword}%`, `%${keyword}%`]);
    const total = countRows[0].count;
    const totalPages = Math.ceil(total / pageSize);

    // 查询数据
    let sql = `
      SELECT a.id, a.title, a.publish_time, a.status, a.view_count, u.username as author
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.title LIKE ? OR a.content LIKE ?
      ORDER BY a.publish_time DESC
      LIMIT ? OFFSET ?
    `;
    let [rows] = await pool.query(sql, [`%${keyword}%`, `%${keyword}%`, pageSize, offset]);

    // 状态映射
    const statusMap = {
      '审核通过': 'published',
      '待审核': 'pending',
      '已拒绝': 'draft'
    };
    rows.forEach(row => {
      row.status = statusMap[row.status] || row.status;
    });

    res.json({
      articles: rows,
      totalPages
    });
  } catch (err) {
    res.status(500).json({ message: '获取文章列表失败', error: err.message });
  }
};