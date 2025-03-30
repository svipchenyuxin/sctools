// 调试工具函数

// 存储调试日志
const debugLogs: any[] = [];

// 最大API调用次数
const MAX_API_CALLS = 5;
// API调用计数器
let apiCallCounter = 0;
// 最后一次API调用时间
let lastApiCallTime = 0;

// 记录调试日志
export function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${message}`, data || '');
  debugLogs.push({
    timestamp: new Date().toISOString(),
    message,
    data
  });
  
  // 如果日志太多，删除旧的
  if (debugLogs.length > 100) {
    debugLogs.shift();
  }
}

// 获取所有调试日志
export function getDebugLogs() {
  return [...debugLogs];
}

// 重置调试计数器
export function resetDebugCounters() {
  apiCallCounter = 0;
  lastApiCallTime = Date.now();
  logDebug('计数器已重置');
}

// 是否应该阻止API调用
export function shouldBlockApiCalls() {
  // 如果超过最大API调用次数，阻止调用
  if (apiCallCounter >= MAX_API_CALLS) {
    logDebug('API调用次数超过限制', { apiCallCounter, MAX_API_CALLS });
    return true;
  }
  
  // 如果两次调用间隔太短，阻止调用
  const now = Date.now();
  if (lastApiCallTime > 0 && now - lastApiCallTime < 500) {
    logDebug('API调用间隔太短', { interval: now - lastApiCallTime });
    return true;
  }
  
  // 更新计数器和时间
  apiCallCounter++;
  lastApiCallTime = now;
  return false;
}

// 启用无限循环检测
export function enableInfiniteLoopDetection() {
  let loopCounter = 0;
  const maxLoops = 1000;
  
  setInterval(() => {
    if (loopCounter > maxLoops) {
      logDebug('检测到可能的无限循环', { loopCounter });
      console.error('检测到可能的无限循环，请检查代码');
    }
    loopCounter = 0;
  }, 1000);
  
  // 添加全局计数器
  const originalSetTimeout = window.setTimeout;
  // 正确类型定义的setTimeout重写
  window.setTimeout = function(handler: TimerHandler, timeout?: number, ...args: any[]): number {
    loopCounter++;
    return originalSetTimeout(handler, timeout, ...args);
  } as typeof window.setTimeout;
  
  logDebug('无限循环检测已启用');
}

// 跟踪页面访问
export function trackPageVisit(pageId: string) {
  try {
    const visitedPages = getVisitedPages();
    
    // 检查是否已访问
    if (visitedPages.includes(pageId)) {
      logDebug('页面已访问过', { pageId });
      return false;
    }
    
    // 添加到已访问列表
    visitedPages.push(pageId);
    saveVisitedPages(visitedPages);
    logDebug('添加到已访问页面', { pageId });
    return true;
  } catch (error) {
    console.error('跟踪页面访问出错:', error);
    return false;
  }
}

// 获取已访问页面
function getVisitedPages(): string[] {
  try {
    const stored = localStorage.getItem('visitedPages');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('获取已访问页面出错:', error);
    return [];
  }
}

// 保存已访问页面
function saveVisitedPages(pages: string[]) {
  try {
    localStorage.setItem('visitedPages', JSON.stringify(pages));
  } catch (error) {
    console.error('保存已访问页面出错:', error);
  }
}

// 清除所有存储
export function clearAllStorage() {
  try {
    localStorage.removeItem('visitedPages');
    logDebug('已清除所有存储');
  } catch (error) {
    console.error('清除存储出错:', error);
  }
} 