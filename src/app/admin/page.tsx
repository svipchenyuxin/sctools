'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toolsData } from '@/data/toolsData';

// 定义工具类型
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

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  // 加载工具数据
  useEffect(() => {
    // 首先尝试从本地导入
    setTools([...toolsData]);
    setLoading(false);
    
    // 也可以尝试从API加载数据作为备份方案
    fetch('/api/tools')
      .then(response => response.json())
      .then(data => {
        if (data && data.data && Array.isArray(data.data)) {
          setTools(data.data);
        }
      })
      .catch(error => {
        console.error('加载工具数据出错:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // 处理删除操作
  const handleDeleteClick = (toolId: string) => {
    setToolToDelete(toolId);
    setDeleteModalOpen(true);
  };
  
  // 确认删除工具
  const confirmDelete = async () => {
    if (toolToDelete) {
      setIsDeleting(true);
      
      try {
        // 调用API删除工具
        const response = await fetch(`/api/tools?id=${toolToDelete}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`删除失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // 在前端状态中移除工具
          setTools(prevTools => prevTools.filter(tool => tool.id !== toolToDelete));
          setStatusMessage({
            text: '工具已成功删除',
            type: 'success'
          });
          
          // 刷新数据
          setTimeout(() => {
            fetch('/api/tools')
              .then(response => response.json())
              .then(data => {
                if (data && data.data && Array.isArray(data.data)) {
                  setTools(data.data);
                }
              })
              .catch(error => {
                console.error('刷新工具数据出错:', error);
              });
          }, 1000);
          
          // 3秒后清除状态消息
          setTimeout(() => {
            setStatusMessage(null);
          }, 3000);
        } else {
          throw new Error(result.message || '删除失败');
        }
      } catch (error) {
        console.error('删除工具时出错:', error);
        setStatusMessage({
          text: error instanceof Error ? error.message : '删除失败，请重试',
          type: 'error'
        });
      } finally {
        setIsDeleting(false);
        setDeleteModalOpen(false);
        setToolToDelete(null);
      }
    }
  };
  
  // 取消删除操作
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setToolToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary text-white p-4 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">工具库管理后台</h1>
              <Link href="/" className="text-white hover:text-gray-200">
                返回前台
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
            <h1 className="text-2xl font-bold">工具库管理后台</h1>
            <Link href="/" className="text-white hover:text-gray-200">
              返回前台
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">工具管理</h2>
          <Link 
            href="/admin/add" 
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition"
          >
            添加新工具
          </Link>
        </div>
        
        {/* 状态消息 */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {statusMessage.text}
          </div>
        )}
        
        {/* 工具列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    工具名称
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平台
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    上传日期
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    点击量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tool.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{tool.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {tool.platforms.map((platform: string) => (
                          <span 
                            key={platform} 
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tool.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tool.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/tools/${tool.id}`} 
                          className="text-teal-600 hover:text-teal-900"
                          target="_blank"
                        >
                          查看
                        </Link>
                        <Link 
                          href={`/admin/edit/${tool.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          编辑
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(tool.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {/* 删除确认对话框 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              您确定要删除这个工具吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition"
                disabled={isDeleting}
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 