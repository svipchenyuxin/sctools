'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 平台图标映射
const platformIcons: {[key: string]: string} = {
  'douyin': '/icons/douyin.svg',
  'xiaohongshu': '/icons/xiaohongshu.svg',
  'wechat': '/icons/shipin.svg',
  'official_account': '/icons/gongzhonghao.svg',
  'youtube': '/icons/youtube.svg',
  'xianyu': '/icons/xianyu.svg',
  'taobao': '/icons/taobao.svg',
  'other': '/icons/AI.svg',
  // 工具分类图标
  'project_research': '/icons/research.svg',
  'image_processing': '/icons/image.svg',
  'office_efficiency': '/icons/document.svg',
  'team_collaboration': '/icons/team.svg'
};

// 平台名称映射
const platformNames: {[key: string]: string} = {
  'douyin': '抖音',
  'xiaohongshu': '小红书',
  'wechat': '视频号',
  'official_account': '公众号',
  'youtube': 'YouTube',
  'xianyu': '闲鱼',
  'taobao': '淘宝',
  'other': 'AI',
  // 工具分类名称
  'project_research': '项目调研',
  'image_processing': '图片处理',
  'office_efficiency': '效率办公',
  'team_collaboration': '团队提效'
};

// 中文分类名到ID的反向映射
const categoryNameToId: {[key: string]: string} = {
  '项目调研': 'project_research',
  '图片处理': 'image_processing',
  '效率办公': 'office_efficiency',
  '团队提效': 'team_collaboration'
};

// 所有分类ID列表
const categoryIds = ['project_research', 'image_processing', 'office_efficiency', 'team_collaboration'];

// 所有平台类型选项（包括分类）
const platforms = [
  { id: 'douyin', name: '抖音', type: 'platform' },
  { id: 'xiaohongshu', name: '小红书', type: 'platform' },
  { id: 'wechat', name: '视频号', type: 'platform' },
  { id: 'official_account', name: '公众号', type: 'platform' },
  { id: 'youtube', name: 'YouTube', type: 'platform' },
  { id: 'xianyu', name: '闲鱼', type: 'platform' },
  { id: 'taobao', name: '淘宝', type: 'platform' },
  { id: 'other', name: 'AI', type: 'platform' }
];

// 所有分类选项
const categories = [
  { id: 'project_research', name: '项目调研', type: 'category' },
  { id: 'image_processing', name: '图片处理', type: 'category' },
  { id: 'office_efficiency', name: '效率办公', type: 'category' },
  { id: 'team_collaboration', name: '团队提效', type: 'category' }
];

// 创建一个新的组件来处理搜索参数
function ToolsContent() {
  const searchParams = useSearchParams();
  const platformParam = searchParams.get('platform');
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  // 处理中文分类名
  const categoryId = categoryParam 
    ? categoryNameToId[categoryParam] || categoryParam
    : null;
  
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(platformParam || categoryId);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [filteredTools, setFilteredTools] = useState<any[]>([]);
  const [allTools, setAllTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 从API获取工具数据
  useEffect(() => {
    setLoading(true);
    fetch('/api/tools')
      .then(response => response.json())
      .then(data => {
        if (data && data.data && Array.isArray(data.data)) {
          setAllTools(data.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('获取工具数据失败:', error);
        setLoading(false);
      });
  }, []);

  // 基于当前筛选条件过滤工具
  useEffect(() => {
    let filtered = [...allTools];
    
    // 如果选中的是平台
    if (selectedPlatform && !categoryIds.includes(selectedPlatform)) {
      filtered = filtered.filter((tool) => 
        tool.platforms && tool.platforms.includes(selectedPlatform)
      );
    }
    
    // 如果选中的是分类
    if (selectedPlatform && categoryIds.includes(selectedPlatform)) {
      filtered = filtered.filter((tool) => 
        tool.categories && tool.categories.includes(selectedPlatform)
      );
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      const terms = searchTerm.toLowerCase().split(/\s+/);
      filtered = filtered.filter(
        (tool) => 
          terms.some(term => 
            tool.name.toLowerCase().includes(term) || 
            tool.description.toLowerCase().includes(term) ||
            (tool.tags && tool.tags.some((tag: string) => tag.toLowerCase().includes(term)))
          )
      );
    }
    
    setFilteredTools(filtered);
  }, [selectedPlatform, searchTerm, allTools]);

  // 计算分页数据
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTools = filteredTools.slice(startIndex, endIndex);

  // 处理页码变化
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 处理平台点击
  const handlePlatformClick = (platform: string | null) => {
    setSelectedPlatform(platform);
    
    // 更新URL以反映当前筛选条件
    const url = new URL(window.location.href);
    if (platform) {
      if (categoryIds.includes(platform)) {
        url.searchParams.set('category', platformNames[platform]);
        url.searchParams.delete('platform');
      } else {
        url.searchParams.set('platform', platform);
        url.searchParams.delete('category');
      }
    } else {
      url.searchParams.delete('platform');
      url.searchParams.delete('category');
    }
    
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    }
    
    window.history.pushState({}, '', url.toString());
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 更新URL以反映当前筛选条件
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    
    if (selectedPlatform) {
      if (categoryIds.includes(selectedPlatform)) {
        url.searchParams.set('category', platformNames[selectedPlatform]);
      } else {
        url.searchParams.set('platform', selectedPlatform);
      }
    }
    
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeItem="tools" />

      {/* 主要内容 */}
      <main className="flex-grow py-8">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">所有工具</h1>
          </div>
          
          {/* 平台选择按钮 */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-2">适用平台</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handlePlatformClick(null)}
                className={`px-4 py-2 rounded-full ${!selectedPlatform 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                全部平台
              </button>
              
              {/* 平台按钮 */}
              {platforms.map(platform => (
                <button 
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform.id)}
                  className={`px-4 py-2 rounded-full flex items-center ${selectedPlatform === platform.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <img src={platformIcons[platform.id] || '/icons/other.svg'} alt={platform.name} className="w-5 h-5 mr-2" />
                  {platform.name}
                </button>
              ))}
              
              {/* 分类按钮 */}
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => handlePlatformClick(category.id)}
                  className={`px-4 py-2 rounded-full flex items-center ${selectedPlatform === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <img src={platformIcons[category.id]} alt={category.name} className="w-5 h-5 mr-2" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 搜索栏 */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative max-w-2xl">
              <input 
                type="text" 
                placeholder="搜索工具名称、功能、标签..." 
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-3">🔍</span>
              <button 
                type="submit" 
                className="absolute right-3 top-2 bg-primary text-white px-4 py-1 rounded-md"
              >
                搜索
              </button>
            </form>
          </div>

          {/* 筛选结果 */}
          <div className="mb-4 text-gray-600">
            {selectedPlatform ? (
              <p>
                显示 <span className="font-semibold flex items-center inline-flex">
                  <img src={platformIcons[selectedPlatform] || '/icons/other.svg'} alt={platformNames[selectedPlatform] || selectedPlatform} className="w-4 h-4 mr-1" />
                  {platformNames[selectedPlatform] || selectedPlatform}
                </span> 下的 
                <span className="font-semibold"> {filteredTools.length}</span> 个工具
                {searchTerm && ` (搜索："${searchTerm}")`}
              </p>
            ) : (
              <p>
                显示所有 <span className="font-semibold">{filteredTools.length}</span> 个工具
                {searchTerm && ` (搜索："${searchTerm}")`}
              </p>
            )}
          </div>

          {/* 工具列表 */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-lg text-gray-600">加载中...</p>
            </div>
          ) : filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTools.map((tool: any) => (
                <div key={tool.id} className="card hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-1">
                      <a 
                        href={tool.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
                        title={`进入${tool.name}`}
                      >
                        {tool.name}
                      </a>
                      <a
                        href={tool.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title={`进入${tool.name}`}
                      >
                        <svg 
                          className="w-4 h-4" 
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
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tool.platforms && tool.platforms.map((platformId: string) => (
                        <img
                          key={platformId}
                          src={platformIcons[platformId] || '/icons/other.svg'}
                          alt={platformNames[platformId] || platformId}
                          className="w-5 h-5"
                          title={platformNames[platformId] || platformId}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  {tool.categories && tool.categories.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {tool.categories.map((categoryId: string) => {
                        // 确保分类ID存在于图标映射中
                        const isKnownCategory = categoryIds.includes(categoryId);
                        // 确定要使用的ID (已知分类或者保持原样)
                        const displayId = isKnownCategory ? categoryId : categoryId;
                        return (
                          <span 
                            key={categoryId}
                            className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full flex items-center cursor-pointer hover:bg-teal-100 transition-colors"
                            onClick={() => handlePlatformClick(displayId)}
                            title={`点击查看所有${platformNames[displayId] || categoryId}分类工具`}
                          >
                            <img 
                              src={platformIcons[displayId] || '/icons/other.svg'} 
                              alt={platformNames[displayId] || categoryId} 
                              className="w-3 h-3 mr-1" 
                            />
                            {platformNames[displayId] || categoryId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-auto flex justify-end">
                    <Link href={`/tools/${tool.id}`} className="text-teal-600 text-sm hover:text-teal-700">
                      查看详情
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">没有找到符合条件的工具</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPlatform(null);
                  const url = new URL(window.location.href);
                  url.search = '';
                  window.history.pushState({}, '', url.toString());
                }}
                className="btn-primary"
              >
                清除筛选条件
              </button>
            </div>
          )}

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// 主组件
export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar activeItem="tools" />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-2xl text-gray-500">加载中...</div>
        </main>
        <Footer />
      </div>
    }>
      <ToolsContent />
    </Suspense>
  );
} 