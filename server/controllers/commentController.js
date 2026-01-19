/* commentController.js - 评论相关控制器 *///无
const pool = require('../models/db');

// 获取文章的所有评论
exports.getCommentsByPost = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const [comments] = await pool.query(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.article_id = ? 
      ORDER BY c.created_at DESC
    `, [articleId]);
    
    res.json(comments);
  } catch (error) {
    console.error('获取评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取所有评论（用于后台管理）
exports.getAllComments = async (req, res) => {
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
    console.error('获取所有评论错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
};

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const { content } = req.body;
    const userId = req.user.userId;
    
    if (!content) {
      return res.status(400).json({ message: '请提供评论内容' });
    }
    
    // 检查文章是否存在
    const [posts] = await pool.query('SELECT * FROM articles WHERE id = ?', [articleId]);
    if (posts.length === 0) {
      return res.status(404).json({ message: '文章未找到' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO comments (content, user_id, article_id) VALUES (?, ?, ?)',
      [content, userId, articleId]
    );
    
    res.status(201).json({ message: '评论添加成功', commentId: result.insertId });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.userId;
    
    // 检查评论是否存在且属于当前用户
    const [comments] = await pool.query('SELECT * FROM comments WHERE id = ? AND user_id = ?', [commentId, userId]);
    if (comments.length === 0) {
      return res.status(404).json({ message: '评论未找到或无权删除' });
    }
    
    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
    
    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};