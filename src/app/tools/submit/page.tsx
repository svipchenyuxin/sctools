'use client';

import { useState } from 'react';
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

export default function SubmitToolPage() {
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platforms: [] as string[],
    categories: [] as string[],
    downloadLink: '',
    originalLink: '',
    inviteCode: '',
    detailedDescription: '',
    tags: '',
    uploader: ''
  });
  
  // 图片上传状态
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理复选框变化
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

  // 删除已上传的图片
  const removeImage = (index: number) => {
    // 移除指定索引的图片和预览URL
    const newScreenshots = [...screenshots];
    const newPreviewUrls = [...previewUrls];
    
    // 释放预览URL的内存
    URL.revokeObjectURL(previewUrls[index]);
    
    newScreenshots.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setScreenshots(newScreenshots);
    setPreviewUrls(newPreviewUrls);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    // 简单的表单验证
    if (!formData.name || !formData.description || formData.platforms.length === 0) {
      setErrorMessage('请填写工具名称、简短描述和至少选择一个适用平台');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 这里是上传表单数据的模拟
      // 实际情况中，这里会使用API发送数据到服务器
      console.log('提交的表单数据:', formData);
      console.log('上传的图片数量:', screenshots.length);
      
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟成功提交
      setIsSuccess(true);
    } catch (error) {
      console.error('提交失败:', error);
      setErrorMessage('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">提交工具</h1>
          
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium text-green-700 mb-2">提交成功！</h2>
              <p className="text-green-600 mb-4">
                感谢您的贡献！我们将尽快审核您提交的工具。
              </p>
              <div className="flex gap-4">
                <Link href="/tools" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                  浏览工具库
                </Link>
                <button 
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      platforms: [],
                      categories: [],
                      downloadLink: '',
                      originalLink: '',
                      inviteCode: '',
                      detailedDescription: '',
                      tags: '',
                      uploader: ''
                    });
                    setScreenshots([]);
                    setPreviewUrls([]);
                    setIsSuccess(false);
                  }}
                  className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition"
                >
                  继续提交
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {errorMessage}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 工具名称 */}
                <div className="col-span-full">
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
                
                {/* 上传者 */}
                <div className="col-span-full">
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
                    placeholder="请填写上传者信息（个人或组织名称）"
                  />
                </div>
                
                {/* 简短描述 */}
                <div className="col-span-full">
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
                    placeholder="一句话描述工具的核心功能"
                    required
                  />
                </div>
                
                {/* 适用平台和工具分类 - 合并为一个区域 */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    适用平台 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">请选择适用平台(必选)和工具分类(可选)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* 平台选项 */}
                    {platforms.filter(item => item.type === 'platform').map(platform => (
                      <div key={platform.id} className="flex items-center">
                        <input
                          id={`platform-${platform.id}`}
                          type="checkbox"
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
                    
                    {/* 分类选项 */}
                    {platforms.filter(item => item.type === 'category').map(category => (
                      <div key={category.id} className="flex items-center">
                        <input
                          id={`category-${category.id}`}
                          type="checkbox"
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
                
                {/* 下载链接 */}
                <div>
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
                    placeholder="https://..."
                  />
                </div>
                
                {/* 原始链接 */}
                <div>
                  <label htmlFor="originalLink" className="block text-sm font-medium text-gray-700 mb-1">
                    原始链接
                  </label>
                  <input
                    type="url"
                    id="originalLink"
                    name="originalLink"
                    value={formData.originalLink}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                
                {/* 邀请码 */}
                <div className="col-span-full">
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
                    placeholder="如果有邀请码，请填写"
                  />
                </div>
                
                {/* 详细介绍 */}
                <div className="col-span-full">
                  <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    详细介绍
                  </label>
                  <textarea
                    id="detailedDescription"
                    name="detailedDescription"
                    value={formData.detailedDescription}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="详细描述工具的功能、使用方法和优势..."
                  ></textarea>
                </div>
                
                {/* 标签 */}
                <div className="col-span-full">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    标签
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="多个标签用逗号分隔，如：数据分析,AI,自动化"
                  />
                </div>
                
                {/* 工具截图上传 */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工具截图
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
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                        >
                          <span>上传图片</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">或拖拽图片到此处</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        支持PNG, JPG, GIF格式，最多5张图片
                      </p>
                    </div>
                  </div>
                  
                  {/* 图片预览区域 */}
                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`预览图 ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 提交按钮 */}
                <div className="col-span-full mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        提交中...
                      </span>
                    ) : (
                      '提交工具'
                    )}
                  </button>
                  
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    提交即表示您同意我们的<Link href="#" className="text-teal-600 hover:underline">使用条款</Link>和<Link href="#" className="text-teal-600 hover:underline">隐私政策</Link>
                  </p>
                </div>
              </div>
            </form>
          )}
          
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-800 mb-4">提交指南</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                提交的工具应当对创业者有实际帮助，并且能提高工作效率
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                详细的描述和截图有助于其他用户更好地了解工具功能
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                确保提供的下载链接和原始链接是有效的
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                每个提交的工具都会经过审核后才会在平台上展示
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 