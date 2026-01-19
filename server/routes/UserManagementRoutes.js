const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/UserManagementControllers');

// 获取用户列表
router.get('/', userCtrl.getUsers);

// 获取单个用户信息
router.get('/:id', userCtrl.getUserById);

// 创建用户
router.post('/', userCtrl.createUser);

// 更新用户信息
router.put('/:id', userCtrl.updateUser);

// 删除用户
router.delete('/:id', userCtrl.deleteUser);

// 修改用户角色
router.put('/:id/role', userCtrl.changeUserRole);

// 更新用户状态
router.put('/:id/status', userCtrl.updateUserStatus);

// 重置用户密码
router.put('/:id/reset-password', userCtrl.resetUserPassword);

module.exports = router; 