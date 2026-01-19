const db = require('./models/db');

async function addLikesCountColumn() {
  try {
    console.log('正在检查并添加likes_count字段...');
    
    // 先检查字段是否存在
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'blog_db' 
      AND TABLE_NAME = 'articles' 
      AND COLUMN_NAME = 'likes_count'
    `);
    
    if (columns.length === 0) {
      // 字段不存在，添加字段
      await db.query(`
        ALTER TABLE blog_db.articles 
        ADD COLUMN likes_count INT NOT NULL DEFAULT 0 COMMENT '点赞数'
      `);
      console.log('likes_count字段添加成功！');
    } else {
      console.log('likes_count字段已存在，无需添加。');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('添加likes_count字段失败:', error);
    process.exit(1);
  }
}

addLikesCountColumn();
