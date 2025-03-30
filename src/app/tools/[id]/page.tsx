'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// 修改导入方式，解决文件不是模块的问题
const toolsDataModule = require('@/data/toolsData.js');
const { getToolById, getRelatedTools, getRandomTools, categoryNames } = toolsDataModule;
import { Tool } from '@/types/tool';

// 平台名称映射
const platformNames: {[key: string]: string} = {
  'douyin': '抖音',
  'xiaohongshu': '小红书',
  'wechat': '视频号',
  'official_account': '公众号',
  'youtube': 'YouTube',
  'xianyu': '闲鱼',
  'taobao': '淘宝',
  'other': 'AI'
};

// 平台图标映射
const platformIcons: {[key: string]: string} = {
  'douyin': '/icons/douyin.svg',
  'xiaohongshu': '/icons/xiaohongshu.svg',
  'wechat': '/icons/shipin.svg',
  'official_account': '/icons/gongzhonghao.svg',
  'youtube': '/icons/youtube.svg',
  'xianyu': '/icons/xianyu.svg',
  'taobao': '/icons/taobao.svg',
  'other': '/icons/Ai.svg'
};

// 分类图标映射
const categoryIcons: {[key: string]: string} = {
  'project_research': '/icons/research.svg',
  'image_processing': '/icons/image.svg',
  'office_efficiency': '/icons/document.svg',
  'team_collaboration': '/icons/team.svg',
  'default': '/icons/default.svg'
};

// 分类名称映射
const categoryNamesMap: {[key: string]: string} = {
  ...categoryNames as {[key: string]: string},
  'default': '其他'
};

export default function ToolDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // 防止重复加载数据的标记
  const hasLoadedData = useRef(false);

  // 初始加载数据
  useEffect(() => {
    // 重置状态
    setLoading(true);
    setError(null);
    setTool(null);
    setRelatedTools([]);

    // 加载工具详情
    const loadToolDetails = () => {
      try {
        // 验证ID是否存在
        if (!id) {
          setError('工具ID不存在');
          setLoading(false);
          return;
        }

        // 获取工具数据 (客户端渲染)
        const toolData = getToolById(id);

        // 如果没有找到工具
        if (!toolData) {
          setError('找不到该工具');
          setLoading(false);
          return;
        }
        
        // 确保工具有分类
        if (!toolData.categories || toolData.categories.length === 0) {
          toolData.categories = ['project_research'];
        }
        
        // 设置工具数据
        setTool(toolData);
        
        // 设置相关工具
        const relatedToolsList = getRelatedTools(id, 3);
        setRelatedTools(relatedToolsList);
        
      } catch (error) {
        console.error('加载工具详情失败:', error);
        setError('加载工具详情失败');
      } finally {
        setLoading(false);
      }
    };

    // 执行加载
    loadToolDetails();
  }, [id]);

  // 显示错误信息
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar activeItem="tools" />
        <main className="flex-grow py-8">
          <div className="container-custom">
            <div className="text-center py-12">
              <div className="text-6xl text-red-300 mb-4">出错了</div>
              <h2 className="text-2xl font-bold mb-4">无法加载工具详情</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link href="/tools" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition">
                返回工具库
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar activeItem="tools" />
        <main className="flex-grow flex flex-col justify-center items-center">
          <div className="text-2xl text-gray-500 mb-4">正在加载...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // 工具未找到
  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar activeItem="tools" />
        <main className="flex-grow py-8">
          <div className="container-custom">
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">404</div>
              <h2 className="text-2xl font-bold mb-4">工具未找到</h2>
              <p className="text-gray-600 mb-8">抱歉，您查找的工具不存在或已被移除</p>
              <Link href="/tools" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition">
                返回工具库
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // 显示工具详情
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar activeItem="tools" />
      
      <main className="flex-grow py-8">
        <div className="container-custom">
          {/* 导航面包屑 */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-teal-600">首页</Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-teal-600">工具库</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{tool.name}</span>
          </div>

          {/* 工具基本信息 */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
              <div className="md:flex-1">
                <div className="flex items-center mb-3">
                  <h1 className="text-2xl font-bold text-gray-800">{tool.name}</h1>
                  
                  {/* 显示多个平台图标 */}
                  <div className="ml-4 flex flex-wrap gap-2">
                    {tool.platforms.map((platformId: string) => (
                      <span key={platformId} className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full flex items-center">
                        <img 
                          src={platformIcons[platformId] || '/icons/Ai.svg'} 
                          alt={platformNames[platformId] || platformId} 
                          className="w-5 h-5 mr-2" 
                        />
                        {platformNames[platformId] || platformId}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 显示分类标签 */}
                {tool.categories && tool.categories.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {tool.categories.map((categoryId: string) => (
                      <span key={categoryId} className="bg-teal-50 text-teal-700 py-1 px-3 rounded-full flex items-center">
                        <img 
                          src={categoryIcons[categoryId] || categoryIcons['default']} 
                          alt={categoryNamesMap[categoryId] || categoryId} 
                          className="w-5 h-5 mr-2" 
                        />
                        {categoryNamesMap[categoryId] || categoryId}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mb-3 text-gray-600">
                  <p>{tool.description}</p>
                </div>
                
                <div className="text-sm text-gray-500 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">推荐者:</span>
                    {tool.uploader}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">上传日期:</span>
                    {tool.uploadDate}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">点击量:</span>
                    {tool.clicks} 次
                  </div>
                </div>
              </div>
            </div>
            
            {/* 标签 */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 工具截图展示 */}
          {tool.screenshots && tool.screenshots.length > 0 && (
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  工具截图
                </h2>
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {tool.screenshots.map((screenshot: string, idx: number) => (
                      <div 
                        key={idx} 
                        className={`flex-none ${tool.screenshots.length === 1 ? 'w-full' : 'w-1/2'}`}
                      >
                        <img 
                          src={screenshot} 
                          alt={`${tool.name}截图${idx + 1}`}
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                  {tool.screenshots.length > 2 && (
                    <>
                      <button 
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                        onClick={() => {
                          const container = document.querySelector('.overflow-x-auto');
                          if (container) {
                            container.scrollLeft -= container.clientWidth;
                          }
                        }}
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                        onClick={() => {
                          const container = document.querySelector('.overflow-x-auto');
                          if (container) {
                            container.scrollLeft += container.clientWidth;
                          }
                        }}
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 详细信息和下载部分 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
            {/* 详细说明 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  功能详情
                </h2>
                <div 
                  className="prose prose-teal max-w-none text-gray-600 whitespace-pre-line flex-grow" 
                  style={{ 
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    minHeight: '200px'
                  }}
                >
                  {tool.detailedDescription?.trim()}
                </div>
              </div>
            </div>
            
            {/* 侧边栏信息 */}
            <div className="lg:col-span-1 flex flex-col h-full">
              {/* 工具信息 */}
              <div className="bg-white rounded-lg shadow-md p-5 mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  工具信息
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-gray-700 w-20">使用地址：</span>
                    <a 
                      href={tool.downloadLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-1 text-teal-600 hover:text-teal-700 truncate flex items-center group"
                    >
                      {tool.name}
                      <svg 
                        className="w-4 h-4 ml-1 opacity-60" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-700 w-20">提取码：</span>
                    <code className="ml-1 bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono text-sm">{tool.inviteCode || "无需提取码"}</code>
                    {tool.inviteCode && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(tool.inviteCode);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 1000);
                        }}
                        className={`ml-2 w-8 h-8 flex items-center justify-center relative group ${
                          isCopied ? 'text-green-500' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-label="复制提取码"
                      >
                        {isCopied ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-700 w-20">原帖链接：</span>
                    <a 
                      href={tool.originalPostLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-1 text-teal-600 hover:text-teal-700 truncate flex items-center group"
                    >
                      进入生财
                      <svg 
                        className="w-4 h-4 ml-1 opacity-60" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* 安全提示 */}
              <div className="bg-yellow-50 rounded-lg shadow-md p-5 flex-grow">
                <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  安全提示
                </h2>
                <div className="text-sm text-gray-700">
                  请勿使用任何工具从事违法违规活动，遵守相关法律法规，合法合规使用工具，
                  本站所有内容来自互联网，如有侵权请联系站长删除。工具信息仅供参考，使用前请自行辨别真伪。
                </div>
              </div>
            </div>
          </div>

          {/* 相关工具推荐 */}
          {relatedTools.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  相关工具推荐
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedTools.map((relatedTool, idx) => (
                    <Link key={idx} href={`/tools/${relatedTool.id}`} className="block">
                      <div className="border border-gray-200 rounded-lg p-3 hover:border-teal-600 hover:shadow-md transition-all h-24">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{relatedTool.name}</h3>
                          <div className="ml-2 flex gap-1">
                            {relatedTool.platforms.map((platformId: string) => (
                              <img 
                                key={platformId}
                                src={platformIcons[platformId] || '/icons/Ai.svg'} 
                                alt={platformNames[platformId] || platformId} 
                                className="w-3 h-3" 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{relatedTool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 