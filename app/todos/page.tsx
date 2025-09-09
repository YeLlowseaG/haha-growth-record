'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, CheckCircle2, Circle, Clock, AlertCircle, Edit, Trash2, Tag } from 'lucide-react';
import { Todo } from '@/types';
import AddTodoModal from '@/components/AddTodoModal';
import { loadTodos, addTodo as addTodoAPI, updateTodo as updateTodoAPI, deleteTodo as deleteTodoAPI, toggleTodoStatus } from '@/lib/todo-storage';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Todo['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Todo['priority'] | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();

  // 加载待办事项数据
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await loadTodos(1, 100); // 加载所有待办事项
        setTodos(response.todos);
        setFilteredTodos(response.todos);
      } catch (error) {
        console.error('加载待办事项失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodos();
  }, []);

  // 筛选逻辑
  useEffect(() => {
    let filtered = todos;

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(todo => todo.status === statusFilter);
    }

    // 优先级筛选
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    setFilteredTodos(filtered);
  }, [todos, searchQuery, statusFilter, priorityFilter]);

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'low': return 'text-gray-500 bg-gray-100';
      case 'medium': return 'text-blue-500 bg-blue-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'urgent': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getPriorityText = (priority: Todo['priority']) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      case 'urgent': return '紧急';
      default: return '未知';
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500 bg-gray-100';
      case 'in_progress': return 'text-blue-500 bg-blue-100';
      case 'completed': return 'text-green-500 bg-green-100';
      case 'cancelled': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: Todo['status']) => {
    switch (status) {
      case 'pending': return '待做';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const handleToggleTodoStatus = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const updatedTodo = await toggleTodoStatus(id, todo.status);
    if (updatedTodo) {
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    }
  };

  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo = await addTodoAPI(todoData);
    if (newTodo) {
      setTodos([newTodo, ...todos]);
    }
  };

  const handleUpdateTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTodo) return;
    
    const updatedTodo = await updateTodoAPI(editingTodo.id, todoData);
    if (updatedTodo) {
      setTodos(todos.map(todo => todo.id === editingTodo.id ? updatedTodo : todo));
      setEditingTodo(undefined);
    }
  };

  const handleSaveTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTodo) {
      await handleUpdateTodo(todoData);
    } else {
      await handleAddTodo(todoData);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (confirm('确定要删除这个待办事项吗？')) {
      const success = await deleteTodoAPI(id);
      if (success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    }
  };

  const editTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsAddModalOpen(true);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !todos.find(t => t.id === dueDate)?.completedAt;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">待办事项</h1>
              <p className="text-gray-600">管理哈哈的待办任务</p>
            </div>
            <button
              onClick={() => {
                setEditingTodo(undefined);
                setIsAddModalOpen(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>添加待办</span>
            </button>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索待办事项..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Todo['status'] | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="pending">待做</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Todo['priority'] | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部优先级</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总待办</p>
                <p className="text-2xl font-bold text-gray-900">{todos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Circle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待做</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {todos.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-blue-600">
                  {todos.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {todos.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 待办事项列表 */}
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? '没有找到匹配的待办事项' 
                : '还没有待办事项'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? '尝试调整搜索条件或筛选器'
                : '开始添加第一个待办事项吧！'
              }
            </p>
            {(!searchQuery && statusFilter === 'all' && priorityFilter === 'all') && (
              <button
                onClick={() => {
                  setEditingTodo(undefined);
                  setIsAddModalOpen(true);
                }}
                className="btn-primary"
              >
                添加第一个待办事项
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-200 ${
                  todo.status === 'completed' ? 'opacity-75' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleToggleTodoStatus(todo.id)}
                      className="mt-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {todo.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${
                        todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {todo.title}
                      </h3>
                      
                      {todo.description && (
                        <p className={`text-sm mt-1 ${
                          todo.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                          {getPriorityText(todo.priority)}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                          {getStatusText(todo.status)}
                        </span>
                        
                        {todo.dueDate && (
                          <div className={`flex items-center space-x-1 text-xs ${
                            isOverdue(todo.dueDate) ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
                              {isOverdue(todo.dueDate) && ' (已逾期)'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {todo.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {todo.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => editTodo(todo)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="编辑"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加/编辑待办事项弹窗 */}
        <AddTodoModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTodo(undefined);
          }}
          onSave={handleSaveTodo}
          editingTodo={editingTodo}
        />
      </div>
    </div>
  );
}
