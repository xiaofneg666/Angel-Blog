const db = require('../models/db');

exports.getRandomSaying = async (req, res) => {
  try {
    // 确保SQL语句正确且表名匹配
    const [rows] = await db.query('SELECT content FROM sayings ORDER BY RAND() LIMIT 1');
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.json({ success: false, message: '暂无名言数据' });
    }
  } catch (error) {
    console.error('获取名言失败:', error);
    // 确保返回JSON格式错误
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};