const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/UserManagementControllers');

router.get('/admin', userCtrl.getUsers);

module.exports = router; 