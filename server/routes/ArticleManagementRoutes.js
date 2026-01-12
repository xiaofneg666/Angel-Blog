const express = require('express');
const router = express.Router();
const articleAdminController = require('../controllers/ArticleManagemenControllers');

router.get('/admin', articleAdminController.getAdminArticles);

module.exports = router;