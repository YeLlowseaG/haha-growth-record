'use client';

import { MessageCircle, Camera, Filter, Calendar } from 'lucide-react';
import { MemoryType } from '@/types';

interface SidebarProps {
  selectedType: MemoryType['type'] | 'all';
  onTypeChange: (type: MemoryType['type'] | 'all') => void;
  totalCount: number;
  typeCounts: {
    conversation: number;
    photo: number;
  };
}

export default function Sidebar({ selectedType, onTypeChange, totalCount, typeCounts }: SidebarProps) {
  const filterOptions = [
    { type: 'all' as const, icon: Filter, label: '哈哈的所有记录', count: totalCount, color: 'gray' },
    { type: 'conversation' as const, icon: MessageCircle, label: '哈哈的对话', count: typeCounts.conversation, color: 'blue' },
    { type: 'photo' as const, icon: Camera, label: '哈哈的照片', count: typeCounts.photo, color: 'green' },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">筛选哈哈的记录</h2>
        <div className="space-y-2">
          {filterOptions.map(({ type, icon: Icon, label, count, color }) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                selectedType === type
                  ? `bg-${color}-50 border-${color}-200 border text-${color}-700`
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${selectedType === type ? `text-${color}-500` : 'text-gray-400'}`} />
                <span className="font-medium">{label}</span>
              </div>
              <span className={`text-sm font-medium ${
                selectedType === type ? `text-${color}-600` : 'text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">记录哈哈的成长</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">哈哈的对话</p>
              <p className="text-xs">记录哈哈说过的可爱话语</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Camera className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">哈哈的照片</p>
              <p className="text-xs">保存哈哈珍贵的照片瞬间</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 