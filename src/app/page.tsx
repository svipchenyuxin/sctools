'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getHotTools, getToolsByPlatform } from '@/data/toolsData';

// 平台分类数据
const platformCategories = [
  { id: 'douyin', name: '抖音', icon: '/icons/douyin.svg' },
  { id: 'xiaohongshu', name: '小红书', icon: '/icons/xiaohongshu.svg' },
  { id: 'wechat', name: '视频号', icon: '/icons/shipin.svg' },
  { id: 'official_account', name: '公众号', icon: '/icons/gongzhonghao.svg' },
  { id: 'youtube', name: 'YouTube', icon: '/icons/youtube.svg' },
  { id: 'xianyu', name: '闲鱼', icon: '/icons/xianyu.svg' },
  { id: 'taobao', name: '淘宝', icon: '/icons/taobao.svg' },
  { id: 'other', name: 'AI', icon: '/icons/Ai.svg' }
];

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

export default function Home() {
  // 定义状态
  const [searchTerm, setSearchTerm] = useState('');
  const [hotTools, setHotTools] = useState<any[]>([]);
  const [allTools, setAllTools] = useState<any[]>([]);
  const [platformToolsCounts, setPlatformToolsCounts] = useState<Record<string, number>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string>('douyin');
  const [isSticky, setIsSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const headerSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 监听滚动事件，控制搜索框动画
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // 获取头部搜索区的高度
      const headerHeight = headerSearchRef.current?.offsetHeight || 300;
      
      // 计算滚动进度 (0-1之间的值)，用于动画过渡
      const progress = Math.min(Math.max(scrollPosition / headerHeight, 0), 1);
      setScrollProgress(progress);
      
      // 当原始搜索框即将滚出视图时启用顶部固定搜索框
      if (searchFormRef.current) {
        const formRect = searchFormRef.current.getBoundingClientRect();
        // 当表单顶部接近视窗顶部时，显示固定搜索框
        setIsSticky(formRect.top < 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // 获取热门工具 - 使用动态fetch来确保获取最新数据
    fetch('/api/tools')
      .then(response => response.json())
      .then(data => {
        if (data && data.data && Array.isArray(data.data)) {
          // 保存所有工具数据
          setAllTools(data.data);
          
          // 按点击量排序取前5个作为热门工具
          const sorted = [...data.data].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
          setHotTools(sorted);
          
          // 计算每个平台的工具数量
          const counts: Record<string, number> = {};
          platformCategories.forEach(platform => {
            const tools = data.data.filter((tool: any) => 
              tool.platforms && tool.platforms.includes(platform.id)
            );
            counts[platform.id] = tools.length;
          });
          setPlatformToolsCounts(counts);
        }
      })
      .catch(error => console.error('获取工具数据失败:', error));
  }, []);

  // 处理搜索表单提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/tools?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  // 处理平台切换
  const handlePlatformChange = (platformId: string) => {
    setSelectedPlatform(platformId);
  };

  // 当前平台的工具
  const currentPlatformTools = allTools.filter((tool: any) => 
    tool.platforms && tool.platforms.includes(selectedPlatform)
  ).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* 固定在顶部的搜索栏 */}
        <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600 to-teal-700 transition-all duration-300 shadow-md ${
          isSticky ? 'h-16 opacity-100' : 'h-0 opacity-0'
        }`}>
          <div className="container mx-auto h-full flex items-center justify-between px-4">
            <div className={`text-white font-extrabold text-2xl pl-2 transition-all duration-300 ${
              isSticky ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-10'
            }`}>
              SC ToolNexus
            </div>
            <form 
              ref={searchFormRef}
              onSubmit={handleSearch} 
              className={`transition-all duration-300 flex ${
                isSticky ? 'w-80 opacity-100 transform translate-x-0' : 'w-0 opacity-0 transform translate-x-10'
              }`}
            >
              <input 
                type="text" 
                placeholder="输入搜索工具..." 
                className="flex-grow px-3 py-2 text-sm rounded-l-lg border-0 focus:ring-2 focus:ring-teal-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-teal-800 text-white px-4 py-2 rounded-r-lg hover:bg-teal-900 transition whitespace-nowrap"
              >
                搜索
              </button>
            </form>
          </div>
        </div>

        {/* 头部搜索区，添加ref用于测量高度 */}
        <div ref={headerSearchRef} className="bg-gradient-to-r from-teal-600 to-teal-700 py-12 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                创业工具聚合平台
              </h1>
              <p className="text-xl text-teal-100 mb-6">
                发现并使用更佳工具，提高效率，更多点时间去生活
              </p>
              
              {/* 添加ref到搜索表单，使原搜索框在绿色区域将要消失时才开始淡出 */}
              <form 
                ref={searchFormRef}
                onSubmit={handleSearch} 
                className="flex max-w-2xl mx-auto"
              >
                <input 
                  type="text" 
                  placeholder="输入您的需求、使用场景，或正在经营的平台..." 
                  className="flex-grow px-4 py-3 text-lg rounded-l-lg border-0 focus:ring-2 focus:ring-teal-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="bg-teal-800 text-white px-6 py-3 rounded-r-lg hover:bg-teal-900 transition"
                >
                  搜索
                </button>
              </form>

              {/* 热门搜索标签 */}
              <div className="max-w-2xl mx-auto mt-2">
                <div className="flex flex-wrap gap-2 justify-center">
                  {['去水印', '抠图', '小红书', '无损放大', '字幕生成'].map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        window.location.href = `/tools?search=${encodeURIComponent(tag)}`;
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors duration-200 flex items-center"
                    >
                      <span>{tag}</span>
                      <svg 
                        className="w-5 h-5 ml-1.5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#ff6b6b"
                        strokeWidth={2}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" 
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" 
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 平台选择区 */}
        <section className="py-8 px-4 bg-gray-50">
          <div className="container-custom">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">根据平台选择工具</h2>
            </div>
            
            <div className="grid grid-cols-8 gap-2">
              {platformCategories.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformChange(platform.id)}
                  className={`rounded-lg shadow transition-all duration-200 transform group ${
                    selectedPlatform === platform.id 
                      ? 'bg-[#f3f4f6] relative' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center py-3">
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className={`w-8 h-8 mx-auto transition-transform duration-300 ${
                        selectedPlatform === platform.id 
                          ? 'drop-shadow-md' 
                          : 'group-hover:[transform:perspective(800px)_rotateX(10deg)]'
                      }`}
                    />
                    <span className="mt-2 text-sm text-gray-600">{platform.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* 工具展示区域 */}
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentPlatformTools.map((tool: any) => (
                  <Link 
                    href={`/tools/${tool.id}`} 
                    key={tool.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary mb-2">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                            {tool.description}
                          </p>
                        </div>
                        {tool.icon && (
                          <img 
                            src={tool.icon} 
                            alt={tool.name} 
                            className="w-12 h-12 rounded-lg object-cover ml-4"
                          />
                        )}
                      </div>
                      
                      {/* 标签展示 */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {tool.tags && tool.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-50 text-xs text-gray-600 rounded-full border border-gray-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* 工具信息 */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          {tool.clicks > 0 && (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {tool.clicks} 次使用
                            </>
                          )}
                        </div>
                        <span className="text-xs text-primary font-medium group-hover:underline">
                          查看详情 →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* 查看更多按钮 */}
              {currentPlatformTools.length > 0 && (
                <div className="text-right mt-4">
                  <Link
                    href={`/tools?platform=${selectedPlatform}`}
                    className="inline-flex items-center text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
                  >
                    查看全部{platformCategories.find(p => p.id === selectedPlatform)?.name}工具
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* 创业分类区 - 移到平台工具展示之后 */}
        <section className="py-8 px-4 bg-gray-50">
          <div className="container-custom">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">根据场景选择工具</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link 
                href="/tools?category=项目调研"
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">项目调研</h3>
                <p className="text-sm text-gray-600">
                  深入市场分析，提供专业调研报告
                </p>
              </Link>
              
              <Link 
                href="/tools?category=图片处理"
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">图片处理</h3>
                <p className="text-sm text-gray-600">
                  专业图像编辑，提升视觉营销效果
                </p>
              </Link>
              
              <Link 
                href="/tools?category=效率办公"
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">效率办公</h3>
                <p className="text-sm text-gray-600">
                  优化工作流程，提升个人办公效率
                </p>
              </Link>
              
              <Link 
                href="/tools?category=团队提效"
                className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">团队提效</h3>
                <p className="text-sm text-gray-600">
                  协作工具集成，促进团队高效工作
                </p>
              </Link>
            </div>
          </div>
        </section>
        
        {/* 最新推荐区 */}
        <section className="py-8 px-4">
          <div className="container-custom">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">最新工具推荐</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allTools.slice(0, 3).map((tool) => (
                <Link href={`/tools/${tool.id}`} key={tool.id} className="block">
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {tool.name}
                      </h3>
                      <div className="flex gap-1">
                        {tool.platforms.map((platformId: string) => (
                          <img
                            key={platformId}
                            src={platformIcons[platformId] || '/icons/Ai.svg'}
                            alt={platformId}
                            className="w-5 h-5"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-5 flex-grow">
                      {tool.description}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">上传于 {tool.uploadDate}</span>
                      <span className="text-teal-600">了解更多</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link 
                href="/tools?sort=newest" 
                className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
              >
                查看更多新工具
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
