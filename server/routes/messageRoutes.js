const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// 应用认证中间件但允许匿名访问（已在中间件中处理）
router.use(authMiddleware);

// 获取所有留言
router.get('/', messageController.getAllMessages);

// 添加新留言
router.post('/', messageController.addMessage);

module.exports = router;