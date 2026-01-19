const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// 获取所有留言
router.get('/', messageController.getAllMessages);

// 添加新留言
router.post('/', messageController.addMessage);

// 更新留言位置
router.put('/:id', messageController.updateMessagePosition);

module.exports = router;