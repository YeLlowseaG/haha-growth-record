import { Todo } from '@/types';

// 待办事项API基础URL
const API_BASE = '/api/todos';

export interface TodoPaginatedResponse {
  todos: Todo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// 获取待办事项列表
export const loadTodos = async (
  page: number = 1, 
  limit: number = 20,
  filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }
): Promise<TodoPaginatedResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    if (filters?.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    
    if (filters?.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }
    
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) {
      throw new Error('获取待办事项失败');
    }
    return await response.json();
  } catch (error) {
    console.error('加载待办事项失败:', error);
    return {
      todos: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    };
  }
};

// 创建新的待办事项
export const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '创建待办事项失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('添加待办事项失败:', error);
    return null;
  }
};

// 更新待办事项
export const updateTodo = async (id: string, todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo | null> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '更新待办事项失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('更新待办事项失败:', error);
    return null;
  }
};

// 删除待办事项
export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '删除待办事项失败');
    }
    
    return true;
  } catch (error) {
    console.error('删除待办事项失败:', error);
    return false;
  }
};

// 切换待办事项状态（完成/未完成）
export const toggleTodoStatus = async (id: string, currentStatus: Todo['status']): Promise<Todo | null> => {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '更新状态失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('切换状态失败:', error);
    return null;
  }
};