const db = require('../models/db');

async function testDatabase() {
  try {
    console.log('开始测试数据库连接...');
    
    // 测试数据库连接
    const connection = await db.getConnection();
    console.log('数据库连接成功！');
    connection.release();

    // 测试 articles 表
    console.log('\n测试 articles 表...');
    const [articles] = await db.query('SELECT COUNT(*) as count FROM articles');
    console.log('文章总数:', articles[0].count);

    // 测试 users 表
    console.log('\n测试 users 表...');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('用户总数:', users[0].count);

    // 测试 comments 表
    console.log('\n测试 comments 表...');
    const [comments] = await db.query('SELECT COUNT(*) as count FROM comments');
    console.log('评论总数:', comments[0].count);

    // 测试 categories 表
    console.log('\n测试 categories 表...');
    const [categories] = await db.query('SELECT COUNT(*) as count FROM categories');
    console.log('分类总数:', categories[0].count);

    // 测试文章统计查询
    console.log('\n测试文章统计查询...');
    const [articleStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(publish_time) = CURDATE() THEN 1 ELSE 0 END) as today
      FROM articles
    `);
    console.log('文章统计:', articleStats[0]);

    // 测试用户统计查询
    console.log('\n测试用户统计查询...');
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
      FROM users
    `);
    console.log('用户统计:', userStats[0]);

    // 测试评论统计查询
    console.log('\n测试评论统计查询...');
    const [commentStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
      FROM comments
    `);
    console.log('评论统计:', commentStats[0]);

    // 测试访问统计查询
    console.log('\n测试访问统计查询...');
    const [visitStats] = await db.query(`
      SELECT 
        COALESCE(SUM(view_count), 0) as total,
        COALESCE(SUM(CASE WHEN DATE(update_time) = CURDATE() THEN view_count ELSE 0 END), 0) as today
      FROM articles
    `);
    console.log('访问统计:', visitStats[0]);

    // 测试分类分布查询
    console.log('\n测试分类分布查询...');
    const [categoryDist] = await db.query(`
      SELECT 
        c.name as category,
        COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.article_type
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);
    console.log('分类分布:', categoryDist);

    // 测试最近活动查询
    console.log('\n测试最近活动查询...');
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
    `);
    console.log('最近文章:', recentArticles);

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
    `);
    console.log('最近评论:', recentComments);

    console.log('\n所有测试完成！');
    process.exit(0);
  } catch (error) {
    console.error('测试过程中出现错误:', error);
    process.exit(1);
  }
}

testDatabase(); 