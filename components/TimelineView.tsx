'use client';

import { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageCircle, Camera, Edit, Trash2, Tag, Calendar } from 'lucide-react';
import { MemoryType } from '@/types';
import { getTagClasses } from '@/lib/tag-colors';
import { calculateHahaAgeAtDate } from '@/lib/age-utils';

interface TimelineViewProps {
  memories: MemoryType[];
  onEdit: (memory: MemoryType) => void;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

interface GroupedMemories {
  date: string;
  displayDate: string;
  memories: MemoryType[];
}

export default function TimelineView({ memories, onEdit, onDelete, onTagClick }: TimelineViewProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // 按日期分组记忆
  const groupedMemories: GroupedMemories[] = memories
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 按日期倒序排列
    .reduce((groups: GroupedMemories[], memory) => {
      const date = memory.date;
      const existingGroup = groups.find(group => isSameDay(parseISO(group.date), parseISO(date)));
      
      if (existingGroup) {
        existingGroup.memories.push(memory);
      } else {
        groups.push({
          date,
          displayDate: format(parseISO(date), 'yyyy年MM月dd日 EEEE', { locale: zhCN }),
          memories: [memory]
        });
      }
      
      return groups;
    }, []);

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const getTypeIcon = (type: MemoryType['type']) => {
    switch (type) {
      case 'conversation':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'photo':
        return <Camera className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: MemoryType['type']) => {
    switch (type) {
      case 'conversation':
        return '对话';
      case 'photo':
        return '照片';
      default:
        return '';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">还没有时间轴记录</h3>
        <p className="text-gray-600">开始记录哈哈的成长瞬间，创建属于你们的时间轴吧！</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* 时间轴主线 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-200"></div>
        
        {groupedMemories.map((group, groupIndex) => {
          const isExpanded = expandedDates.has(group.date);
          const shouldShowAll = group.memories.length <= 3 || isExpanded;
          const visibleMemories = shouldShowAll ? group.memories : group.memories.slice(0, 3);
          
          return (
            <div key={group.date} className="relative mb-8">
              {/* 日期节点 */}
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white border-4 border-primary-500 rounded-full shadow-lg z-10 relative">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900">{group.displayDate}</h3>
                  <p className="text-sm text-gray-600">
                    {group.memories.length} 条记录
                    {group.memories.length > 3 && !isExpanded && (
                      <span className="text-primary-600 ml-2">
                        (还有 {group.memories.length - 3} 条)
                      </span>
                    )}
                  </p>
                </div>
                {group.memories.length > 3 && (
                  <button
                    onClick={() => toggleDateExpansion(group.date)}
                    className="ml-auto px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    {isExpanded ? '收起' : '展开全部'}
                  </button>
                )}
              </div>

              {/* 该日期的记录 */}
              <div className="ml-8 space-y-4">
                {visibleMemories.map((memory, memoryIndex) => (
                  <div key={memory.id} className="relative">
                    {/* 时间轴节点 */}
                    <div className="absolute -left-6 top-4 w-3 h-3 bg-white border-2 border-primary-400 rounded-full shadow-sm z-10"></div>
                    
                    {/* 记录卡片 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {getTypeIcon(memory.type)}
                          <span className="text-sm font-medium text-gray-600">{getTypeLabel(memory.type)}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{formatTime(memory.date)}</span>
                          {memory.type === 'conversation' && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                年龄: {calculateHahaAgeAtDate(memory.date)}
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => onEdit(memory)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(memory.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{memory.title}</h4>
                      
                      <div className="text-gray-700 mb-3">
                        {memory.content.length > 150 ? (
                          <div>
                            <p>{memory.content.substring(0, 150)}...</p>
                            <button className="text-primary-500 hover:text-primary-600 text-sm mt-1">
                              查看完整内容
                            </button>
                          </div>
                        ) : (
                          <p>{memory.content}</p>
                        )}
                      </div>

                      {/* 照片展示 */}
                      {memory.type === 'photo' && 'imageUrls' in memory && (
                        <div className="mb-3">
                          {(() => {
                            const photo = memory as any;
                            const images = photo.imageUrls || (photo.imageUrl ? [photo.imageUrl] : []);
                            
                            if (images.length === 0) return null;
                            
                            if (images.length === 1) {
                              return (
                                <img
                                  src={images[0]}
                                  alt={memory.title}
                                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(images[0], '_blank')}
                                />
                              );
                            }
                            
                            return (
                              <div className="grid grid-cols-2 gap-2">
                                {images.slice(0, 4).map((url: string, index: number) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`${memory.title} - ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                ))}
                                {images.length > 4 && (
                                  <div className="flex items-center justify-center bg-gray-100 rounded-lg">
                                    <span className="text-sm text-gray-600">+{images.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* 标签 */}
                      {memory.tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.map((tag, index) => (
                              <button
                                key={index}
                                onClick={() => onTagClick?.(tag)}
                                className={`${getTagClasses(tag)} text-xs hover:opacity-80 transition-opacity cursor-pointer`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
