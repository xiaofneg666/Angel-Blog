// 使用CommonJS语法导入node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 使用实际的token和评论ID进行测试
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoi5bCP5bOwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjgzNTQ5MTEsImV4cCI6MTc2ODQ0MTMxMX0.IDEfMKCOoPtvoojsEuwPHh26qovBIQiB3xnZJhJ5TgM';
const commentId = 31;
const url = `http://localhost:3000/api/comments/${commentId}`;

async function testDeleteComment() {
  try {
    console.log(`开始测试删除评论，ID: ${commentId}`);
    console.log(`请求URL: ${url}`);
    console.log(`使用的token: ${token}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`响应状态码: ${response.status}`);
    console.log(`响应状态文本: ${response.statusText}`);
    
    const result = await response.json();
    console.log('响应结果:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('测试删除评论出错:', error);
    process.exit(1);
  }
}

testDeleteComment();