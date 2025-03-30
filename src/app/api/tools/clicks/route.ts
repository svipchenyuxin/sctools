import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 添加点击记录的内存缓存和锁定机制
const clicksCache = new Map();
const processingLock = new Set();

// 数据文件路径
const toolsDataFilePath = path.join(process.cwd(), 'src', 'data', 'toolsData.js');

// 类型定义
interface Tool {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  uploader: string;
  uploadDate: string;
  clicks: number;
  detailedDescription: string;
  downloadLink: string;
  originalPostLink: string;
  inviteCode: string;
  screenshots: string[];
  tags: string[];
}

// 读取工具数据
const getToolsData = (): Tool[] => {
  try {
    // 直接导入工具数据（动态导入无法工作）
    // 读取原始文件内容
    const fileContent = fs.readFileSync(toolsDataFilePath, 'utf8');
    
    // 提取toolsData数组
    const startMarker = 'export const toolsData = ';
    const startIndex = fileContent.indexOf(startMarker) + startMarker.length;
    const endIndex = fileContent.indexOf('];', startIndex) + 1;
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('在文件中找不到toolsData数组定义');
    }
    
    const toolsDataString = fileContent.substring(startIndex, endIndex);
    
    // 转换为JavaScript对象
    // 注意：这里使用的eval不安全，仅用于演示
    // 实际生产环境应使用更安全的方法
    const toolsData = eval(toolsDataString);
    
    return toolsData;
  } catch (error) {
    console.error('读取工具数据出错:', error);
    return [];
  }
};

// 保存工具数据到文件
const saveToolsData = async (updatedToolsData: Tool[]) => {
  try {
    // 读取原始文件内容
    const originalFileContent = fs.readFileSync(toolsDataFilePath, 'utf8');
    
    // 查找toolsData数组定义的起始位置
    const toolsDataStartIndex = originalFileContent.indexOf('export const toolsData = [');
    const toolsDataEndIndex = originalFileContent.indexOf('];', toolsDataStartIndex) + 1;
    
    if (toolsDataStartIndex === -1 || toolsDataEndIndex === -1) {
      throw new Error('在文件中找不到toolsData数组定义');
    }
    
    // 准备格式化后的工具数据
    let formattedToolsData = '';
    
    // 确保正确处理空数组
    if (updatedToolsData.length === 0) {
      formattedToolsData = '[]';
    } else {
      // 手动构建数组字符串，以确保detailedDescription使用模板字符串格式
      formattedToolsData = '[\n';
      
      updatedToolsData.forEach((tool, index) => {
        formattedToolsData += '  {\n';
        formattedToolsData += `    id: '${tool.id}',\n`;
        formattedToolsData += `    name: '${tool.name}',\n`;
        formattedToolsData += `    description: '${tool.description}',\n`;
        
        // 处理platforms数组
        formattedToolsData += '    platforms: [';
        tool.platforms.forEach((platform, pIndex) => {
          formattedToolsData += `'${platform}'`;
          if (pIndex < tool.platforms.length - 1) formattedToolsData += ', ';
        });
        formattedToolsData += '],\n';
        
        formattedToolsData += `    uploader: '${tool.uploader}',\n`;
        formattedToolsData += `    uploadDate: '${tool.uploadDate}',\n`;
        formattedToolsData += `    clicks: ${tool.clicks},\n`;
        
        // 处理detailedDescription为模板字符串
        formattedToolsData += '    detailedDescription: `\n';
        formattedToolsData += tool.detailedDescription
          .split('\n')
          .map(line => `      ${line}`)
          .join('\n');
        formattedToolsData += '\n    `,\n';
        
        formattedToolsData += `    downloadLink: '${tool.downloadLink}',\n`;
        formattedToolsData += `    inviteCode: '${tool.inviteCode}',\n`;
        formattedToolsData += `    originalPostLink: '${tool.originalPostLink}',\n`;
        
        // 处理screenshots数组
        formattedToolsData += '    screenshots: [\n';
        tool.screenshots.forEach((screenshot, sIndex) => {
          formattedToolsData += `      '${screenshot}'`;
          if (sIndex < tool.screenshots.length - 1) formattedToolsData += ',\n';
          else formattedToolsData += '\n';
        });
        formattedToolsData += '    ],\n';
        
        // 处理tags数组
        formattedToolsData += '    tags: [';
        tool.tags.forEach((tag, tIndex) => {
          formattedToolsData += `'${tag}'`;
          if (tIndex < tool.tags.length - 1) formattedToolsData += ', ';
        });
        formattedToolsData += ']\n';
        
        formattedToolsData += '  }';
        if (index < updatedToolsData.length - 1) formattedToolsData += ',';
        formattedToolsData += '\n';
      });
      
      formattedToolsData += ']';
    }
    
    // 更新文件内容
    const newContent = 
      originalFileContent.substring(0, toolsDataStartIndex) + 
      `export const toolsData = ${formattedToolsData}` + 
      originalFileContent.substring(toolsDataEndIndex);
    
    // 写入文件
    fs.writeFileSync(toolsDataFilePath, newContent, 'utf8');
    
    return true;
  } catch (error) {
    console.error('保存工具数据出错:', error);
    return false;
  }
};

// 处理工具点击的POST请求
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: '缺少工具ID'
      }, { status: 400 });
    }
    
    // 添加防抖和去重逻辑
    // 检查最近是否已经处理过这个ID
    if (clicksCache.has(id)) {
      const lastClickTime = clicksCache.get(id);
      const now = Date.now();
      
      // 如果在10秒内已经记录过点击，则忽略
      if (now - lastClickTime < 10000) {
        return NextResponse.json({
          success: true,
          message: '点击已被记录，忽略重复请求',
          isRepeated: true
        });
      }
    }
    
    // 检查是否正在处理同一ID的请求
    if (processingLock.has(id)) {
      return NextResponse.json({
        success: true,
        message: '正在处理，请稍后',
        isProcessing: true
      });
    }
    
    // 加锁，防止并发处理
    processingLock.add(id);
    
    try {
      const toolsData = getToolsData();
      const toolIndex = toolsData.findIndex((tool: Tool) => tool.id === id);
      
      if (toolIndex === -1) {
        processingLock.delete(id);
        return NextResponse.json({
          success: false,
          message: '工具未找到'
        }, { status: 404 });
      }
      
      // 增加点击量
      toolsData[toolIndex].clicks += 1;
      
      // 记录处理时间
      clicksCache.set(id, Date.now());
      
      try {
        // 尝试保存更新后的数据
        const saved = await saveToolsData(toolsData);
        
        // 释放锁
        processingLock.delete(id);
        
        if (saved) {
          return NextResponse.json({
            success: true,
            message: '成功记录点击',
            clicks: toolsData[toolIndex].clicks
          });
        } else {
          console.error('保存点击数据失败，但将返回成功响应以避免前端出错');
          // 返回成功响应，即使保存失败，避免前端出错
          return NextResponse.json({
            success: true,
            message: '已记录点击（但未保存到文件）',
            clicks: toolsData[toolIndex].clicks
          });
        }
      } catch (saveError) {
        // 释放锁
        processingLock.delete(id);
        
        console.error('保存点击数据出错:', saveError);
        // 返回成功响应，即使保存出错，避免前端出错
        return NextResponse.json({
          success: true,
          message: '已记录点击（但保存出错）',
          clicks: toolsData[toolIndex].clicks
        });
      }
    } catch (error) {
      // 确保释放锁
      processingLock.delete(id);
      throw error;
    }
  } catch (error) {
    console.error('记录点击出错:', error);
    // 返回成功响应，即使处理出错，避免前端出错
    return NextResponse.json({
      success: true,
      message: '记录点击时发生错误，但已处理'
    }, { status: 200 });
  }
} 