const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// 验证管理员权限的中间件
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

// 仪表盘数据
router.get('/dashboard', adminController.getDashboardData);
// 文章管理路由
router.get('/articles', adminController.getArticles);
router.put('/articles/:id/status', adminController.updateArticleStatus);
// 用户管理路由
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
// 评论管理路由
router.get('/comments', adminController.getComments);
router.delete('/comments/:id', adminController.deleteComment);

module.exports = router;