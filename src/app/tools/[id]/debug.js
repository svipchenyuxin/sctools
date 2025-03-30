// debug.js - 调试工具详情页无限刷新问题
// 使用这个文件来收集调试信息，可以在console中查看

// 调试模式标志
export const DEBUG_MODE = true;

// 请求历史记录
const requestHistory = [];

// 记录调试信息
export function logDebug(message, data) {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    const logMessage = `[DEBUG ${timestamp}] ${message}`;
    
    console.log(logMessage, data);
    
    // 记录到历史
    if (typeof window !== 'undefined') {
      requestHistory.push({ timestamp, message, data });
      
      // 最多保留100条记录
      if (requestHistory.length > 100) {
        requestHistory.shift();
      }
    }
  }
}

// 获取完整的调试历史
export function getDebugHistory() {
  return requestHistory;
}

// 清除所有本地存储的数据
export function clearAllStorage() {
  if (typeof window !== 'undefined') {
    try {
      // 记录正在清除的内容
      const storageKeys = Object.keys(localStorage);
      logDebug('清除所有localStorage数据', { keys: storageKeys });
      
      // 清除所有localStorage数据
      localStorage.clear();
      
      // 重新初始化一些默认值
      localStorage.setItem('page_reload_count', '0');
      localStorage.setItem('block_api_calls', 'false');
      localStorage.setItem('last_reload_time', '0');
      
      logDebug('成功清除localStorage并重置');
      
      return true;
    } catch (error) {
      console.error('清除localStorage失败:', error);
      return false;
    }
  }
  return false;
}

export function trackPageVisit(id) {
  if (typeof window !== 'undefined') {
    const visitKey = `tool_${id}_visited`;
    const lastVisit = localStorage.getItem(visitKey);
    const now = new Date().getTime();
    
    // 记录访问信息
    logDebug(`页面访问: ${id}`, { lastVisit, now });
    
    // 如果30秒内没有访问过，才算新访问
    if (!lastVisit || (now - parseInt(lastVisit, 10)) > 30000) {
      localStorage.setItem(visitKey, now.toString());
      return true; // 新访问
    }
    
    return false; // 重复访问
  }
  
  return false;
}

export function enableInfiniteLoopDetection() {
  if (typeof window !== 'undefined') {
    try {
      const reloadKey = 'page_reload_count';
      let reloadCount = parseInt(localStorage.getItem(reloadKey) || '0', 10);
      
      reloadCount++;
      localStorage.setItem(reloadKey, reloadCount.toString());
      
      logDebug(`页面加载计数: ${reloadCount}`, { 
        url: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // 如果5秒内加载超过3次，显示警告并阻止进一步加载
      if (reloadCount > 3) {
        const lastReloadTime = parseInt(localStorage.getItem('last_reload_time') || '0', 10);
        const now = new Date().getTime();
        
        if (now - lastReloadTime < 5000) {
          logDebug('检测到无限刷新循环!', { 
            reloadCount, 
            timeDiff: now - lastReloadTime,
            history: requestHistory
          });
          
          // 显示警告
          const warningDiv = document.createElement('div');
          warningDiv.style.position = 'fixed';
          warningDiv.style.top = '0';
          warningDiv.style.left = '0';
          warningDiv.style.width = '100%';
          warningDiv.style.padding = '20px';
          warningDiv.style.backgroundColor = 'red';
          warningDiv.style.color = 'white';
          warningDiv.style.zIndex = '9999';
          warningDiv.style.textAlign = 'center';
          warningDiv.innerHTML = `
            <h3>检测到页面无限刷新!</h3>
            <p>已阻止进一步的API调用，10秒后将重置。</p>
            <p>请查看控制台获取更多信息。</p>
            <button id="debugResetButton" style="background: white; color: red; border: none; padding: 5px 10px; margin-top: 10px; cursor: pointer;">
              立即重置
            </button>
            <button id="debugClearButton" style="background: white; color: red; border: none; padding: 5px 10px; margin-top: 10px; margin-left: 10px; cursor: pointer;">
              清除所有缓存
            </button>
          `;
          
          document.body.appendChild(warningDiv);
          
          // 添加重置按钮事件
          setTimeout(() => {
            const resetButton = document.getElementById('debugResetButton');
            if (resetButton) {
              resetButton.addEventListener('click', () => {
                resetDebugCounters();
                warningDiv.remove();
                window.location.reload();
              });
            }
            
            const clearButton = document.getElementById('debugClearButton');
            if (clearButton) {
              clearButton.addEventListener('click', () => {
                clearAllStorage();
                warningDiv.remove();
                window.location.reload();
              });
            }
          }, 0);
          
          // 阻止进一步的API调用
          localStorage.setItem('block_api_calls', 'true');
          
          // 记录当前状态到localStorage以便调试
          localStorage.setItem('debug_state', JSON.stringify({
            time: new Date().toISOString(),
            reloadCount,
            path: window.location.pathname,
            history: requestHistory.slice(-10) // 最近10条记录
          }));
          
          // 重置计数器
          setTimeout(() => {
            localStorage.setItem(reloadKey, '0');
            localStorage.setItem('block_api_calls', 'false');
            
            // 尝试移除警告
            try {
              const warningElement = document.querySelector('[style*="position: fixed"][style*="background-color: red"]');
              if (warningElement) {
                warningElement.remove();
              }
            } catch (e) {
              console.error('移除警告元素失败', e);
            }
          }, 10000);
          
          return true; // 返回true表示检测到循环
        }
      }
      
      localStorage.setItem('last_reload_time', new Date().getTime().toString());
    } catch (error) {
      console.error('无限循环检测失败:', error);
    }
  }
  
  return false;
}

export function shouldBlockApiCalls() {
  if (typeof window !== 'undefined') {
    const isBlocked = localStorage.getItem('block_api_calls') === 'true';
    
    if (isBlocked) {
      logDebug('API调用被阻止');
    }
    
    return isBlocked;
  }
  return false;
}

export function resetDebugCounters() {
  if (typeof window !== 'undefined') {
    logDebug('重置调试计数器');
    localStorage.setItem('page_reload_count', '0');
    localStorage.setItem('block_api_calls', 'false');
    localStorage.setItem('last_reload_time', '0');
    
    // 清除特定工具的访问记录
    const toolId = window.location.pathname.split('/').pop();
    if (toolId) {
      localStorage.removeItem(`tool_${toolId}_visited`);
    }
  }
}

// 记录全局错误
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logDebug('全局错误', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.toString()
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logDebug('未处理的Promise拒绝', {
      reason: event.reason?.toString()
    });
  });
  
  // 页面加载时自动清除所有localStorage数据
  if (window.location.pathname.includes('/tools/')) {
    logDebug('工具详情页加载，自动清除localStorage');
    // 使用setTimeout确保在页面完全加载后执行
    setTimeout(clearAllStorage, 0);
  }
} 