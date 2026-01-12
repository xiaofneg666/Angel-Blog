<template>
  <div class="settings-container">
    <h1 class="page-title">系统设置</h1>

    <!-- 设置卡片容器 -->
    <div class="settings-cards">
      <!-- 网站基本设置 -->
      <div class="setting-card">
        <div class="card-header">
          <h2 class="card-title">网站基本设置</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="siteName">网站名称</label>
            <input type="text" id="siteName" placeholder="输入网站名称" class="form-control">
          </div>
          <div class="form-group">
            <label for="siteDescription">网站描述</label>
            <textarea id="siteDescription" placeholder="输入网站描述" class="form-control"></textarea>
          </div>
          <div class="form-group">
            <label for="siteLogo">网站Logo</label>
            <div class="logo-upload">
              <div class="logo-preview"></div>
              <button class="upload-btn">上传Logo</button>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="save-btn">保存设置</button>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="setting-card">
        <div class="card-header">
          <h2 class="card-title">安全设置</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="loginProtection">登录保护</label>
            <select id="loginProtection" class="form-control">
              <option value="enabled">启用</option>
              <option value="disabled">禁用</option>
            </select>
          </div>
          <div class="form-group">
            <label class="switch-label">
              <input type="checkbox" class="switch">
              <span class="switch-slider"></span>
              启用两步验证
            </label>
          </div>
        </div>
        <div class="card-footer">
          <button class="save-btn">保存设置</button>
        </div>
      </div>

      <!-- 缓存设置 -->
      <div class="setting-card">
        <div class="card-header">
          <h2 class="card-title">缓存设置</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="cacheTime">缓存过期时间 (分钟)</label>
            <input type="number" id="cacheTime" class="form-control" value="30">
          </div>
          <div class="cache-status">
            <p>当前缓存大小: <span class="size-value">2.4 MB</span></p>
            <button class="clear-btn">清除缓存</button>
          </div>
        </div>
        <div class="card-footer">
          <button class="save-btn">保存设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 空脚本，仅保留样式实现
</script>

<style scoped>
/* 基础样式 */
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

/* 设置卡片容器 */
.settings-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* 设置卡片样式 */
.setting-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  text-align: right;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #303133;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

/* Logo上传区域 */
.logo-upload {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

/* 按钮样式 */
.save-btn {
  padding: 8px 16px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background-color: #3080e8;
}

.upload-btn {
  padding: 8px 16px;
  background-color: #f5f7fa;
  color: #409eff;
  border: 1px solid #c0c4cc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn {
  padding: 6px 12px;
  background-color: #f56c6c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
}

/* 缓存状态 */
.cache-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.size-value {
  font-weight: 500;
  color: #409eff;
}

/* 开关样式 */
.switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.switch {
  display: none;
}

.switch-slider {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: #dcdfe6;
  border-radius: 10px;
  margin-right: 8px;
  transition: background-color 0.2s;
}

.switch-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #fff;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.switch:checked + .switch-slider {
  background-color: #409eff;
}

.switch:checked + .switch-slider::after {
  transform: translateX(20px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .settings-cards {
    grid-template-columns: 1fr;
  }
}
</style>