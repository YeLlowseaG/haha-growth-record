'use client';

import { useState, useEffect } from 'react';
import { Star, Plus, Target, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Dream, DREAM_CATEGORIES } from '@/types';

interface DreamsWidgetProps {
  onAddDream?: () => void;
  onEditDream?: (dream: Dream) => void;
}

export default function DreamsWidget({ onAddDream, onEditDream }: DreamsWidgetProps) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据 - 实际应该从API获取
  useEffect(() => {
    const mockDreams: Dream[] = [
      {
        id: '1',
        title: '成为一名优秀的程序员',
        description: '学习编程，开发有趣的应用程序',
        category: 'career',
        priority: 'high',
        status: 'in_progress',
        progress: 65,
        milestones: [
          { id: '1', title: '学习基础语法', isCompleted: true, completedAt: '2024-01-15', createdAt: '2024-01-01' },
          { id: '2', title: '完成第一个项目', isCompleted: true, completedAt: '2024-02-20', createdAt: '2024-01-01' },
          { id: '3', title: '学习React框架', isCompleted: false, createdAt: '2024-01-01' },
          { id: '4', title: '开发个人作品集', isCompleted: false, createdAt: '2024-01-01' }
        ],
        tags: ['编程', '技术', '职业'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '2',
        title: '学会弹钢琴',
        description: '能够弹奏自己喜欢的歌曲',
        category: 'hobby',
        priority: 'medium',
        status: 'planning',
        progress: 20,
        milestones: [
          { id: '1', title: '购买钢琴', isCompleted: true, completedAt: '2024-01-10', createdAt: '2024-01-01' },
          { id: '2', title: '学习基础指法', isCompleted: false, createdAt: '2024-01-01' },
          { id: '3', title: '练习简单曲目', isCompleted: false, createdAt: '2024-01-01' }
        ],
        tags: ['音乐', '学习', '爱好'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: '3',
        title: '和爸爸妈妈一起去旅行',
        description: '去日本看樱花，体验不同的文化',
        category: 'family',
        priority: 'high',
        status: 'idea',
        progress: 5,
        milestones: [
          { id: '1', title: '制定旅行计划', isCompleted: false, createdAt: '2024-01-01' },
          { id: '2', title: '办理护照签证', isCompleted: false, createdAt: '2024-01-01' },
          { id: '3', title: '预订机票酒店', isCompleted: false, createdAt: '2024-01-01' }
        ],
        tags: ['旅行', '家庭', '文化'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ];
    
    setTimeout(() => {
      setDreams(mockDreams);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: Dream['status']) => {
    switch (status) {
      case 'idea': return 'text-gray-500 bg-gray-100';
      case 'planning': return 'text-blue-500 bg-blue-100';
      case 'in_progress': return 'text-yellow-500 bg-yellow-100';
      case 'achieved': return 'text-green-500 bg-green-100';
      case 'paused': return 'text-orange-500 bg-orange-100';
      case 'cancelled': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: Dream['status']) => {
    switch (status) {
      case 'idea': return '想法';
      case 'planning': return '计划中';
      case 'in_progress': return '进行中';
      case 'achieved': return '已实现';
      case 'paused': return '暂停';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getPriorityColor = (priority: Dream['priority']) => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-blue-500';
      case 'high': return 'text-orange-500';
      case 'urgent': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">我的梦想</h3>
        </div>
        {onAddDream && (
          <button
            onClick={onAddDream}
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>添加梦想</span>
          </button>
        )}
      </div>

      {dreams.length === 0 ? (
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">还没有记录任何梦想</p>
          {onAddDream && (
            <button
              onClick={onAddDream}
              className="btn-primary text-sm"
            >
              记录第一个梦想
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {dreams.slice(0, 3).map((dream) => {
            const category = DREAM_CATEGORIES[dream.category];
            return (
              <div key={dream.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{dream.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dream.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dream.status)}`}>
                      {getStatusText(dream.status)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Target className={`h-4 w-4 ${getPriorityColor(dream.priority)}`} />
                      <span className="text-xs text-gray-500">
                        {dream.priority === 'low' ? '低' : 
                         dream.priority === 'medium' ? '中' : 
                         dream.priority === 'high' ? '高' : '紧急'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>进度</span>
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{dream.progress}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dream.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 里程碑 */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span>里程碑</span>
                    <span className="text-xs">
                      {dream.milestones.filter(m => m.isCompleted).length} / {dream.milestones.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dream.milestones.slice(0, 3).map((milestone) => (
                      <span
                        key={milestone.id}
                        className={`px-2 py-1 rounded-full text-xs ${
                          milestone.isCompleted 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {milestone.title}
                      </span>
                    ))}
                    {dream.milestones.length > 3 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{dream.milestones.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {dream.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {dream.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{dream.tags.length - 2}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {onEditDream && (
                      <button
                        onClick={() => onEditDream(dream)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="编辑梦想"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {dreams.length > 3 && (
            <div className="text-center pt-2">
              <button className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                查看全部 {dreams.length} 个梦想 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
