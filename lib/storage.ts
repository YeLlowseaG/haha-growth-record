import { MemoryType } from '@/types';

const STORAGE_KEY = 'kids-memories';
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB 限制

export const saveMemories = (memories: MemoryType[]): void => {
  if (typeof window !== 'undefined') {
    // 清理过大的数据
    const cleanedMemories = cleanLargeData(memories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedMemories));
  }
};

export const loadMemories = (): MemoryType[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

export const addMemory = (memory: MemoryType): void => {
  const memories = loadMemories();
  memories.unshift(memory);
  saveMemories(memories);
};

export const updateMemory = (id: string, updatedMemory: MemoryType): void => {
  const memories = loadMemories();
  const index = memories.findIndex(m => m.id === id);
  if (index !== -1) {
    memories[index] = updatedMemory;
    saveMemories(memories);
  }
};

export const deleteMemory = (id: string): void => {
  const memories = loadMemories();
  const filtered = memories.filter(m => m.id !== id);
  saveMemories(filtered);
};

export const searchMemories = (query: string): MemoryType[] => {
  const memories = loadMemories();
  const lowerQuery = query.toLowerCase();
  
  return memories.filter(memory => 
    memory.title.toLowerCase().includes(lowerQuery) ||
    memory.content.toLowerCase().includes(lowerQuery) ||
    memory.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getMemoriesByType = (type: MemoryType['type']): MemoryType[] => {
  const memories = loadMemories();
  return memories.filter(memory => memory.type === type);
};

// 清理过大的数据
const cleanLargeData = (memories: MemoryType[]): MemoryType[] => {
  return memories.map(memory => {
    if (memory.type === 'photo') {
      const photo = memory as any;
      
      // 处理新格式 imageUrls
      if (photo.imageUrls && Array.isArray(photo.imageUrls)) {
        const cleanedUrls = photo.imageUrls.map((url: string) => {
          if (url && url.startsWith('data:image') && url.length > 500000) {
            return createThumbnail(url);
          }
          return url;
        });
        
        return {
          ...memory,
          imageUrls: cleanedUrls,
          imageUrl: cleanedUrls[0] || undefined, // 向后兼容
        };
      }
      
      // 向后兼容：处理旧格式 imageUrl
      if (photo.imageUrl && photo.imageUrl.startsWith('data:image') && photo.imageUrl.length > 500000) {
        const thumbnailUrl = createThumbnail(photo.imageUrl);
        return {
          ...memory,
          imageUrls: [thumbnailUrl],
          imageUrl: thumbnailUrl,
          content: photo.content + '\n\n[原图已压缩为缩略图以节省空间]'
        };
      }
      
      // 迁移旧数据：如果只有 imageUrl 没有 imageUrls，创建 imageUrls
      if (photo.imageUrl && !photo.imageUrls) {
        return {
          ...memory,
          imageUrls: [photo.imageUrl],
        };
      }
    }
    return memory;
  });
};

// 创建缩略图
const createThumbnail = (imageUrl: string): string => {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  img.onload = () => {
    // 缩略图尺寸
    const maxSize = 300;
    let { width, height } = img;
    
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
  };
  
  img.src = imageUrl;
  return canvas.toDataURL('image/jpeg', 0.6);
};

// 检查存储空间
export const checkStorageSpace = (): { used: number; available: number; percentage: number } => {
  if (typeof window === 'undefined') {
    return { used: 0, available: MAX_STORAGE_SIZE, percentage: 0 };
  }

  const memories = loadMemories();
  const dataSize = new Blob([JSON.stringify(memories)]).size;
  const percentage = (dataSize / MAX_STORAGE_SIZE) * 100;

  return {
    used: dataSize,
    available: MAX_STORAGE_SIZE,
    percentage: Math.min(percentage, 100)
  };
};

// 导出数据
export const exportData = (): string => {
  const memories = loadMemories();
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    memories
  };
  return JSON.stringify(data, null, 2);
};

// 导入数据
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.memories && Array.isArray(data.memories)) {
      saveMemories(data.memories);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// 清理旧数据
export const cleanupOldData = (daysToKeep: number = 365): void => {
  const memories = loadMemories();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const filteredMemories = memories.filter(memory => {
    const memoryDate = new Date(memory.date);
    return memoryDate > cutoffDate;
  });
  
  saveMemories(filteredMemories);
}; 

// 删除所有对话记录
export const deleteAllConversations = (): void => {
  const memories = loadMemories();
  const filtered = memories.filter(memory => memory.type !== 'conversation');
  saveMemories(filtered);
};

// 删除所有记录
export const deleteAllMemories = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}; 