const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'toolsData.js');
const content = fs.readFileSync(filePath, 'utf8');

const updatedContent = content.replace(
  /id: '1',\s*name: '[^']*',\s*description: '[^']*',\s*platforms: \[[^\]]*\],/s,
  `id: '1',
    name: '抖音橱窗助手',
    description: '一键设置抖音橱窗，提高商品转化率，优化橱窗布局',
    platforms: ['douyin', 'taobao'],
    categories: ['project_research'],`
);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('文件已更新，添加了categories字段'); 