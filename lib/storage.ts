import { MemoryType } from '@/types';

// 数据库API基础URL
const API_BASE = '/api/memories';

// 初始化数据库
export const initDatabase = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/init-db', {
      method: 'POST',
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('初始化数据库失败:', error);
    return false;
  }
};

export const loadMemories = async (): Promise<MemoryType[]> => {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('获取记录失败');
    }
    return await response.json();
  } catch (error) {
    console.error('加载记录失败:', error);
    return [];
  }
};

export const addMemory = async (memory: MemoryType): Promise<MemoryType | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memory),
    });
    
    if (!response.ok) {
      throw new Error('创建记录失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('添加记录失败:', error);
    return null;
  }
};

export const updateMemory = async (id: string, updatedMemory: MemoryType): Promise<MemoryType | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedMemory),
    });
    
    if (!response.ok) {
      throw new Error('更新记录失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('更新记录失败:', error);
    return null;
  }
};

export const deleteMemory = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('删除记录失败');
    }
    
    return true;
  } catch (error) {
    console.error('删除记录失败:', error);
    return false;
  }
};

export const searchMemories = async (query: string): Promise<MemoryType[]> => {
  try {
    const response = await fetch(`${API_BASE}?search=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('搜索记录失败');
    }
    return await response.json();
  } catch (error) {
    console.error('搜索记录失败:', error);
    return [];
  }
};

export const getMemoriesByType = async (type: MemoryType['type']): Promise<MemoryType[]> => {
  try {
    const response = await fetch(`${API_BASE}?type=${type}`);
    if (!response.ok) {
      throw new Error('获取记录失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取类型记录失败:', error);
    return [];
  }
};

// 保持向后兼容的同步方法（传统 localStorage 方式）
export const loadMemoriesSync = (): MemoryType[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('kids-memories');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

export const saveMemoriesSync = (memories: MemoryType[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kids-memories', JSON.stringify(memories));
  }
};

// 保持向后兼容的删除功能
export const deleteAllConversations = async (): Promise<boolean> => {
  // TODO: 实现数据库版本
  return true;
};

export const deleteAllMemories = async (): Promise<boolean> => {
  // TODO: 实现数据库版本  
  return true;
};

// 临时保持兼容的函数（为StorageManager组件）
export const checkStorageSpace = (): { used: number; available: number; percentage: number } => {
  // TODO: 实现数据库版本的存储空间检查
  return { used: 0, available: 50 * 1024 * 1024, percentage: 0 };
};

export const exportData = async (): Promise<string> => {
  try {
    const memories = await loadMemories();
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      memories
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('导出数据失败:', error);
    return '';
  }
};

export const importData = async (jsonData: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonData);
    if (data.memories && Array.isArray(data.memories)) {
      // 批量导入记录
      await Promise.all(
        data.memories.map((memory: MemoryType) => addMemory(memory))
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};

export const cleanupOldData = async (daysToKeep: number = 365): Promise<boolean> => {
  // TODO: 实现数据库版本的数据清理
  return true;
};