const express = require('express');
const router = express.Router();
const db = require('../models/db');
const auth = require('../middleware/auth');

// 获取仪表盘统计数据
router.get('/stats', async (req, res) => {
  try {
    console.log('开始获取仪表盘统计数据');

    // 获取文章总数
    const [articleCount] = await db.query(
      'SELECT COUNT(*) as total FROM articles'
    );
    console.log('文章总数:', articleCount[0].total);

    // 获取分类总数
    const [categoryCount] = await db.query(
      'SELECT COUNT(*) as total FROM categories'
    );
    console.log('分类总数:', categoryCount[0].total);

    // 获取评论总数
    const [commentCount] = await db.query(
      'SELECT COUNT(*) as total FROM comments'
    );
    console.log('评论总数:', commentCount[0].total);

    // 获取总访问量
    const [visitCount] = await db.query(
      'SELECT COALESCE(SUM(view_count), 0) as total FROM articles'
    );
    console.log('总访问量:', visitCount[0].total);

    // 获取用户总数
    const [userCount] = await db.query(
      'SELECT COUNT(*) as total FROM users'
    );
    console.log('用户总数:', userCount[0].total);

    res.json({
      success: true,
      data: {
        articleCount: articleCount[0].total,
        categoryCount: categoryCount[0].total,
        commentCount: commentCount[0].total,
        visitCount: visitCount[0].total,
        users: userCount[0].total
      }
    });
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取仪表盘统计数据失败',
      error: error.message
    });
  }
});

// 获取访问趋势数据
router.get('/visits-trend', auth, async (req, res) => {
  try {
    console.log('开始获取访问趋势数据');
    const [trend] = await db.query(`
      SELECT 
        DATE(update_time) as date,
        COALESCE(SUM(view_count), 0) as count
      FROM articles
      WHERE update_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(update_time)
      ORDER BY date ASC
    `).catch(error => {
      console.error('查询访问趋势失败:', error);
      throw new Error(`查询访问趋势失败: ${error.message}`);
    });
    console.log('访问趋势数据:', trend);

    res.json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('获取访问趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取访问趋势数据失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取分类分布
router.get('/category-distribution', auth, async (req, res) => {
  try {
    console.log('开始获取分类分布数据...');
    const [distribution] = await db.query(`
      SELECT 
        c.name as category,
        COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);
    console.log('分类分布数据:', distribution);
    res.json({ success: true, data: distribution });
  } catch (error) {
    console.error('获取分类分布失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取分类分布失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取最近活动
router.get('/recent-activities', auth, async (req, res) => {
  try {
    console.log('开始获取最近活动数据');
    
    // 获取最近的文章发布
    const [recentArticles] = await db.query(`
      SELECT 
        'article' as type,
        a.id,
        a.title as content,
        a.publish_time as time,
        u.username as user
      FROM articles a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.publish_time DESC
      LIMIT 5
    `).catch(error => {
      console.error('查询最近文章失败:', error);
      throw new Error(`查询最近文章失败: ${error.message}`);
    });
    console.log('最近文章:', recentArticles);

    // 获取最近的评论
    const [recentComments] = await db.query(`
      SELECT 
        'comment' as type,
        c.id,
        c.content,
        c.created_at as time,
        u.username as user
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `).catch(error => {
      console.error('查询最近评论失败:', error);
      throw new Error(`查询最近评论失败: ${error.message}`);
    });
    console.log('最近评论:', recentComments);

    // 合并并排序所有活动
    const activities = [...recentArticles, ...recentComments]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);
    console.log('合并后的活动:', activities);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('获取最近活动数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取最近活动数据失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 