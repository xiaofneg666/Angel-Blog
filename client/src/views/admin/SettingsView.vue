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
/* 全局变量 - 与其他管理页面保持一致 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;
  --border-color: #e4e7ed;
  --border-light: #ebeef5;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 24px 0 rgba(0, 0, 0, 0.15);
  --transition-base: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  --transition-fast: all 0.2s ease-in-out;
}

/* 基础样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 设置容器样式 */
.settings-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 60px);
}

/* 标题样式 */
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-light);
}

/* 设置卡片容器 */
.settings-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

/* 设置卡片样式 */
.setting-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-base);
  border: 1px solid var(--border-light);
  border-left: 4px solid var(--primary-color);
}

.setting-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-base);
}

/* 卡片头部样式 */
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(135deg, var(--border-light), #f8f9fa);
}

.card-title {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 卡片标题图标 */
.card-title::before {
  content: '⚙️';
  font-size: 20px;
}

/* 卡片内容样式 */
.card-body {
  padding: 24px;
}

/* 卡片底部样式 */
.card-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  background: linear-gradient(135deg, #fafafa, #f5f7fa);
  text-align: right;
}

/* 表单样式 */
.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-regular);
  font-weight: 600;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--card-bg);
  transition: var(--transition-base);
  outline: none;
  font-family: inherit;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

select.form-control {
  cursor: pointer;
}

select.form-control:hover {
  border-color: var(--primary-color);
}

/* Logo上传区域 */
.logo-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.logo-preview {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background: linear-gradient(135deg, var(--bg-color), #fafafa);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-base);
  cursor: pointer;
}

.logo-preview:hover {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #f5faff, #e6f7ff);
  transform: scale(1.05);
}

.logo-preview::before {
  content: '📁';
  font-size: 32px;
  color: var(--text-secondary);
  opacity: 0.5;
}

/* 按钮样式 */
.save-btn, .upload-btn, .clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 100px;
  justify-content: center;
}

.save-btn {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.save-btn:hover {
  background: linear-gradient(135deg, #3390e9, #53a8ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.save-btn:active {
  transform: translateY(0);
}

.upload-btn {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  color: var(--primary-color);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.upload-btn:hover {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
  color: var(--danger-color);
  border: 1px solid rgba(245, 108, 108, 0.2);
  padding: 10px 16px;
  font-size: 12px;
  min-width: 80px;
}

.clear-btn:hover {
  background: linear-gradient(135deg, var(--danger-color), #f78989);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

/* 缓存状态样式 */
.cache-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  border-radius: 8px;
  margin-top: 16px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: var(--transition-fast);
}

.cache-status:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.size-value {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 16px;
}

/* 开关样式 */
.switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--card-bg), #fafafa);
  border-radius: 8px;
  transition: var(--transition-fast);
  border: 1px solid var(--border-light);
}

.switch-label:hover {
  background: linear-gradient(135deg, #f5faff, #e6f7ff);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.switch {
  display: none;
}

.switch-slider {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 12px;
  transition: var(--transition-base);
  border: 2px solid var(--border-light);
}

.switch-slider::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--card-bg);
  top: 0;
  left: 0;
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.switch:checked + .switch-slider {
  background: linear-gradient(135deg, var(--primary-color), #66b1ff);
  border-color: var(--primary-color);
}

.switch:checked + .switch-slider::after {
  transform: translateX(26px);
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .settings-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-body,
  .card-header,
  .card-footer {
    padding: 16px;
  }
  
  .logo-upload {
    flex-direction: column;
    align-items: stretch;
  }
  
  .logo-preview {
    width: 100%;
    height: 120px;
  }
  
  .save-btn, .upload-btn, .clear-btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 20px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .form-control {
    padding: 10px 12px;
  }
}
</style>