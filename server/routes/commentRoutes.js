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

// 测试路由 - 用于调试DELETE请求
router.delete('/test-delete', (req, res) => {
  console.log('=== 测试DELETE请求收到 ===');
  console.log('请求URL:', req.originalUrl);
  console.log('请求方法:', req.method);
  console.log('请求头:', req.headers);
  res.json({
    success: true,
    message: '测试DELETE请求成功',
    debug: {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers
    }
  });
});

// 删除评论
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    // 从auth中间件获取用户ID，确保使用正确的字段名
    const userId = req.user.userId;
    
    // 添加详细的调试日志
    console.log('=== 删除评论调试信息 ===');
    console.log('请求URL:', req.originalUrl);
    console.log('评论ID:', commentId);
    console.log('当前用户ID:', userId);
    console.log('req.user:', req.user);
    console.log('req.headers:', req.headers);

    // 先检查评论是否存在
    console.log('开始查询评论是否存在...');
    const [allComments] = await db.query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );
    
    console.log('数据库中找到的评论:', allComments);
    
    if (allComments.length === 0) {
      console.log('评论不存在，返回404');
      return res.status(404).json({
        success: false,
        message: '评论不存在',
        debug: {
          commentId: commentId,
          query: 'SELECT * FROM comments WHERE id = ?',
          params: [commentId],
          result: allComments
        }
      });
    }
    
    const comment = allComments[0];
    console.log('评论详情:', comment);
    console.log('评论的user_id:', comment.user_id);
    console.log('评论的article_id:', comment.article_id);
    
    // 检查权限 - 允许文章作者和评论作者删除
    if (comment.user_id !== userId) {
      console.log('当前用户不是评论作者，检查是否是文章作者...');
      // 检查当前用户是否是文章作者
      const [articles] = await db.query(
        'SELECT * FROM articles WHERE id = ? AND user_id = ?',
        [comment.article_id, userId]
      );
      
      console.log('文章查询结果:', articles);
      
      if (articles.length === 0) {
        console.log('当前用户不是文章作者，返回403');
        return res.status(403).json({
          success: false,
          message: '无权限删除该评论',
          debug: {
            commentId: commentId,
            commentUserId: comment.user_id,
            currentUserId: userId,
            articleId: comment.article_id,
            isCommentAuthor: false,
            isArticleAuthor: articles.length > 0,
            articleQuery: 'SELECT * FROM articles WHERE id = ? AND user_id = ?',
            articleQueryParams: [comment.article_id, userId],
            articleQueryResult: articles
          }
        });
      }
      console.log('当前用户是文章作者，允许删除');
    } else {
      console.log('当前用户是评论作者，允许删除');
    }

    // 获取所有需要删除的评论ID，包括该评论及其所有嵌套回复
    let commentIdsToDelete = [commentId];
    console.log('开始获取所有嵌套回复...');
    
    // 递归获取所有嵌套回复的ID
    const getNestedReplies = async (parentId) => {
      const [replies] = await db.query(
        'SELECT id FROM comments WHERE parent_id = ?',
        [parentId]
      );
      
      console.log(`父评论${parentId}的回复:`, replies);
      
      for (const reply of replies) {
        commentIdsToDelete.push(reply.id);
        await getNestedReplies(reply.id);
      }
    };
    
    // 获取所有嵌套回复
    await getNestedReplies(commentId);
    
    console.log('需要删除的评论ID列表:', commentIdsToDelete);
    
    // 删除所有相关评论
    if (commentIdsToDelete.length > 0) {
      console.log('开始删除评论...');
      const deleteResult = await db.query(
        `DELETE FROM comments WHERE id IN (${commentIdsToDelete.join(',')})`,
        []
      );
      console.log('删除结果:', deleteResult);
    }

    console.log('评论删除成功，返回200');
    res.json({
      success: true,
      message: '评论删除成功',
      deletedCommentIds: commentIdsToDelete
    });
  } catch (error) {
    console.error('=== 删除评论发生错误 ===');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message,
      stack: error.stack
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