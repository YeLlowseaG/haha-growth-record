'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, CheckCircle2, Circle, AlertCircle, Edit, Trash2, Tag, Copy } from 'lucide-react';
import { DailyTask } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 模拟数据
  useEffect(() => {
    const mockTasks: DailyTask[] = [
      {
        id: '1',
        title: '数学作业 - 第3章练习',
        description: '完成第3章的所有练习题，包括选择题和计算题',
        subject: '数学',
        status: 'pending',
        dueDate: '2024-09-03',
        estimatedTime: 60,
        difficulty: 'medium',
        tags: ['数学', '练习'],
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '2',
        title: '语文作文 - 我的暑假',
        description: '写一篇关于暑假生活的作文，不少于500字',
        subject: '语文',
        status: 'in_progress',
        dueDate: '2024-09-04',
        estimatedTime: 90,
        actualTime: 30,
        difficulty: 'hard',
        tags: ['语文', '作文'],
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      },
      {
        id: '3',
        title: '英语单词背诵',
        description: '背诵Unit 2的20个新单词',
        subject: '英语',
        status: 'completed',
        dueDate: '2024-09-02',
        estimatedTime: 30,
        actualTime: 25,
        difficulty: 'easy',
        completedAt: '2024-09-01',
        tags: ['英语', '单词'],
        createdAt: '2024-08-31',
        updatedAt: '2024-09-01'
      },
      {
        id: '4',
        title: '科学实验报告',
        description: '完成植物生长实验的观察报告',
        subject: '科学',
        status: 'pending',
        dueDate: '2024-09-05',
        estimatedTime: 120,
        difficulty: 'hard',
        tags: ['科学', '实验'],
        createdAt: '2024-09-01',
        updatedAt: '2024-09-01'
      }
    ];
    
    setTimeout(() => {
      setTasks(mockTasks);
      setIsLoading(false);
    }, 500);
  }, []);

  const getDifficultyColor = (difficulty: DailyTask['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'hard': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: DailyTask['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  };

  const getStatusColor = (status: DailyTask['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500 bg-gray-100';
      case 'in_progress': return 'text-blue-500 bg-blue-100';
      case 'completed': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: DailyTask['status']) => {
    switch (status) {
      case 'pending': return '待做';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      '数学': 'bg-blue-100 text-blue-700',
      '语文': 'bg-green-100 text-green-700',
      '英语': 'bg-purple-100 text-purple-700',
      '科学': 'bg-orange-100 text-orange-700',
      '历史': 'bg-yellow-100 text-yellow-700',
      '地理': 'bg-indigo-100 text-indigo-700',
      '物理': 'bg-pink-100 text-pink-700',
      '化学': 'bg-teal-100 text-teal-700'
    };
    return colors[subject] || 'bg-gray-100 text-gray-700';
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    if (confirm('确定要删除这个作业吗？')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !tasks.find(t => t.id === dueDate)?.completedAt;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // 按状态分组
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  {[1, 2].map(j => (
                    <div key={j} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
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
              <h1 className="text-2xl font-bold text-gray-900">每日作业</h1>
              <p className="text-gray-600">跟踪每日作业进度</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>从QQ导入</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>添加作业</span>
              </button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总作业</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p>
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
                <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 看板视图 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 待做 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Circle className="h-5 w-5 text-yellow-500" />
                <span>待做 ({pendingTasks.length})</span>
              </h3>
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskStatus}
                  onDelete={deleteTask}
                  getSubjectColor={getSubjectColor}
                  getDifficultyColor={getDifficultyColor}
                  getDifficultyText={getDifficultyText}
                  isOverdue={isOverdue}
                  formatTime={formatTime}
                />
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Circle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">暂无待做作业</p>
                </div>
              )}
            </div>
          </div>

          {/* 进行中 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>进行中 ({inProgressTasks.length})</span>
              </h3>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskStatus}
                  onDelete={deleteTask}
                  getSubjectColor={getSubjectColor}
                  getDifficultyColor={getDifficultyColor}
                  getDifficultyText={getDifficultyText}
                  isOverdue={isOverdue}
                  formatTime={formatTime}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">暂无进行中的作业</p>
                </div>
              )}
            </div>
          </div>

          {/* 已完成 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>已完成 ({completedTasks.length})</span>
              </h3>
            </div>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskStatus}
                  onDelete={deleteTask}
                  getSubjectColor={getSubjectColor}
                  getDifficultyColor={getDifficultyColor}
                  getDifficultyText={getDifficultyText}
                  isOverdue={isOverdue}
                  formatTime={formatTime}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">暂无已完成的作业</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 任务卡片组件
function TaskCard({ 
  task, 
  onToggle, 
  onDelete, 
  getSubjectColor, 
  getDifficultyColor, 
  getDifficultyText, 
  isOverdue, 
  formatTime 
}: {
  task: DailyTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getSubjectColor: (subject: string) => string;
  getDifficultyColor: (difficulty: DailyTask['difficulty']) => string;
  getDifficultyText: (difficulty: DailyTask['difficulty']) => string;
  isOverdue: (dueDate: string) => boolean;
  formatTime: (minutes: number) => string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-200 ${
      task.status === 'completed' ? 'opacity-75' : 'hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-1 text-gray-400 hover:text-primary-600 transition-colors"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2 mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(task.subject)}`}>
                {task.subject}
              </span>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                {getDifficultyText(task.difficulty)}
              </span>
              
              {task.estimatedTime && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>预计 {formatTime(task.estimatedTime)}</span>
                </div>
              )}
              
              {task.actualTime && task.status === 'completed' && (
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <Clock className="h-3 w-3" />
                  <span>实际 {formatTime(task.actualTime)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-2">
              <div className={`flex items-center space-x-1 text-xs ${
                isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'
              }`}>
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                  {isOverdue(task.dueDate) && ' (已逾期)'}
                </span>
              </div>
            </div>
            
            {task.tags.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
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
            onClick={() => console.log('编辑', task.id)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
