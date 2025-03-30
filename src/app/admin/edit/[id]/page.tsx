'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { platformNames, getToolById } from '@/data/toolsData';

// 平台图标映射
const platformIcons: {[key: string]: string} = {
  'douyin': '/icons/douyin.svg',
  'xiaohongshu': '/icons/xiaohongshu.svg',
  'wechat': '/icons/shipin.svg',
  'official_account': '/icons/gongzhonghao.svg',
  'youtube': '/icons/youtube.svg',
  'xianyu': '/icons/xianyu.svg',
  'taobao': '/icons/taobao.svg',
  'other': '/icons/Ai.svg',
  // 工具分类图标
  'project_research': '/icons/research.svg',
  'image_processing': '/icons/image.svg',
  'office_efficiency': '/icons/document.svg',
  'team_collaboration': '/icons/team.svg'
};

// 所有平台类型选项（包括分类）
const platforms = [
  { id: 'douyin', name: '抖音', type: 'platform' },
  { id: 'xiaohongshu', name: '小红书', type: 'platform' },
  { id: 'wechat', name: '视频号', type: 'platform' },
  { id: 'official_account', name: '公众号', type: 'platform' },
  { id: 'youtube', name: 'YouTube', type: 'platform' },
  { id: 'xianyu', name: '闲鱼', type: 'platform' },
  { id: 'taobao', name: '淘宝', type: 'platform' },
  { id: 'other', name: 'AI', type: 'platform' },
  { id: 'project_research', name: '项目调研', type: 'category' },
  { id: 'image_processing', name: '图片处理', type: 'category' },
  { id: 'office_efficiency', name: '效率办公', type: 'category' },
  { id: 'team_collaboration', name: '团队提效', type: 'category' }
];

// 平台ID列表
const platformIds = platforms
  .filter(item => item.type === 'platform')
  .map(item => item.id);

// 分类ID列表
const categoryIds = platforms
  .filter(item => item.type === 'category')
  .map(item => item.id);

export default function EditToolPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([]);

  // 表单数据状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platforms: [] as string[],
    categories: [] as string[],
    tags: '',
    detailedDescription: '',
    downloadLink: '',
    originalPostLink: '',
    inviteCode: '',
    uploader: '',
  });

  // 加载工具数据
  useEffect(() => {
    if (id) {
      const tool = getToolById(id);
      
      if (tool) {
        setFormData({
          name: tool.name,
          description: tool.description,
          platforms: tool.platforms,
          categories: tool.categories || [],
          tags: tool.tags.join(','),
          detailedDescription: tool.detailedDescription,
          downloadLink: tool.downloadLink,
          originalPostLink: tool.originalPostLink,
          inviteCode: tool.inviteCode || '',
          uploader: tool.uploader,
        });
        
        // 设置已有的截图
        if (tool.screenshots && tool.screenshots.length > 0) {
          setExistingScreenshots(tool.screenshots);
        }
      } else {
        setErrorMessage('未找到指定工具');
      }
      
      setIsLoading(false);
    }
  }, [id]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 处理详细描述输入
  const handleDetailedDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 移除多余的空行，但保留有意义的换行
    const value = e.target.value.replace(/\n{3,}/g, '\n\n');
    setFormData({
      ...formData,
      detailedDescription: value,
    });
  };

  // 处理复选框变化（统一处理平台和分类）
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    // 判断是平台还是分类
    const isPlatform = platformIds.includes(value);
    const isCategory = categoryIds.includes(value);
    
    if (isPlatform) {
      if (checked) {
        // 添加到已选平台
        setFormData({
          ...formData,
          platforms: [...formData.platforms, value]
        });
      } else {
        // 从已选平台中移除
        setFormData({
          ...formData,
          platforms: formData.platforms.filter(platform => platform !== value)
        });
      }
    } else if (isCategory) {
      if (checked) {
        // 添加到已选分类
        setFormData({
          ...formData,
          categories: [...formData.categories, value]
        });
      } else {
        // 从已选分类中移除
        setFormData({
          ...formData,
          categories: formData.categories.filter(category => category !== value)
        });
      }
    }
  };

  // 处理标签输入
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      tags: e.target.value,
    });
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setScreenshots([...screenshots, ...filesArray]);
      
      // 创建预览URL
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  // 删除上传的图片
  const removeImage = (index: number) => {
    const newScreenshots = [...screenshots];
    const newPreviewUrls = [...previewUrls];
    
    // 释放URL对象
    URL.revokeObjectURL(previewUrls[index]);
    
    newScreenshots.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setScreenshots(newScreenshots);
    setPreviewUrls(newPreviewUrls);
  };

  // 删除已有的截图
  const removeExistingImage = (index: number) => {
    setExistingScreenshots(existingScreenshots.filter((_, i) => i !== index));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // 表单验证
      if (!formData.name || !formData.description) {
        throw new Error('请填写必填字段：工具名称、简短描述');
      }
      
      if (formData.platforms.length === 0 && formData.categories.length === 0) {
        throw new Error('请至少选择一个适用平台或工具分类');
      }
      
      // 获取当前工具的完整数据
      const currentTool = getToolById(id);
      
      // 准备要保存的数据
      const updatedTool = {
        id: id,
        name: formData.name,
        description: formData.description,
        platforms: formData.platforms,
        categories: formData.categories,
        uploader: formData.uploader,
        uploadDate: currentTool?.uploadDate || new Date().toISOString().split('T')[0],
        clicks: currentTool?.clicks || 0,
        detailedDescription: formData.detailedDescription,
        downloadLink: formData.downloadLink || '#',
        originalPostLink: formData.originalPostLink || '#',
        inviteCode: formData.inviteCode || '',
        screenshots: existingScreenshots, // 保留未删除的已有截图
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      
      // 调用API更新工具
      const response = await fetch('/api/tools', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTool),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 跳转回管理页面
        router.push('/admin');
      } else {
        throw new Error(result.message || '更新工具失败');
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-white p-4 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">编辑工具</h1>
              <Link href="/admin" className="text-white hover:text-gray-200">
                返回管理后台
              </Link>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-500">正在加载...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">编辑工具: {formData.name}</h1>
            <Link href="/admin" className="text-white hover:text-gray-200">
              返回管理后台
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          {errorMessage && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 基本信息 */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-3">基本信息</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>
              
              {/* 工具名称 */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  工具名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              
              {/* 简短描述 */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  简短描述 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="简短描述工具的主要功能"
                  required
                />
              </div>
              
              {/* 适用平台和工具分类 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  适用平台与分类 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">请选择适用平台(必选)和工具分类(可选)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* 平台选项 */}
                  {platforms.filter(item => item.type === 'platform').map(platform => (
                    <div key={platform.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`platform-${platform.id}`}
                        name="platforms"
                        value={platform.id}
                        checked={formData.platforms.includes(platform.id)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`platform-${platform.id}`} className="ml-2 text-sm text-gray-700 flex items-center">
                        <img src={platformIcons[platform.id]} alt={platform.name} className="w-4 h-4 mr-1" />
                        {platform.name}
                      </label>
                    </div>
                  ))}
                  
                  {/* 工具分类选项 */}
                  {platforms.filter(item => item.type === 'category').map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        name="categories"
                        value={category.id}
                        checked={formData.categories.includes(category.id)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700 flex items-center">
                        <img src={platformIcons[category.id]} alt={category.name} className="w-4 h-4 mr-1" />
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.platforms.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">请至少选择一个适用平台</p>
                )}
              </div>
              
              {/* 上传者 */}
              <div className="md:col-span-2">
                <label htmlFor="uploader" className="block text-sm font-medium text-gray-700 mb-1">
                  上传者
                </label>
                <input
                  type="text"
                  id="uploader"
                  name="uploader"
                  value={formData.uploader}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="上传者或创建者名称"
                />
              </div>
              
              {/* 下载信息 */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">下载信息</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>
              
              {/* 下载链接 */}
              <div className="md:col-span-2">
                <label htmlFor="downloadLink" className="block text-sm font-medium text-gray-700 mb-1">
                  下载链接
                </label>
                <input
                  type="url"
                  id="downloadLink"
                  name="downloadLink"
                  value={formData.downloadLink}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://example.com/download"
                />
              </div>
              
              {/* 原始链接 */}
              <div className="md:col-span-2">
                <label htmlFor="originalPostLink" className="block text-sm font-medium text-gray-700 mb-1">
                  原始链接
                </label>
                <input
                  type="url"
                  id="originalPostLink"
                  name="originalPostLink"
                  value={formData.originalPostLink}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://example.com/original-post"
                />
              </div>
              
              {/* 邀请码 */}
              <div className="md:col-span-2">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                  邀请码
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="如果需要邀请码，请填写"
                />
              </div>
              
              {/* 详细信息 */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">详细信息</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>
              
              {/* 详细描述 */}
              <div className="md:col-span-2">
                <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  详细描述
                </label>
                <textarea
                  id="detailedDescription"
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleDetailedDescriptionChange}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="详细描述工具的功能、特点和使用方法"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    resize: 'vertical',
                    minHeight: '150px'
                  }}
                ></textarea>
              </div>
              
              {/* 标签 */}
              <div className="md:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  标签
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleTagsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="用逗号分隔多个标签，如：抖音,电商,营销"
                />
              </div>
              
              {/* 截图管理 */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">截图管理</h3>
                <div className="h-px bg-gray-200 mb-4"></div>
              </div>
              
              {/* 已有截图 */}
              {existingScreenshots.length > 0 && (
                <div className="md:col-span-2 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    现有截图
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingScreenshots.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`截图 ${index + 1}`}
                          className="h-40 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 上传新截图 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  添加新截图
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="screenshots"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                      >
                        <span>上传图片</span>
                        <input
                          id="screenshots"
                          name="screenshots"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">或拖放图片到此处</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF 图片格式
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 预览上传的新图片 */}
              {previewUrls.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新上传图片预览
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`预览 ${index + 1}`}
                          className="h-40 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 提交按钮 */}
              <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '保存中...' : '保存修改'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 