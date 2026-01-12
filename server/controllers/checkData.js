const db = require('../models/db');

async function checkData() {
  try {
    // 1. 检查所有分类
    console.log('=== 检查所有分类 ===');
    const [categories] = await db.query('SELECT * FROM categories');
    console.log('分类列表:', JSON.stringify(categories, null, 2));

    // 2. 检查所有文章
    console.log('\n=== 检查所有文章 ===');
    const [articles] = await db.query('SELECT id, title, category_id FROM articles');
    console.log('文章列表:', JSON.stringify(articles, null, 2));

    // 3. 检查分类下的文章数量
    console.log('\n=== 检查每个分类下的文章数量 ===');
    const [categoryCounts] = await db.query(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      GROUP BY c.id, c.name
    `);
    console.log('分类文章统计:', JSON.stringify(categoryCounts, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('检查数据失败:', error);
    process.exit(1);
  }
}

checkData(); 