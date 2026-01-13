const fs = require('fs');
const path = require('path');

// 图片尺寸检查脚本
const staticDir = path.join(__dirname, 'public', 'static');

// 读取目录中的所有PNG文件
fs.readdir(staticDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const pngFiles = files.filter(file => file.endsWith('.png'));
  
  console.log('Checking PNG image sizes in', staticDir);
  console.log('==================================');
  
  pngFiles.forEach(file => {
    const filePath = path.join(staticDir, file);
    
    // 使用简单的方式获取文件信息（虽然不能直接获取尺寸，但可以获取文件大小）
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error('Error getting file stats:', err);
        return;
      }
      
      console.log(`${file}: ${stats.size} bytes`);
    });
  });
});
