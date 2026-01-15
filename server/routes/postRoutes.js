/*
 * @Author: 15526492160 2842982952@qq.com
 * @Date: 2025-06-11 01:36:54
 * @LastEditors: 15526492160 2842982952@qq.com
 * @LastEditTime: 2025-06-11 18:42:55
 * @FilePath: \小峰大王\blog-project\server\routes\postRoutes.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const authMiddlewareSimple = require('../middleware/authMiddleware');

// 修改存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一的文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许上传图片
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 图片上传接口
router.post('/upload', upload.single('image'), postController.uploadImage);

// 创建文章
router.post('/', upload.single('coverImage'), postController.createPost);

// 获取所有文章
router.get('/', postController.getAllPosts);

// 获取单个文章
router.get('/:id', postController.getPostById);

// 更新文章
router.put('/:id', upload.single('coverImage'), postController.updatePost);

// 删除文章
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;