

const pool = require('../models/db');

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
// 获取仪表盘数据
exports.getDashboardData = async (req, res) => {
  try {
    // 获取文章总数
    const [articles] = await pool.query('SELECT COUNT(*) as count FROM articles');
    // 获取用户总数
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    // 获取评论总数
    const [comments] = await pool.query('SELECT COUNT(*) as count FROM comments');
    // 获取最新文章
    const [latestArticles] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        articleCount: articles[0].count,
        users: users[0].count,
        commentCount: comments[0].count,
        visitCount: 0 // 如需显示访问量可补充此数据
        
      }
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};



// 其他管理员API方法...



// 更新用户角色
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: '用户角色更新成功' });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};