/**
 * 格式化日期
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    console.warn('formatDate: 日期为空');
    return '';
  }

  try {
    // 如果已经是格式化好的字符串，直接返回
    if (typeof dateString === 'string' && dateString.includes('年')) {
      return dateString;
    }

    // 处理时间戳
    if (typeof dateString === 'number') {
      dateString = new Date(dateString);
    }

    // 处理字符串日期
    if (typeof dateString === 'string') {
      // 处理 MySQL datetime 格式 (YYYY-MM-DD HH:mm:ss)
      if (dateString.includes('T')) {
        dateString = dateString.replace('T', ' ').split('.')[0];
      }
      dateString = new Date(dateString);
    }

    // 检查日期是否有效
    if (isNaN(dateString.getTime())) {
      console.warn('formatDate: 无效的日期:', dateString);
      return '';
    }

    // 使用中文格式显示日期
    const year = dateString.getFullYear();
    const month = dateString.getMonth() + 1;
    const day = dateString.getDate();
    const hours = dateString.getHours().toString().padStart(2, '0');
    const minutes = dateString.getMinutes().toString().padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  } catch (error) {
    console.error('formatDate 错误:', error);
    return '';
  }
};

/**
 * 格式化更新时间
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的更新时间字符串
 */
export const formatUpdateTime = (dateString) => {
  if (!dateString) return '';

  const formattedDate = formatDate(dateString);
  if (!formattedDate) return '';

  return `更新于 ${formattedDate}`;
};

/**
 * 格式化数字（添加千位分隔符）
 * @param {number} num - 要格式化的数字
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * 计算阅读时间（分钟）
 * @param {number} wordCount - 文章字数
 * @returns {number} 预计阅读时间（分钟）
 */
export const calculateReadingTime = (wordCount) => {
  if (!wordCount) return 0;
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
};

// 获取图片URL
export const getImageUrl = (path) => {
  if (!path) return '/api/uploads/1749919075986-308926987.webp';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `/api${path}`;
  return `/api/uploads/${path}`;
}; 