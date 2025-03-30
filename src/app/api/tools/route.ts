import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 数据文件路径
const toolsDataFilePath = path.join(process.cwd(), 'src', 'data', 'toolsData.js');

// 类型定义
interface Tool {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  categories?: string[];
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

// 获取最大工具ID
const getMaxToolId = (): number => {
  try {
    const toolsData = getToolsData();
    if (toolsData.length === 0) return 0;
    
    // 尝试将所有ID转换为数字，忽略非数字ID
    const numericIds = toolsData
      .map(tool => parseInt(tool.id, 10))
      .filter(id => !isNaN(id));
    
    // 如果没有有效的数字ID，返回0
    if (numericIds.length === 0) return 0;
    
    // 返回最大ID值
    return Math.max(...numericIds);
  } catch (error) {
    console.error('获取最大工具ID出错:', error);
    return 0;
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
        
        // 处理categories数组
        const categories = tool.categories || [];
        if (categories.length > 0) {
          formattedToolsData += '    categories: [';
          categories.forEach((category, cIndex) => {
            formattedToolsData += `'${category}'`;
            if (cIndex < categories.length - 1) formattedToolsData += ', ';
          });
          formattedToolsData += '],\n';
        }
        
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

// 处理获取所有工具的请求
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  const toolsData = getToolsData();
  
  // 如果提供了id参数，返回特定工具
  if (id) {
    const tool = toolsData.find((tool: Tool) => tool.id === id);
    
    if (tool) {
      return NextResponse.json({ data: tool });
    } else {
      return NextResponse.json({ error: '工具未找到' }, { status: 404 });
    }
  }
  
  // 否则返回所有工具
  return NextResponse.json({ data: toolsData });
}

// 处理添加工具的请求
export async function POST(request: Request) {
  try {
    const newTool = await request.json();
    const toolsData = getToolsData();
    
    // 获取当前最大ID并递增
    const maxId = getMaxToolId();
    const nextId = maxId + 1;
    
    // 设置新工具的ID为递增值
    newTool.id = nextId.toString();
    
    // 设置默认值
    newTool.clicks = 0;
    newTool.uploadDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 添加新工具
    const updatedToolsData = [...toolsData, newTool];
    
    // 保存到文件
    const saved = await saveToolsData(updatedToolsData);
    
    if (saved) {
      return NextResponse.json({ 
        success: true, 
        message: '工具添加成功', 
        data: newTool 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '保存工具数据失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('添加工具出错:', error);
    return NextResponse.json({ 
      success: false, 
      message: '添加工具时发生错误' 
    }, { status: 500 });
  }
}

// 处理更新工具的请求
export async function PUT(request: Request) {
  try {
    const updatedTool = await request.json();
    const toolsData = getToolsData();
    
    // 检查工具ID是否存在
    if (!updatedTool.id) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少工具ID' 
      }, { status: 400 });
    }
    
    // 查找要更新的工具
    const toolIndex = toolsData.findIndex((tool: Tool) => tool.id === updatedTool.id);
    
    if (toolIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到指定工具' 
      }, { status: 404 });
    }
    
    // 更新工具数据
    const newToolsData = [...toolsData];
    newToolsData[toolIndex] = {
      ...newToolsData[toolIndex],
      ...updatedTool
    };
    
    // 保存到文件
    const saved = await saveToolsData(newToolsData);
    
    if (saved) {
      return NextResponse.json({ 
        success: true, 
        message: '工具更新成功', 
        data: newToolsData[toolIndex] 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '保存工具数据失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新工具出错:', error);
    return NextResponse.json({ 
      success: false, 
      message: '更新工具时发生错误' 
    }, { status: 500 });
  }
}

// 处理删除工具的请求
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const toolsData = getToolsData();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少工具ID' 
      }, { status: 400 });
    }
    
    // 查找要删除的工具
    const toolIndex = toolsData.findIndex((tool: Tool) => tool.id === id);
    
    if (toolIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到指定工具' 
      }, { status: 404 });
    }
    
    // 删除工具
    const newToolsData = toolsData.filter((tool: Tool) => tool.id !== id);
    
    // 保存到文件
    const saved = await saveToolsData(newToolsData);
    
    if (saved) {
      return NextResponse.json({ 
        success: true, 
        message: '工具删除成功' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '保存工具数据失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('删除工具出错:', error);
    return NextResponse.json({ 
      success: false, 
      message: '删除工具时发生错误' 
    }, { status: 500 });
  }
} 