const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'toolsData.js');
const content = fs.readFileSync(filePath, 'utf8');

// 检查是否已经有getRandomTools函数
if (content.includes('getRandomTools')) {
  console.log('getRandomTools函数已存在，无需添加');
  process.exit(0);
}

// 在文件末尾添加getRandomTools函数
const randomToolsFunction = `

// 获取随机工具推荐
export const getRandomTools = (currentToolId, limit = 3) => {
  try {
    // 过滤掉当前工具
    const filteredTools = toolsData.filter(tool => tool.id !== currentToolId);
    
    // 如果没有足够的工具，则返回所有可用工具
    if (filteredTools.length <= limit) {
      return filteredTools;
    }
    
    // 随机打乱工具顺序
    const shuffled = [...filteredTools].sort(() => 0.5 - Math.random());
    
    // 返回指定数量的工具
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('获取随机工具失败:', error);
    return [];
  }
};`;

// 将新函数添加到文件末尾
const updatedContent = content + randomToolsFunction;

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('成功添加getRandomTools函数'); 