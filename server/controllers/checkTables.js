const db = require('../models/db');

async function checkTables() {
  try {
    // 检查 articles 表
    const [articlesColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'blog_db'
      AND TABLE_NAME = 'articles'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('articles 表结构:', JSON.stringify(articlesColumns, null, 2));

    // 检查 users 表
    const [usersColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'blog_db'
      AND TABLE_NAME = 'users'
    `);
    console.log('users 表结构:', usersColumns);

    // 检查 comments 表
    const [commentsColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'blog_db'
      AND TABLE_NAME = 'comments'
    `);
    console.log('comments 表结构:', commentsColumns);

    // 检查 categories 表
    const [categoriesColumns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'blog_db'
      AND TABLE_NAME = 'categories'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('categories 表结构:', JSON.stringify(categoriesColumns, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('检查表结构失败:', error);
    process.exit(1);
  }
}

checkTables(); 