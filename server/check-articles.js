const mysql = require('mysql2/promise');

async function checkArticles() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'blog_db'
    });

    console.log('成功连接到数据库');

    // 查询所有文章，按作者ID和状态分组
    const [allArticles] = await connection.query(
      'SELECT COUNT(*) as total FROM articles'
    );

    const [articlesByAuthorAndStatus] = await connection.query(
      'SELECT author_id, COUNT(*) as total, status FROM articles GROUP BY author_id, status'
    );

    // 查询具体作者ID的文章情况
    const [userIds] = await connection.query(
      'SELECT id, username FROM users'
    );

    console.log('\n数据库中所有文章总数:', allArticles[0].total);
    console.log('\n按作者ID和状态分组的文章数量:');
    articlesByAuthorAndStatus.forEach(row => {
      console.log(`作者ID: ${row.author_id}, 状态: ${row.status}, 数量: ${row.total}`);
    });

    console.log('\n系统中的用户:');
    userIds.forEach(user => {
      console.log(`用户ID: ${user.id}, 用户名: ${user.username}`);
    });

    // 检查用户1的文章详情
    const [user1Articles] = await connection.query(
      'SELECT id, title, status, author_id FROM articles WHERE author_id = ?',
      [1]
    );

    console.log('\n用户ID为1的所有文章详情:');
    user1Articles.forEach(article => {
      console.log(`文章ID: ${article.id}, 标题: ${article.title}, 状态: ${article.status}, 作者ID: ${article.author_id}`);
    });

    // 检查API实际返回的数据
    const [apiStats] = await connection.query(
      'SELECT COUNT(*) as total FROM articles WHERE author_id = ?',
      [1]
    );

    const [apiRecentArticles] = await connection.query(
      `SELECT 
        a.id, 
        a.title, 
        a.excerpt,
        a.cover_image,
        a.publish_time,
        a.view_count,
        u.username as author_name,
        (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.author_id = ? AND a.status = '审核通过'
      ORDER BY a.publish_time DESC`,
      [1]
    );

    console.log('\nAPI实际返回的数据:');
    console.log('文章总数:', apiStats[0].total);
    console.log('返回的文章列表数量:', apiRecentArticles.length);
    console.log('返回的文章标题:', apiRecentArticles.map(a => a.title));

    await connection.end();
    console.log('\n数据库连接已关闭');
  } catch (error) {
    console.error('查询数据库时出错:', error);
  }
}

checkArticles();