'use client';

import { useState } from 'react';
import { X, Upload, MessageCircle, AlertCircle } from 'lucide-react';
import { Conversation } from '@/types';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (memories: Conversation[]) => void;
}

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<Conversation[]>([]);

  const processText = () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const memories: Conversation[] = [];
      
      lines.forEach((line, index) => {
        // 尝试解析每一行
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const memory: Conversation = {
            id: crypto.randomUUID(),
            type: 'conversation',
            title: `哈哈的对话 ${index + 1}`,
            content: trimmedLine,
            date: new Date().toISOString().split('T')[0], // 使用今天的日期
            tags: ['导入', '哈哈'],
            childName: '哈哈',
            age: '',
            context: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          memories.push(memory);
        }
      });
      
      setPreview(memories);
    } catch (error) {
      console.error('处理文本失败:', error);
      alert('处理文本失败，请检查格式');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setText('');
    setPreview([]);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">导入哈哈的对话</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">导入说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 将 Word 文档中的内容复制粘贴到下面的文本框</li>
                  <li>• 每行将作为一条独立的对话记录</li>
                  <li>• 系统会自动为每条记录生成标题</li>
                  <li>• 所有记录将使用今天的日期</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              粘贴哈哈的对话内容
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="将哈哈说的话复制粘贴到这里，每行一句..."
            />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                共 {text.split('\n').filter(line => line.trim()).length} 行内容
              </span>
              <button
                type="button"
                onClick={processText}
                disabled={!text.trim() || isProcessing}
                className="btn-primary text-sm"
              >
                {isProcessing ? '处理中...' : '处理文本'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                预览 ({preview.length} 条记录)
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {preview.map((memory, index) => (
                  <div key={memory.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{memory.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{memory.content}</p>
                        <p className="text-xs text-gray-500 mt-1">日期: {memory.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={preview.length === 0}
              className="btn-primary"
            >
              导入 {preview.length} 条记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 