/*
 * @Author: 11 1547163442@qq.com
 * @Date: 2025-06-18 11:22:02
 * @LastEditors: 11 1547163442@qq.com
 * @LastEditTime: 2025-06-19 23:17:04
 * @FilePath: \小峰大王\blog-project\server\controllers\updateCategories.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const db = require('../models/db');

async function updateCategories() {
  try {
    // 更新所有文章的分类为"前端"（id=1）
    const [result] = await db.query(`
      UPDATE articles 
      SET category_id = 1 
      WHERE category_id IS NULL
    `);

    console.log('更新结果:', result);
    console.log('影响的行数:', result.affectedRows);

    // 验证更新结果
    const [articles] = await db.query(`
      SELECT a.id, a.title, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
    `);

    console.log('\n更新后的文章列表:');
    console.log(JSON.stringify(articles, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('更新分类失败:', error);
    process.exit(1);
  }
}

updateCategories(); 