// 工具数据类型定义

// 平台类型定义
export type PlatformId = 'douyin' | 'xiaohongshu' | 'wechat' | 'xianyu' | 'taobao' | 'other';

// 分类类型定义
export type CategoryId = 'project_research' | 'image_processing' | 'office_efficiency' | 'team_collaboration' | string;

// 工具数据类型
export interface Tool {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  categories?: string[]; // 使用可选属性，确保向后兼容
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

// 表单数据类型
export interface ToolFormData {
  name: string;
  description: string;
  platforms: string[];
  categories: string[];
  tags: string;
  detailedDescription: string;
  downloadLink: string;
  originalPostLink: string;
  inviteCode: string;
  uploader: string;
} 