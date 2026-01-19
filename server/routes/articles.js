const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');
const multer = require('multer');
const { checkArticle } = require('../utils/sensitiveWords');
const { verifyToken } = require('../controllers/authController');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// Multer 错误处理中间件
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制，最大允许5MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '文件字段名不正确'
      });
    }
    return res.status(400).json({
      success: false,
      message: `文件上传错误: ${err.message}`
    });
  }
  if (err.message === '只允许上传图片文件') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const offset = (page - 1) * pageSize;

    // 获取文章总数
    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM articles WHERE status = "审核通过"');
    const total = totalRows[0].total;

    // 获取文章列表
    const sql = `
      SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.cover_image,
        a.publish_time,
        a.update_time,
        a.view_count,
        a.is_pinned,
        c.name as category_name,
        u.username as author_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = '审核通过'
      ORDER BY a.is_pinned DESC, a.publish_time DESC
      LIMIT ? OFFSET ?
    `;

    const [articles] = await db.query(sql, [pageSize, offset]);

    // 处理文章数据
    const processedArticles = articles.map(article => {
      // 处理封面图片路径
      let coverImage = article.cover_image;
      if (coverImage) {
        if (!coverImage.startsWith('/uploads/')) {
          coverImage = `/uploads/${coverImage}`;
        }
      } else {
        coverImage = '/1.jpg';  // 使用client/public目录下的1.jpg作为默认图片
      }

      return {
        ...article,
        cover_image: coverImage,
        publish_time: new Date(article.publish_time).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });

    res.json({
      success: true,
      data: {
        articles: processedArticles,
        total,
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败'
    });
  }
});

// 获取推荐文章列表
router.get('/recommended', async (req, res) => {
  try {
    // 检查所有文章数据
    const checkSql = `
      SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.cover_image,
        a.publish_time,
        a.view_count,
        a.is_recommended,
        a.status,
        u.username as author_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      ORDER BY a.publish_time DESC
    `;

    console.log('检查所有文章数据:', checkSql);
    const [allArticles] = await db.query(checkSql);
    console.log('所有文章数据:', allArticles);

    // 获取推荐文章
    const sql = `
      SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.cover_image,
        a.publish_time,
        a.view_count,
        u.username as author_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      WHERE a.is_recommended = 1 AND a.status = '审核通过'
      ORDER BY a.publish_time DESC
    `;

    console.log('获取推荐文章:', sql);
    const [articles] = await db.query(sql);
    console.log('推荐文章数据:', articles);

    // 处理文章数据
    const processedArticles = articles.map(article => {
      // 处理封面图片路径
      let coverImage = article.cover_image;
      if (coverImage) {
        if (!coverImage.startsWith('/uploads/')) {
          coverImage = `/uploads/${coverImage}`;
        }
      } else {
        coverImage = '/1.jpg';  // 使用client/public目录下的1.jpg作为默认图片
      }

      return {
        ...article,
        cover_image: coverImage,
        publish_time: new Date(article.publish_time).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });

    console.log('处理后的推荐文章数据:', processedArticles);
    res.json(processedArticles);
  } catch (error) {
    console.error('获取推荐文章失败:', error);
    res.status(500).json({ message: '获取推荐文章失败' });
  }
});

// 获取分类统计
router.get('/categories/stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id,
        c.name,
        COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = '审核通过'
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `;

    const [categories] = await db.query(sql);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败'
    });
  }
});

// 获取文章归档（按月份分组）
router.get('/archive', async (req, res) => {
  try {
    // 查询所有审核通过的文章，按发布时间倒序
    const sql = `
      SELECT 
        a.id,
        a.title,
        a.publish_time,
        a.view_count,
        a.cover_image,
        c.name as category_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = '审核通过'
      ORDER BY a.publish_time DESC
    `;

    const [articles] = await db.query(sql);

    // 按月份分组
    const archiveData = {};
    
    articles.forEach(article => {
      // 格式化日期为 YYYY-MM 格式
      const date = new Date(article.publish_time);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const yearMonthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      
      if (!archiveData[yearMonth]) {
        archiveData[yearMonth] = {
          yearMonth,
          yearMonthLabel,
          count: 0,
          articles: []
        };
      }
      
      // 处理封面图片路径
      let coverImage = null;
      if (article.cover_image) {
        if (!article.cover_image.startsWith('/uploads/')) {
          coverImage = `/uploads/${article.cover_image}`;
        } else {
          coverImage = article.cover_image;
        }
      }
      
      archiveData[yearMonth].articles.push({
        id: article.id,
        title: article.title,
        date: date.toLocaleDateString('zh-CN'),
        publish_time: article.publish_time,
        view_count: article.view_count,
        category_name: article.category_name,
        cover_image: coverImage
      });
      
      archiveData[yearMonth].count++;
    });
    
    // 转换为数组并按时间倒序排列
    const result = Object.values(archiveData).sort((a, b) => {
      return b.yearMonth.localeCompare(a.yearMonth);
    });
    
    // 获取文章总数
    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM articles WHERE status = "审核通过"');
    const total = totalRows[0].total;

    res.json({
      success: true,
      data: {
        archive: result,
        total: total
      }
    });
  } catch (error) {
    console.error('获取文章归档失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章归档失败'
    });
  }
});

// 获取文章详情
router.get('/:id', async (req, res) => {
  try {
    // 获取文章基本信息
    const articleSql = `
      SELECT 
        a.*,
        u.username as author_name,
        u.avatar as author_avatar
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `;

    // 获取文章章节信息
    const sectionsSql = `
      SELECT 
        id,
        level,
        title,
        anchor,
        sort_order
      FROM article_sections
      WHERE article_id = ?
      ORDER BY sort_order ASC
    `;

    const [articleRows] = await db.query(articleSql, [req.params.id]);
    const [sections] = await db.query(sectionsSql, [req.params.id]);

    if (articleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const article = articleRows[0];

    // 添加日志查看原始时间
    console.log('数据库原始时间:', {
      publish_time: article.publish_time,
      update_time: article.update_time
    });

    // 处理图片路径
    if (article.cover_image) {
      if (!article.cover_image.startsWith('/uploads/')) {
        article.cover_image = `/uploads/${article.cover_image}`;
      }
    } else {
      article.cover_image = '/uploads/1749919075986-308926987.webp';
    }

    if (article.author_avatar) {
      if (!article.author_avatar.startsWith('/uploads/')) {
        article.author_avatar = `/uploads/${article.author_avatar}`;
      }
    } else {
      article.author_avatar = '/uploads/default-avatar.jpg';
    }

    // 更新浏览量
    await db.query('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);

    // 如果没有章节信息，从内容中提取标题生成目录
    if (sections.length === 0 && article.content) {
      const headings = extractHeadings(article.content);
      article.sections = headings;
    } else {
      article.sections = sections;
    }

    // 确保返回原始时间格式
    article.publish_time = article.publish_time.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    article.update_time = article.update_time.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章详情失败'
    });
  }
});

// 从HTML内容中提取标题
function extractHeadings(content) {
  const headings = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let sortOrder = 0;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    const anchor = `heading-${sortOrder}`;

    headings.push({
      level,
      title,
      anchor,
      sort_order: sortOrder++
    });
  }

  return headings;
}

// 创建文章
// 创建文章（需要认证）
router.post('/', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    console.log('收到创建文章请求:', {
      body: req.body,
      file: req.file,
      user: req.user
    });

    // 检查必填字段
    const { title, content, articleType, status } = req.body;
    if (!title || !content || !articleType) {
      console.log('缺少必填字段:', { title, content, articleType });
      return res.status(400).json({
        success: false,
        message: '标题、内容和文章类型为必填项'
      });
    }

    // 检查文章类型是否有效
    const [category] = await db.query('SELECT id FROM categories WHERE id = ?', [articleType]);
    if (!category.length) {
      console.log('无效的文章类型:', articleType);
      return res.status(400).json({
        success: false,
        message: '无效的文章类型'
      });
    }

    // 处理封面图片
    let coverImage = null;
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    // 生成摘要
    const excerpt = content.length > 200 ? content.substring(0, 200) + '...' : content;

    // 检查敏感词
    const article = {
      title,
      content,
      excerpt,
      articleType,
      coverImage
    };

    const sensitiveCheck = checkArticle(article);
    console.log('敏感词检查结果:', sensitiveCheck);

    // 状态映射：前端状态 -> 数据库状态
    const statusMap = {
      'draft': '待审核',
      'published': '审核通过',
      'pending': '待审核'
    };
    
    // 根据前端传递的状态和敏感词检查结果设置文章状态
    let finalStatus;
    
    if (sensitiveCheck.hasSensitiveWords) {
      // 包含敏感词时，无论用户选择什么状态，都强制设置为待审核
      finalStatus = '待审核';
      console.log('文章包含敏感词，强制设置为待审核状态');
    } else {
      // 不包含敏感词时，尊重用户选择的状态
      finalStatus = statusMap[status] || '审核通过';
      console.log('文章不包含敏感词，使用用户选择的状态:', status, '->', finalStatus);
    }

    // 插入文章数据
    const [result] = await db.query(
      `INSERT INTO articles (
        title, content, excerpt, category_id, 
        cover_image, status, author_id, word_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        excerpt,
        articleType, // 这里直接用 articleType 作为 category_id
        coverImage,
        finalStatus,
        req.user?.id || 1,
        content.length
      ]
    );

    // 获取新创建的文章
    const [newArticle] = await db.query(
      `SELECT a.*, c.name as category_name 
       FROM articles a 
       LEFT JOIN categories c ON a.category_id = c.id 
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      message: sensitiveCheck.hasSensitiveWords ?
        '文章已提交，等待审核' :
        '文章创建成功',
      data: {
        ...newArticle[0],
        sensitiveWords: sensitiveCheck.hasSensitiveWords ? sensitiveCheck.details : null
      }
    });

  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({
      success: false,
      message: '创建文章失败，请稍后重试'
    });
  }
});

// 获取分类统计
router.get('/categories/stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id,
        c.name,
        COUNT(a.id) as count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = '审核通过'
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `;

    const [categories] = await db.query(sql);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败'
    });
  }
});



// 获取用户文章统计
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('获取用户文章统计，用户ID:', userId);

    // 获取用户信息
    const [user] = await db.query(
      'SELECT username, avatar, bio FROM users WHERE id = ?',
      [userId]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    console.log('用户原始头像数据:', user[0].avatar);

    // 处理用户头像路径
    let avatarPath = user[0].avatar;
    if (avatarPath) {
      // 如果只是文件名（如 2222.jpg），添加完整路径
      if (!avatarPath.startsWith('/')) {
        avatarPath = `/api/head/${avatarPath}`;
      }
      // 如果是 /head/xxx 格式，添加 /api 前缀
      else if (avatarPath.startsWith('/head/')) {
        avatarPath = `/api${avatarPath}`;
      }
      // 如果已经是 /api/head/xxx 格式，保持不变
      else if (avatarPath.startsWith('/api/head/')) {
        avatarPath = avatarPath;
      }
    }

    const processedUser = {
      ...user[0],
      avatar: avatarPath
    };

    console.log('处理后的头像路径:', processedUser.avatar);

    // 获取文章总数（只统计审核通过的文章）
    const [articleCount] = await db.query(
      'SELECT COUNT(*) as total FROM articles WHERE author_id = ? AND status = ?',
      [userId, '审核通过']
    );

    // 获取总阅读量（只统计审核通过的文章）
    const [viewCount] = await db.query(
      'SELECT COALESCE(SUM(view_count), 0) as total FROM articles WHERE author_id = ? AND status = ?',
      [userId, '审核通过']
    );

    // 获取总评论数（用户文章收到的评论数，只统计审核通过的文章）
    const [commentCount] = await db.query(
      'SELECT COUNT(*) as total FROM comments WHERE article_id IN (SELECT id FROM articles WHERE author_id = ? AND status = ?)',
      [userId, '审核通过']
    );

    // 获取用户点赞的文章数量
    const [likeCount] = await db.query(
      'SELECT COUNT(*) as total FROM article_likes WHERE user_id = ? AND article_id IN (SELECT id FROM articles WHERE status = ?)',
      [userId, '审核通过']
    );

    // 获取用户收藏的文章数量
    const [collectionCount] = await db.query(
      'SELECT COUNT(*) as total FROM article_collections WHERE user_id = ? AND article_id IN (SELECT id FROM articles WHERE status = ?)',
      [userId, '审核通过']
    );

    // 获取所有发布的文章
    const [recentArticles] = await db.query(
      `SELECT 
        a.id, 
        a.title, 
        a.excerpt,
        a.cover_image,
        a.publish_time,
        a.view_count,
        u.username as author_name,
        (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count,
        (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
        EXISTS(SELECT 1 FROM article_likes WHERE article_id = a.id AND user_id = ?) as is_liked
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.author_id = ? AND a.status = '审核通过'
      ORDER BY a.publish_time DESC`,
      [userId, userId]
    );
    
    // 处理文章封面图片路径
    const processedRecentArticles = recentArticles.map(article => {
      let coverImage = article.cover_image;
      if (coverImage) {
        if (!coverImage.startsWith('/uploads/')) {
          coverImage = `/uploads/${coverImage}`;
        }
      } else {
        coverImage = '/1.jpg';
      }
      
      return {
        ...article,
        cover_image: coverImage
      };
    });

    res.json({
      success: true,
      data: {
        user: processedUser,
        stats: {
          articleCount: articleCount[0].total,
          viewCount: viewCount[0].total,
          commentCount: commentCount[0].total,
          likeCount: likeCount[0].total,
          collectionCount: collectionCount[0].total
        },
        recentArticles: processedRecentArticles
      }
    });
  } catch (error) {
    console.error('获取用户文章统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户文章统计失败',
      error: error.message
    });
  }
});

// 获取用户点赞的文章
router.get('/user/:userId/liked', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [articles] = await db.query(`
      SELECT 
        a.*,
        c.name as category_name,
        u.username as author_name,
        (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as like_count,
        TRUE as is_liked
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      INNER JOIN article_likes al ON a.id = al.article_id
      WHERE al.user_id = ? AND a.status = '审核通过'
      ORDER BY a.publish_time DESC
    `, [userId]);

    // 处理文章数据
    const processedArticles = articles.map(article => {
      let coverImage = article.cover_image;
      if (coverImage) {
        if (!coverImage.startsWith('/uploads/')) {
          coverImage = `/uploads/${coverImage}`;
        }
      } else {
        coverImage = '/1.jpg';
      }

      return {
        ...article,
        cover_image: coverImage,
        publish_time: new Date(article.publish_time).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });

    res.json({
      success: true,
      data: processedArticles
    });
  } catch (error) {
    console.error('获取用户点赞文章失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户点赞文章失败'
    });
  }
});

// 管理员获取文章列表
router.get('/admin', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword || '';
    const offset = (page - 1) * pageSize;

    // 构建搜索条件
    let searchCondition = '';
    let searchParams = [];
    if (keyword) {
      searchCondition = 'WHERE a.title LIKE ? OR a.content LIKE ?';
      searchParams = [`%${keyword}%`, `%${keyword}%`];
    }

    // 获取文章总数
    const [totalRows] = await db.query(
      `SELECT COUNT(*) as total FROM articles a ${searchCondition}`,
      searchParams
    );
    const total = totalRows[0].total;

    // 获取文章列表
    const sql = `
      SELECT 
        a.id,
        a.title,
        a.publish_time,
        a.update_time,
        a.view_count,
        a.status,
        u.username as author
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      ${searchCondition}
      ORDER BY a.publish_time DESC
      LIMIT ? OFFSET ?
    `;

    const [articles] = await db.query(sql, [...searchParams, pageSize, offset]);

    res.json({
      success: true,
      articles,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败'
    });
  }
});

// 更新文章
router.put('/:id', verifyToken, upload.single('cover_image'), async (req, res) => {
  try {
    console.log('收到更新文章请求:', {
      body: req.body,
      file: req.file,
      user: req.user,
      articleId: req.params.id
    });

    const { id } = req.params;
    const { title, content, excerpt, article_type, status } = req.body;
    const user = req.user;

    // 检查用户是否登录
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    // 检查必填字段
    if (!title || !content || !article_type) {
      return res.status(400).json({
        success: false,
        message: '标题、内容和文章类型为必填项'
      });
    }

    // 获取文章信息
    const [articleRows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (articleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const article = articleRows[0];

    // 检查用户是否是文章作者或管理员
    if (article.author_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限更新该文章'
      });
    }

    // 处理封面图片
    let cover_image = article.cover_image;
    if (req.file) {
      // 删除旧的封面图片
      const fs = require('fs');
      if (cover_image) {
        let oldImagePath = cover_image;
        // 处理图片路径，确保是正确的本地路径
        if (oldImagePath.startsWith('/uploads/')) {
          oldImagePath = oldImagePath.substring(9); // 移除 /uploads/ 前缀
        }
        const fullOldPath = path.join(__dirname, '..', 'public', 'uploads', oldImagePath);
        
        // 检查文件是否存在并删除
        if (fs.existsSync(fullOldPath)) {
          fs.unlinkSync(fullOldPath);
          console.log('旧封面图片已删除:', fullOldPath);
        }
      }
      // 设置新的封面图片
      cover_image = `/uploads/${req.file.filename}`;
    }

    // 生成摘要（如果没有提供）
    const finalExcerpt = excerpt || (content.length > 200 ? content.substring(0, 200) + '...' : content);
    
    // 状态映射：前端状态 -> 数据库状态
    const statusMap = {
      'draft': '待审核',
      'published': '审核通过',
      'pending': '待审核'
    };
    
    // 处理状态，默认保持原状态
    let finalStatus = article.status;
    if (status) {
      finalStatus = statusMap[status] || article.status;
    }

    // 更新数据库
    const updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE articles SET title = ?, content = ?, excerpt = ?, category_id = ?, cover_image = ?, status = ?, update_time = ?, word_count = ? WHERE id = ?',
      [
        title,
        content,
        finalExcerpt,
        article_type,
        cover_image,
        finalStatus,
        updateTime,
        content.length,
        id
      ]
    );

    // 获取更新后的文章
    const [updatedArticleRows] = await db.query(
      `SELECT a.*, c.name as category_name 
       FROM articles a 
       LEFT JOIN categories c ON a.category_id = c.id 
       WHERE a.id = ?`,
      [id]
    );

    const updatedArticle = updatedArticleRows[0];

    // 处理返回的图片路径
    if (updatedArticle.cover_image) {
      if (!updatedArticle.cover_image.startsWith('/uploads/')) {
        updatedArticle.cover_image = `/uploads/${updatedArticle.cover_image}`;
      }
    }

    console.log('文章更新成功:', updatedArticle.title);

    res.json({
      success: true,
      message: '文章更新成功',
      data: updatedArticle
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({
      success: false,
      message: '更新文章失败，请稍后重试',
      error: error.message
    });
  }
});

// 更新文章封面
router.put('/:id/cover', verifyToken, (req, res, next) => {
  upload.single('cover_image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('更新封面请求:', {
      id: req.params.id,
      user: req.user,
      file: req.file ? req.file.filename : '无文件',
      originalname: req.file ? req.file.originalname : '无文件'
    });

    const { id } = req.params;
    const user = req.user;

    // 检查用户是否登录
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    // 检查是否上传了文件
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的封面图片'
      });
    }

    // 获取文章信息
    const [articleRows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (articleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const article = articleRows[0];

    // 检查用户是否是文章作者或管理员
    if (article.author_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限更新该文章封面'
      });
    }

    // 删除旧的封面图片
    const fs = require('fs');
    if (article.cover_image) {
      let oldImagePath = article.cover_image;
      // 处理图片路径，确保是正确的本地路径
      if (oldImagePath.startsWith('/uploads/')) {
        oldImagePath = oldImagePath.substring(9); // 移除 /uploads/ 前缀
      }
      const fullOldPath = path.join(__dirname, '..', 'public', 'uploads', oldImagePath);
      
      // 检查文件是否存在并删除
      if (fs.existsSync(fullOldPath)) {
        fs.unlinkSync(fullOldPath);
        console.log('旧封面图片已删除:', fullOldPath);
      }
    }

    // 处理新的封面图片
    let cover_image = null;
    if (req.file) {
      cover_image = `/uploads/${req.file.filename}`;
    }

    // 更新数据库
    const updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(
      'UPDATE articles SET cover_image = ?, update_time = ? WHERE id = ?',
      [cover_image, updateTime, id]
    );

    // 返回更新后的文章数据
    const [updatedArticleRows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    const updatedArticle = updatedArticleRows[0];

    // 处理返回的图片路径
    if (updatedArticle.cover_image) {
      if (!updatedArticle.cover_image.startsWith('/uploads/')) {
        updatedArticle.cover_image = `/uploads/${updatedArticle.cover_image}`;
      }
    }

    console.log('封面更新成功:', updatedArticle.cover_image);

    res.json({
      success: true,
      message: '封面更新成功',
      data: updatedArticle
    });
  } catch (error) {
    console.error('更新封面失败:', error);
    res.status(500).json({
      success: false,
      message: '更新封面失败，请稍后重试',
      error: error.message
    });
  }
});

// 删除文章
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // 检查用户是否登录
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }

    // 获取文章信息
    const [articleRows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (articleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const article = articleRows[0];

    // 检查用户是否是文章作者或管理员
    if (article.author_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限删除该文章'
      });
    }

    // 删除封面图片
    const fs = require('fs');
    if (article.cover_image) {
      let coverImagePath = article.cover_image;
      // 处理图片路径，确保是正确的本地路径
      if (coverImagePath.startsWith('/uploads/')) {
        coverImagePath = coverImagePath.substring(1); // 移除 / 前缀
      }
      const fullPath = path.join(__dirname, '..', 'public', coverImagePath);
      
      // 检查文件是否存在并删除
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log('封面图片已删除:', fullPath);
      }
    }

    // 删除文章记录
    await db.query('DELETE FROM articles WHERE id = ?', [id]);

    console.log('文章删除成功:', id);

    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文章失败，请稍后重试',
      error: error.message
    });
  }
});

// 文章点赞功能
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 开始事务
    await db.query('START TRANSACTION');

    // 检查是否已经点赞
    const [existingLike] = await db.query(
      'SELECT * FROM article_likes WHERE article_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingLike.length > 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: '已经点赞过该文章'
      });
    }

    // 添加点赞记录
    await db.query(
      'INSERT INTO article_likes (article_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    // 更新文章点赞数
    await db.query(
      'UPDATE articles SET likes_count = likes_count + 1 WHERE id = ?',
      [id]
    );

    // 提交事务
    await db.query('COMMIT');

    res.json({
      success: true,
      message: '文章点赞成功'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('文章点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '文章点赞失败'
    });
  }
});

// 文章取消点赞功能
router.delete('/:id/like', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 开始事务
    await db.query('START TRANSACTION');

    // 检查是否已经点赞
    const [existingLike] = await db.query(
      'SELECT * FROM article_likes WHERE article_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingLike.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: '还没有点赞该文章'
      });
    }

    // 删除点赞记录
    await db.query(
      'DELETE FROM article_likes WHERE article_id = ? AND user_id = ?',
      [id, userId]
    );

    // 更新文章点赞数
    await db.query(
      'UPDATE articles SET likes_count = likes_count - 1 WHERE id = ?',
      [id]
    );

    // 提交事务
    await db.query('COMMIT');

    res.json({
      success: true,
      message: '取消点赞成功'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('取消点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '取消点赞失败'
    });
  }
});

// 检查用户是否点赞了文章
router.get('/:id/user-status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查是否点赞
    const [likeStatus] = await db.query(
      'SELECT EXISTS(SELECT 1 FROM article_likes WHERE article_id = ? AND user_id = ?) as is_liked',
      [id, userId]
    );

    res.json({
      success: true,
      data: {
        is_liked: likeStatus[0].is_liked === 1
      }
    });
  } catch (error) {
    console.error('获取用户文章状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户文章状态失败'
    });
  }
});

module.exports = router; 