'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageCircle, Camera, Edit, Trash2, Tag } from 'lucide-react';
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
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {getTypeIcon()}
          <span className="text-xs sm:text-sm font-medium text-gray-600">{getTypeLabel()}</span>
          <span className="text-xs sm:text-sm text-gray-400">•</span>
          <span className="text-xs sm:text-sm text-gray-500 truncate">{formatDate(memory.date)}</span>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => onEdit(memory)}
            className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="p-1.5 sm:p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{memory.title}</h3>
      
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
                className="text-primary-500 hover:text-primary-600 text-xs sm:text-sm ml-2 mt-1"
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
                    className="text-primary-500 hover:text-primary-600 text-xs sm:text-sm ml-2"
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

      {memory.type === 'photo' && 'imageUrls' in memory && (
        <div className="mb-4">
          {/* 向后兼容：先检查 imageUrls，再检查 imageUrl */}
          {(() => {
            const photo = memory as any;
            const images = photo.imageUrls || (photo.imageUrl ? [photo.imageUrl] : []);
            
            if (images.length === 0) return null;
            
            if (images.length === 1) {
              return (
                <img
                  src={images[0]}
                  alt={memory.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              );
            }
            
            return (
              <div className="grid grid-cols-2 gap-2">
                {images.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${memory.title} - ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            );
          })()} 
        </div>
      )}


      {memory.tags.length > 0 && (
        <div className="flex items-start space-x-2 mt-3">
          <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex flex-wrap gap-1 min-w-0">
            {memory.tags.map((tag, index) => (
              <span
                key={index}
                className={`${getTagClasses(tag)} text-xs`}
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