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

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const { content } = req.body;
    const userId = req.userId;
    
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
    const userId = req.userId;
    
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