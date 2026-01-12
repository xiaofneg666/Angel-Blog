/*
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-06-18 10:55:38
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-06-19 08:49:33
 * @FilePath: \小峰大王\blog-project\server\controllers\checkDb.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const db = require('../models/db');

async function checkDatabase() {
  try {
    // 检查文章数量
    const [articles] = await db.query('SELECT COUNT(*) as count FROM articles');
    console.log('文章数量:', articles[0].count);

    // 检查用户数量
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('用户数量:', users[0].count);

    // 检查评论数量
    const [comments] = await db.query('SELECT COUNT(*) as count FROM comments');
    console.log('评论数量:', comments[0].count);

    // 检查访问量
    const [visits] = await db.query('SELECT SUM(view_count) as total FROM articles');
    console.log('访问总量:', visits[0].total || 0);

    process.exit(0);
  } catch (error) {
    console.error('检查数据库失败:', error);
    process.exit(1);
  }
}

checkDatabase(); 