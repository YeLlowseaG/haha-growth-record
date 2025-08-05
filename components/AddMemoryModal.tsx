'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Camera, Tag } from 'lucide-react';
import FileUpload from './FileUpload';
import { MemoryType, Conversation, Photo } from '@/types';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: MemoryType) => void;
  editingMemory?: MemoryType;
}

export default function AddMemoryModal({ isOpen, onClose, onSave, editingMemory }: AddMemoryModalProps) {
  const [type, setType] = useState<'conversation' | 'photo'>(editingMemory?.type || 'conversation');
  const [title, setTitle] = useState(editingMemory?.title || '');
  const [content, setContent] = useState(editingMemory?.content || '');
  const [date, setDate] = useState(editingMemory?.date || new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState(editingMemory?.tags?.join(', ') || '');
  
  // Conversation specific fields - 默认填入哈哈的信息
  const [childName, setChildName] = useState(
    editingMemory?.type === 'conversation' ? (editingMemory as Conversation).childName : '哈哈'
  );
  const [age, setAge] = useState(
    editingMemory?.type === 'conversation' ? (editingMemory as Conversation).age : ''
  );
  const [context, setContext] = useState(
    editingMemory?.type === 'conversation' ? (editingMemory as Conversation).context || '' : ''
  );
  
  // Photo specific fields
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    editingMemory?.type === 'photo' ? 
      (editingMemory as Photo).imageUrls || 
      ((editingMemory as Photo).imageUrl ? [(editingMemory as Photo).imageUrl!] : []) 
      : []
  );

  // 更新状态当editingMemory变化时
  useEffect(() => {
    if (editingMemory) {
      setType(editingMemory.type);
      setTitle(editingMemory.title);
      setContent(editingMemory.content);
      setDate(editingMemory.date);
      setTags(editingMemory.tags?.join(', ') || '');
      
      if (editingMemory.type === 'conversation') {
        const conversation = editingMemory as Conversation;
        setChildName(conversation.childName);
        setAge(conversation.age);
        setContext(conversation.context || '');
      } else {
        setChildName('哈哈');
        setAge('');
        setContext('');
      }
      
      if (editingMemory.type === 'photo') {
        const photo = editingMemory as Photo;
        setMediaUrls(photo.imageUrls || (photo.imageUrl ? [photo.imageUrl] : []));
      } else {
        setMediaUrls([]);
      }
    } else {
      // 重置为默认值
      setType('conversation');
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
      setTags('');
      setChildName('哈哈');
      setAge('');
      setContext('');
      setMediaUrls([]);
    }
  }, [editingMemory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const now = new Date().toISOString();
    
    let memory: MemoryType;
    
    if (type === 'conversation') {
      memory = {
        id: editingMemory?.id || crypto.randomUUID(),
        type: 'conversation',
        title,
        content,
        date,
        tags: tagArray,
        childName,
        age,
        context: context || undefined,
        createdAt: editingMemory?.createdAt || now,
        updatedAt: now,
      } as Conversation;
    } else {
      memory = {
        id: editingMemory?.id || crypto.randomUUID(),
        type: 'photo',
        title,
        content,
        date,
        tags: tagArray,
        imageUrls: mediaUrls,
        imageUrl: mediaUrls[0] || undefined, // 向后兼容
        createdAt: editingMemory?.createdAt || now,
        updatedAt: now,
      } as Photo;
    }
    
    onSave(memory);
    handleClose();
  };

  const handleClose = () => {
    setType('conversation');
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setTags('');
    setChildName('哈哈');
    setAge('');
    setContext('');
    setMediaUrls([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {editingMemory ? '编辑哈哈的记录' : '记录哈哈的新瞬间'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">记录类型</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { type: 'conversation' as const, icon: MessageCircle, label: '哈哈的对话', color: 'blue' },
                { type: 'photo' as const, icon: Camera, label: '哈哈的照片', color: 'green' },
              ].map(({ type: optionType, icon: Icon, label, color }) => (
                <button
                  key={optionType}
                  type="button"
                  onClick={() => setType(optionType)}
                  className={`p-3 sm:p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    type === optionType
                      ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${type === optionType ? `text-${color}-500` : 'text-gray-400'}`} />
                  <span className="text-xs sm:text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                placeholder="哈哈今天做了什么可爱的事..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                required
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm sm:text-base whitespace-pre-wrap resize-none"
              style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
              placeholder="详细描述哈哈这个可爱的瞬间..."
              required
            />
          </div>

          {/* Conversation Specific Fields */}
          {type === 'conversation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  placeholder="例如：2岁3个月"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">对话背景（可选）</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base resize-none"
                  placeholder="描述哈哈说这句话的背景..."
                />
              </div>
            </div>
          )}

          {/* File Upload for Photo */}
          {type === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                上传哈哈的照片
              </label>
              
              <FileUpload
                type={type}
                onFileUpload={setMediaUrls}
                currentUrls={mediaUrls}
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                placeholder="用逗号分隔多个标签，例如：可爱, 搞笑, 成长, 哈哈"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto order-1 sm:order-2"
            >
              {editingMemory ? '保存修改' : '记录哈哈'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 