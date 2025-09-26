const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// === 关键配置 ===
const NOTE_REPO_PATH = "temp-notes"; // 笔记仓库内容存放路径
const PUBLIC_DIR = "public"; // 生成的静态文件目录

// 清空并重建public目录
if (fs.existsSync(PUBLIC_DIR)) {
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// 复制笔记仓库的整个目录到public（保留图片等资源）
fs.cpSync(NOTE_REPO_PATH, PUBLIC_DIR, { recursive: true });

// 生成博客首页
const posts = [];
const mdFiles = fs.readdirSync(NOTE_REPO_PATH).filter((f) => f.endsWith(".md"));

mdFiles.forEach((file) => {
  const filePath = path.join(NOTE_REPO_PATH, file);
  const content = fs.readFileSync(filePath, "utf8");

  // 提取标题（优先使用# 标题，否则用文件名）
  let title = file.replace(".md", "");
  const firstLine = content.split("\n")[0];
  if (firstLine.startsWith("# ")) {
    title = firstLine.substring(2).trim();
  }

  // 转换Markdown为HTML
  const html = marked(content);

  // 保存单个文章页
  const htmlFile = path.join(PUBLIC_DIR, file.replace(".md", ".html"));
  const articleHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 我的博客</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; margin-bottom: 1rem; }
    h2, h3 { color: #34495e; margin-top: 2rem; }
    pre { 
      background-color: #f6f8fa; 
      padding: 16px; 
      border-radius: 6px; 
      overflow-x: auto;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 85%;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 1rem 0;
      color: #666;
    }
    a { 
      color: #0366d6; 
      text-decoration: none; 
    }
    a:hover { 
      text-decoration: underline; 
    }
    .back-home {
      display: inline-block;
      margin-bottom: 2rem;
      color: #0366d6;
      text-decoration: none;
    }
    .back-home:hover {
      text-decoration: underline;
    }
    .article-meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <a href="index.html" class="back-home">← 返回首页</a>
  <h1>${title}</h1>
  <div class="article-content">
    ${html}
  </div>
</body>
</html>
  `;
  fs.writeFileSync(htmlFile, articleHtml);

  // 记录到首页
  posts.push({ title, filename: file.replace(".md", ".html") });
});

// 生成首页 index.html
let indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的博客</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; margin-bottom: 2rem; }
    .header {
      border-bottom: 1px solid #e1e4e8;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .description {
      color: #666;
      margin-bottom: 2rem;
    }
    ul { list-style-type: none; padding: 0; }
    li { 
      margin: 15px 0; 
      padding: 15px 0;
      border-bottom: 1px solid #f1f3f5;
    }
    li:last-child {
      border-bottom: none;
    }
    .post-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    .post-link {
      text-decoration: none;
      color: #2c3e50;
      display: block;
    }
    .post-link:hover {
      color: #0366d6;
    }
    .post-link:hover .post-title {
      text-decoration: underline;
    }
    .post-meta {
      font-size: 0.9rem;
      color: #666;
    }
    footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e1e4e8;
      text-align: center;
      color: #666;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>我的博客</h1>
    <p class="description">记录学习、分享技术、探索生活</p>
  </div>
  
  <ul>
    ${posts
      .map((post) => `
        <li>
          <a href="${post.filename}" class="post-link">
            <div class="post-title">${post.title}</div>
            <div class="post-meta">点击阅读 →</div>
          </a>
        </li>
      `)
      .join("")}
  </ul>
  
  <footer>
    <p>© ${new Date().getFullYear()} 我的博客. 使用 GitHub Pages 构建.</p>
  </footer>
</body>
</html>
`;

fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), indexHtml);
console.log("✅ 博客生成完成！共", posts.length, "篇文章");