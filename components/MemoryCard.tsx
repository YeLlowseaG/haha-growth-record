'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageCircle, Camera, Video, Edit, Trash2, Tag } from 'lucide-react';
import { MemoryType } from '@/types';
import { getTagClasses } from '@/lib/tag-colors';

interface MemoryCardProps {
  memory: MemoryType;
  onEdit: (memory: MemoryType) => void;
  onDelete: (id: string) => void;
}

export default function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  const getTypeIcon = () => {
    switch (memory.type) {
      case 'conversation':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'photo':
        return <Camera className="h-5 w-5 text-green-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (memory.type) {
      case 'conversation':
        return '对话';
      case 'photo':
        return '照片';
      case 'video':
        return '视频';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日', { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getTypeIcon()}
          <span className="text-sm font-medium text-gray-600">{getTypeLabel()}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-500">{formatDate(memory.date)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
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

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{memory.title}</h3>
      
      <div className="mb-4">
        {memory.type === 'conversation' && 'age' in memory && memory.age && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="text-gray-500">年龄: {memory.age}</span>
          </div>
        )}
        
        <div className="text-gray-700 leading-relaxed">
          {showFullContent ? (
            <div>
              <pre className="whitespace-pre-wrap font-sans">{memory.content}</pre>
              <button
                onClick={() => setShowFullContent(false)}
                className="text-primary-500 hover:text-primary-600 text-sm ml-2"
              >
                收起
              </button>
            </div>
          ) : (
            <div>
              {memory.content.length > 100 ? (
                <>
                  <pre className="whitespace-pre-wrap font-sans inline">{memory.content.substring(0, 100)}</pre>...
                  <button
                    onClick={() => setShowFullContent(true)}
                    className="text-primary-500 hover:text-primary-600 text-sm ml-2"
                  >
                    展开
                  </button>
                </>
              ) : (
                <pre className="whitespace-pre-wrap font-sans">{memory.content}</pre>
              )}
            </div>
          )}
        </div>
      </div>

      {memory.type === 'photo' && 'imageUrl' in memory && memory.imageUrl && (
        <div className="mb-4">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {memory.type === 'video' && 'videoUrl' in memory && memory.videoUrl && (
        <div className="mb-4">
          <video
            src={memory.videoUrl}
            controls
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {memory.tags.length > 0 && (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {memory.tags.map((tag, index) => (
              <span
                key={index}
                className={getTagClasses(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 