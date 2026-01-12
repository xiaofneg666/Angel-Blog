const express = require('express');
const router = express.Router();
const sayingController = require('../controllers/sayingController');

// 获取随机名言接口
router.get('/random', sayingController.getRandomSaying);

module.exports = router;