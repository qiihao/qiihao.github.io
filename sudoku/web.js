// 导入所需模块
const http = require('http');
const fs = require('fs');
const path = require('path');
// const mime = require('mime-types');

// 定义服务器端口
const PORT = process.env.PORT || 3000;

// 定义静态文件目录
const STATIC_DIR = './';

// 定义响应数据
const welcomeMessage = 'Welcome to my Simple Node.js Web Server!';
const apiData = {
  message: 'This is some sample JSON data from the API',
  timestamp: new Date().toISOString(),
};

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  // 处理不同请求路由
  switch (req.url) {
    case '/':
      // 主页路由
      res.writeHead(200);
      res.end(welcomeMessage);
      break;
    case '/api/data':
      // API 路由，返回 JSON 数据
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(apiData));
      break;
    default:
      // 尝试从静态文件目录返回对应文件
      const filePath = path.join(STATIC_DIR, req.url.slice(1));
      try {
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
        //   const contentType = mime.contentType(path.extname(filePath));
        //   res.setHeader('Content-Type', contentType);
          res.writeHead(200);
          fs.createReadStream(filePath).pipe(res);
        } else {
          throw new Error('Requested path is not a file');
        }
      } catch (error) {
        // 文件不存在或不是文件，返回 404 错误
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});