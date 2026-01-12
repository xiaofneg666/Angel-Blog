/* postController.js - 文章相关控制器 */
const pool = require('../models/db');
const path = require('path');

// 获取所有文章
exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT p.*, u.username 
      FROM articles p 
      JOIN users u ON p.author_id = u.id 
      ORDER BY p.publish_time DESC
    `);
    res.json(posts);
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单篇文章
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const [posts] = await pool.query(`
      SELECT p.*, u.username 
      FROM articles p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `, [postId]);

    if (posts.length === 0) {
      return res.status(404).json({ message: '文章未找到' });
    }

    res.json(posts[0]);
  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建新文章
exports.createPost = async (req, res) => {
  try {
    console.log('开始创建文章，请求数据:', req.body);
    const { title, content, excerpt, articleType } = req.body;
    let coverImage = null;

    // 完善参数验证
    if (!title) return res.status(400).json({ message: '缺少必填参数：标题' });
    if (!content) return res.status(400).json({ message: '缺少必填参数：内容' });
    if (!articleType) return res.status(400).json({ message: '缺少必填参数：文章分类' });

    // 处理封面图上传
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
      console.log('上传的封面图片:', coverImage);
    }

    // 先检查默认用户是否存在
    console.log('检查默认用户...');
    let defaultUserId = 1;
    try {
      const [users] = await pool.query('SELECT id FROM users WHERE id = 1');
      if (users.length === 0) {
        console.log('默认用户不存在，创建新用户...');
        try {
          // 如果默认用户不存在，创建一个
          const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['default_user', 'default@example.com', 'default_password', 'user']
          );
          defaultUserId = result.insertId;
          console.log('默认用户创建成功，ID:', defaultUserId);
        } catch (error) {
          console.error('创建默认用户失败:', error);
          if (error.code === 'ER_DUP_ENTRY') {
            // 如果是因为用户名或邮箱重复，尝试使用不同的值
            const timestamp = Date.now();
            const [result] = await pool.query(
              'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
              [`default_user_${timestamp}`, `default_${timestamp}@example.com`, 'default_password', 'user']
            );
            defaultUserId = result.insertId;
            console.log('使用新用户名创建默认用户成功，ID:', defaultUserId);
          } else {
            throw error;
          }
        }
      } else {
        console.log('默认用户已存在，ID:', users[0].id);
        defaultUserId = users[0].id;
      }
    } catch (error) {
      console.error('处理默认用户时出错:', error);
      throw new Error(`处理默认用户时出错: ${error.message}`);
    }

    console.log('开始插入文章数据...');
    try {
      const [result] = await pool.query(
        `INSERT INTO articles (
          title, 
          content, 
          excerpt, 
          cover_image, 
          article_type, 
          author_id,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, content, excerpt, coverImage, articleType, defaultUserId, '待审核'] // 将 'published' 改为 '待审核'
      );
      console.log('文章数据插入成功，ID:', result.insertId);

      // 获取新创建的文章
      console.log('获取新创建的文章详情...');
      const [newArticle] = await pool.query(`
        SELECT p.*, u.username 
        FROM articles p 
        JOIN users u ON p.author_id = u.id 
        WHERE p.id = ?
      `, [result.insertId]);

      if (!newArticle || newArticle.length === 0) {
        throw new Error('无法获取新创建的文章');
      }

      console.log('文章创建完成，返回数据:', newArticle[0]);
      res.status(201).json(newArticle[0]);
    } catch (error) {
      console.error('插入文章数据失败:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          message: '文章标题已存在，请使用其他标题',
          error: error.message
        });
      }
      throw new Error(`插入文章数据失败: ${error.message}`);
    }
  } catch (error) {
    console.error('创建文章错误:', error);
    console.error('错误堆栈:', error.stack);
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);

    // 根据错误类型返回不同的错误信息
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({
        message: '缺少必填字段',
        error: error.message,
        details: '请确保所有必填字段都已填写'
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({
        message: '引用的用户不存在',
        error: error.message,
        details: '请确保用户ID有效'
      });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: '数据重复',
        error: error.message,
        details: '请检查是否有重复的数据'
      });
    }

    res.status(500).json({
      message: '服务器错误',
      error: error.message,
      code: error.code,
      stack: error.stack,
      details: '请检查服务器日志获取更多信息'
    });
  }
};

// 更新文章
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, excerpt, articleType } = req.body;
    let coverImage = null;

    if (!title || !content) {
      return res.status(400).json({ message: '请提供标题和内容' });
    }

    // 处理封面图上传
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const [posts] = await pool.query('SELECT * FROM articles WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ message: '文章未找到' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (content) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (excerpt) {
      updateFields.push('excerpt = ?');
      updateValues.push(excerpt);
    }
    if (articleType) {
      updateFields.push('article_type = ?');
      updateValues.push(articleType);
    }
    if (coverImage) {
      updateFields.push('cover_image = ?');
      updateValues.push(coverImage);
    }

    updateValues.push(postId);

    await pool.query(
      `UPDATE articles SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 获取更新后的文章
    const [updatedArticle] = await pool.query(`
      SELECT p.*, u.username 
      FROM articles p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `, [postId]);

    res.json(updatedArticle[0]);
  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除文章
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const [posts] = await pool.query('SELECT * FROM articles WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ message: '文章未找到' });
    }

    await pool.query('DELETE FROM articles WHERE id = ?', [postId]);

    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 上传图片
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: imageUrl,
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('上传图片错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};