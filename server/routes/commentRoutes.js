/* authController.js - 认证相关控制器 */

const express = require('express');
const router = express.Router();
const db = require('../models/db');
const auth = require('../middleware/auth');

// 获取文章评论
router.get('/articles/:articleId/comments', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.created_at DESC
    `;

    const [comments] = await db.query(sql, [req.params.articleId]);

    // 处理评论数据
    const processedComments = comments.map(comment => ({
      ...comment,
      avatar: comment.avatar ? `/uploads/${comment.avatar}` : '/default-avatar.jpg',
      created_at: new Date(comment.created_at).toISOString()
    }));

    res.json({
      success: true,
      data: processedComments
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评论失败'
    });
  }
});

// 添加评论
router.post('/articles/:articleId/comments', auth, async (req, res) => {
  try {
    const { content, parent_id, root_id, reply_to_user_id, reply_to_username } = req.body;
    const articleId = req.params.articleId;
    const userId = req.user.userId;
    const username = req.user.username;
    const avatar = req.user.avatar || null;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
    }

    const sql = `
      INSERT INTO comments 
      (article_id, user_id, content, parent_id, root_id, username, avatar, reply_to_user_id, reply_to_username)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      articleId,
      userId,
      content,
      parent_id || null,
      root_id || null,
      username,
      avatar,
      reply_to_user_id || null,
      reply_to_username || null
    ]);

    // 获取新添加的评论
    const [comments] = await db.query(`
      SELECT 
        c.*,
        u.username,
        u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    const comment = comments[0];
    comment.avatar = comment.avatar ? `/uploads/${comment.avatar}` : '/default-avatar.jpg';
    comment.created_at = new Date(comment.created_at).toISOString();

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({
      success: false,
      message: '添加评论失败'
    });
  }
});

// 删除评论
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // 检查评论是否存在且是否属于当前用户
    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '评论不存在或无权限删除'
      });
    }

    // 删除评论
    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
});

// 登录路由
router.post('/login', (req, res) => {
  res.json({ message: '登录路由' });
});

// 注册路由
router.post('/register', (req, res) => {
  res.json({ message: '注册路由' });
});

module.exports = router;