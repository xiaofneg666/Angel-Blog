const mysql = require('mysql2/promise');

// 创建数据库连接池（保持原配置）
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'blog_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 初始化数据库表（完善后的版本）
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // 1. 用户表（与 blog_db.sql 完全一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
        username VARCHAR(50) NOT NULL COMMENT '用户名(唯一)',
        email VARCHAR(100) NOT NULL COMMENT '邮箱(唯一)',
        password VARCHAR(255) NOT NULL COMMENT '密码',
        role ENUM('admin','user') NOT NULL DEFAULT 'user' COMMENT '用户角色',
        avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
        bio TEXT DEFAULT NULL COMMENT '个人简介',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        UNIQUE KEY username_unique (username),
        UNIQUE KEY email_unique (email),
        KEY role_index (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表'
    `);

    // 检查并添加bio字段
    try {
      // 先检查字段是否存在
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'blog_db' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'bio'
      `);

      // 如果字段不存在，则添加
      if (columns.length === 0) {
        await connection.query('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL COMMENT "个人简介"');
        console.log('bio字段添加成功');
      } else {
        console.log('bio字段已存在');
      }
    } catch (error) {
      console.error('添加bio字段失败:', error);
    }

    // 2. 文章主表（替换原 posts 表，与 blog_db.sql 一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章ID，主键',
        title VARCHAR(255) NOT NULL COMMENT '文章主标题',
        content LONGTEXT NULL COMMENT '文章完整HTML内容（可选）',
        excerpt VARCHAR(500) NULL DEFAULT NULL COMMENT '文章摘要',
        publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '首次发布时间',
        update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
        view_count INT NOT NULL DEFAULT 0 COMMENT '阅读量统计',
        word_count INT NULL DEFAULT NULL COMMENT '文章字数统计',
        read_duration INT NULL DEFAULT NULL COMMENT '预计阅读时长(分钟)',
        is_recommended TINYINT(1) NULL DEFAULT 0 COMMENT '是否推荐(0否1是)',
        is_pinned TINYINT(1) NULL DEFAULT 0 COMMENT '是否置顶(0否1是)',
        status enum('待审核','审核通过','已拒绝') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '待审核' COMMENT '文章状态',
        cover_image VARCHAR(255) NULL DEFAULT NULL COMMENT '封面图URL',
        author_id BIGINT NULL DEFAULT NULL COMMENT '作者ID（关联 users.id）',
        version VARCHAR(20) NULL DEFAULT '1.0' COMMENT '文章版本号',
        article_type INT NULL DEFAULT NULL COMMENT '文章分类ID',
        category_id INT NULL DEFAULT NULL COMMENT '文章分类ID',
        PRIMARY KEY (id),
        INDEX idx_publish_time (publish_time),
        INDEX idx_status (status),
        INDEX fk_article_author (author_id),
        INDEX fk_article_category (article_type),
        FULLTEXT INDEX ft_title_content (title, excerpt),
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (article_type) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章主表'
    `);

    // 3. 文章章节表（新增，与 blog_db.sql 一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS article_sections (
        id BIGINT NOT NULL AUTO_INCREMENT COMMENT '章节ID',
        article_id BIGINT NOT NULL COMMENT '关联的文章ID',
        level TINYINT NOT NULL COMMENT '标题级别(1-6对应h1-h6)',
        title VARCHAR(255) NOT NULL COMMENT '章节标题',
        content TEXT NOT NULL COMMENT '章节内容',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
        anchor VARCHAR(100) NULL DEFAULT NULL COMMENT '锚点ID',
        PRIMARY KEY (id),
        INDEX idx_article_id (article_id),
        INDEX idx_sort_order (article_id, sort_order),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章章节表'
    `);

    // 4. 标签表（新增，与 blog_db.sql 一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id BIGINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE INDEX name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='标签表'
    `);

    // 5. 文章-标签关联表（新增，与 blog_db.sql 一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS article_tags (
        id BIGINT NOT NULL AUTO_INCREMENT,
        article_id BIGINT NOT NULL,
        tag_id BIGINT NOT NULL,
        PRIMARY KEY (id),
        UNIQUE INDEX article_tag_unique (article_id, tag_id),
        INDEX tag_id (tag_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章-标签关联表'
    `);

    // 6. 评论表（优化外键，与 blog_db.sql 一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
        article_id BIGINT NOT NULL COMMENT '关联的文章ID',
        user_id BIGINT NOT NULL COMMENT '评论用户ID',
        content TEXT NOT NULL COMMENT '评论内容',
        parent_id BIGINT NULL DEFAULT NULL COMMENT '父评论ID(回复评论用)',
        root_id BIGINT NULL DEFAULT NULL COMMENT '根评论ID',
        username VARCHAR(50) NOT NULL COMMENT '评论者用户名',
        avatar VARCHAR(255) NULL DEFAULT NULL COMMENT '评论者头像',
        reply_to_user_id BIGINT NULL DEFAULT NULL COMMENT '回复的用户ID',
        reply_to_username VARCHAR(50) NULL DEFAULT NULL COMMENT '回复的用户名',
        like_count INT NULL DEFAULT 0 COMMENT '点赞数',
        status ENUM('pending','approved','rejected') NULL DEFAULT 'pending' COMMENT '审核状态',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (id),
        INDEX idx_article_id (article_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章评论表'
    `);

    // 7. 轮播图表（新增，与 blog_db.sql 一致）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS slider (
        id INT NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
        image_path VARCHAR(255) NOT NULL COMMENT '图片存储路径',
        title VARCHAR(100) NULL DEFAULT NULL COMMENT '轮播图标题',
        link VARCHAR(255) NULL DEFAULT NULL COMMENT '点击跳转链接',
        sort_order TINYINT NULL DEFAULT 0 COMMENT '显示顺序（数值越小越靠前）',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='轮播图表'
    `);

    // 留言表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id int NOT NULL AUTO_INCREMENT COMMENT '留言ID',
        user_id int NOT NULL COMMENT '发布者用户',
        content text NOT NULL COMMENT '留言内容',
        x int NOT NULL COMMENT 'X轴坐标位置',
        y int NOT NULL COMMENT 'Y轴坐标位置',
        color varchar(20) NOT NULL COMMENT '便签背景颜色',
        rotate float NOT NULL COMMENT '旋转角度(度)',
        tape_color varchar(20) NOT NULL COMMENT '顶部胶带颜色',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (id),
        KEY user_id_index (user_id),
        CONSTRAINT fk_message_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='留言墙消息表，存储用户留言及显示属性'
    `);

    // 新增：名言警句存储表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sayings (
        id int NOT NULL AUTO_INCREMENT COMMENT '主键ID，自增长',
        content varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '名言内容，非空字段',
        create_time timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
        update_time timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间，自动更新',
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='名言警句存储表'
    `);

    connection.release();
    console.log('数据库表初始化完成（已同步 blog_db.sql 所有表结构）');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    // 关键修改：初始化失败时抛出错误，避免静默失败
    throw error;
  }
}

// 调用初始化函数（保持原逻辑）
initializeDatabase();

// 导出数据库连接池（保持原逻辑）
module.exports = pool;