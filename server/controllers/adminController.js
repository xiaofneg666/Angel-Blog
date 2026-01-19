

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

// 获取所有评论（管理员）
exports.getComments = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT c.*, u.username, a.title as articleTitle 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      JOIN articles a ON c.article_id = a.id 
      WHERE 1=1
    `;
    let params = [];
    
    if (keyword) {
      query += ` AND (c.content LIKE ? OR u.username LIKE ? OR a.title LIKE ?)`;
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
    }
    
    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [comments] = await pool.query(query, params);
    
    // 获取总记录数
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      JOIN articles a ON c.article_id = a.id 
      WHERE 1=1
    `;
    let countParams = [];
    
    if (keyword) {
      countQuery += ` AND (c.content LIKE ? OR u.username LIKE ? OR a.title LIKE ?)`;
      const likeKeyword = `%${keyword}%`;
      countParams.push(likeKeyword, likeKeyword, likeKeyword);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: comments,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取所有评论失败:', error);
    res.status(500).json({
      success: false,
      message: '获取所有评论失败'
    });
  }
};

// 删除评论（管理员）
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    
    // 先检查评论是否存在
    const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }
    
    // 获取所有需要删除的评论ID，包括该评论及其所有嵌套回复
    let commentIdsToDelete = [commentId];
    
    // 递归获取所有嵌套回复的ID
    const getNestedReplies = async (parentId) => {
      const [replies] = await pool.query(
        'SELECT id FROM comments WHERE parent_id = ?',
        [parentId]
      );
      
      for (const reply of replies) {
        commentIdsToDelete.push(reply.id);
        await getNestedReplies(reply.id);
      }
    };
    
    // 获取所有嵌套回复
    await getNestedReplies(commentId);
    
    // 删除所有相关评论
    if (commentIdsToDelete.length > 0) {
      await pool.query(
        `DELETE FROM comments WHERE id IN (${commentIdsToDelete.join(',')})`,
        []
      );
    }
    
    res.json({
      success: true,
      message: '评论删除成功',
      deletedCommentIds: commentIdsToDelete
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
};

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