const db = require('./models/db');

async function testComment() {
  try {
    // 查询ID为31的评论
    const [comments] = await db.query('SELECT * FROM comments WHERE id = ?', [31]);
    console.log('查询结果:', comments);
    
    if (comments.length > 0) {
      console.log('评论存在，详细信息:', comments[0]);
    } else {
      console.log('评论不存在');
    }
    
    // 查询所有评论，查看ID范围
    const [allComments] = await db.query('SELECT id, user_id, article_id, content FROM comments ORDER BY id DESC LIMIT 10');
    console.log('最近10条评论:', allComments);
    
    // 查询用户表，查看当前登录用户信息（假设用户ID为2）
    const [users] = await db.query('SELECT id, username, avatar FROM users WHERE id = ?', [2]);
    console.log('用户信息:', users);
    
    process.exit(0);
  } catch (error) {
    console.error('查询出错:', error);
    process.exit(1);
  }
}

testComment();