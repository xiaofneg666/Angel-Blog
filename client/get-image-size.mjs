import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sizeOf from 'image-size';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 静态资源目录
const staticDir = join(__dirname, 'public', 'static');

// 检查image-size是否已安装
async function checkAndInstallDependencies() {
  try {
    await import('image-size');
  } catch (error) {
    console.log('Installing image-size dependency...');
    const { execSync } = await import('child_process');
    execSync('npm install image-size --save-dev', { stdio: 'inherit' });
  }
}

// 主函数
async function main() {
  await checkAndInstallDependencies();
  
  // 重新导入image-size，确保已安装
  const { default: sizeOf } = await import('image-size');
  
  console.log('\n=== 检查鼠标图标尺寸 ===\n');
  
  // 读取静态目录
  const files = fs.readdirSync(staticDir);
  const pngFiles = files.filter(file => file.endsWith('.png'));
  
  let hasLargeImages = false;
  
  for (const file of pngFiles) {
    const filePath = join(staticDir, file);
    
    try {
      const dimensions = sizeOf(filePath);
      const isLarge = dimensions.width > 128 || dimensions.height > 128;
      
      console.log(`${file}:`);
      console.log(`  尺寸: ${dimensions.width} x ${dimensions.height} px`);
      console.log(`  状态: ${isLarge ? '⚠️  过大（超过128x128px）' : '✅ 合适'}`);
      console.log();
      
      if (isLarge) {
        hasLargeImages = true;
      }
    } catch (error) {
      console.error(`❌ 无法读取${file}:`, error.message);
      console.log();
    }
  }
  
  if (hasLargeImages) {
    console.log('=== 解决方案 ===');
    console.log('1. 在线调整图片尺寸:');
    console.log('   - https://resizeimage.net/');
    console.log('   - https://www.iloveimg.com/resize-image');
    console.log('   - https://picresize.com/');
    console.log();
    console.log('2. 推荐尺寸: 64x64 px 或 32x32 px');
    console.log();
    console.log('3. 调整后替换 public/static 目录下的原图片');
    console.log();
  } else {
    console.log('✅ 所有图片尺寸都在推荐范围内！');
  }
}

// 执行主函数
main().catch(console.error);
