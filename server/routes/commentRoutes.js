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

    // 处理评论数据，构建嵌套结构
    const processedComments = [];
    const commentMap = new Map();

    // 第一遍：将所有评论放入map，并初始化replies数组
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // 第二遍：构建嵌套结构
    comments.forEach(comment => {
      if (comment.parent_id) {
        // 这是一个回复评论，将其添加到父评论的replies数组中
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      } else {
        // 这是一个顶级评论，直接添加到结果数组中
        processedComments.push(comment);
      }
    });

    // 处理评论数据格式
    const finalComments = processedComments.map(comment => {
      // 递归处理嵌套评论
      const processNestedComments = (comment) => {
        const processed = {
          ...comment,
          avatar: comment.avatar ? `/uploads/${comment.avatar}` : null,
          created_at: new Date(comment.created_at).toISOString()
        };
        
        if (comment.replies && comment.replies.length > 0) {
          processed.replies = comment.replies.map(processNestedComments);
        }
        
        return processed;
      };
      
      return processNestedComments(comment);
    });

    res.json({
      success: true,
      data: finalComments
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
    comment.avatar = comment.avatar ? `/uploads/${comment.avatar}` : null;
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