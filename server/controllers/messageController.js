const pool = require('../models/db');

// 添加留言
exports.addMessage = async (req, res) => {
  try {
    const { content, x, y, color, rotate, tape_color } = req.body;
    const userId = req.userId; // 从中间件获取
    const username = req.username;
    const time = new Date().toLocaleString();

    // 验证必要字段
    if (!content) {
      return res.status(400).json({ message: '留言内容不能为空' });
    }

    // 插入数据库
    const [result] = await pool.query(
      'INSERT INTO messages (user_id, content, x, y, color, rotate, tape_color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [userId, content, x, y, color, rotate, tape_color]
    );

    // 获取新创建的留言
    const [newMessage] = await pool.query(
      'SELECT * FROM messages WHERE id = ?',
      [result.insertId]
    );

    // 返回格式化的留言数据
    res.status(201).json({
      id: newMessage[0].id,
      text: newMessage[0].content,
      user: username,
      time: newMessage[0].created_at.toLocaleString(),
      x: newMessage[0].x,
      y: newMessage[0].y,
      color: newMessage[0].color,
      rotate: newMessage[0].rotate,
      tape_color: newMessage[0].tape_color
    });
  } catch (error) {
    console.error('添加留言错误:', error); // 详细日志
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有留言
exports.getAllMessages = async (req, res) => {
  try {
    // 修改SQL查询，联表获取用户名
    const [rows] = await pool.query(
      'SELECT m.*, u.username FROM messages m LEFT JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC'
    );
    const messages = rows.map(row => ({
      id: row.id,
      text: row.content,
      // 使用联表查询到的用户名，未找到时显示'游客'
      user: row.username || '游客',
      time: row.created_at.toLocaleString(),
      x: row.x,
      y: row.y,
      color: row.color,
      rotate: row.rotate,
      tape_color: row.tape_color
    }));
    res.json(messages);
  } catch (error) {
    console.error('获取留言错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新留言位置
exports.updateMessagePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y } = req.body;

    // 验证必要字段
    if (typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ message: '位置信息格式错误' });
    }

    // 更新数据库
    await pool.query(
      'UPDATE messages SET x = ?, y = ? WHERE id = ?',
      [x, y, id]
    );

    res.json({ message: '位置更新成功' });
  } catch (error) {
    console.error('更新留言位置错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};