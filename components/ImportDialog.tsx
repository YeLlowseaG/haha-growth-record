'use client';

import { useState } from 'react';
import { X, Upload, MessageCircle, AlertCircle, Settings, Brain, Zap } from 'lucide-react';
import { Conversation } from '@/types';
import { AIService } from '@/lib/ai-service';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (memories: Conversation[]) => void;
}

interface ProcessingOptions {
  useAI: boolean;
  preferredAPI: 'qwen' | 'deepseek';
}

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<Conversation[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>({
    useAI: true,
    preferredAPI: 'qwen',
  });

  // 初始化AI服务
  const aiService = new AIService({
    qwenKey: 'sk-4b37b09662a44a90bb62a953d0f22aed',
    deepseekKey: 'sk-b86a70e55ae5489497b0e6980130e481',
  });



  const processText = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    try {
      console.log('开始AI处理，使用API:', options.preferredAPI);
      const aiResults = await aiService.processText(text, options.preferredAPI);
      console.log('AI处理结果:', aiResults);
      
      if (!aiResults || aiResults.length === 0) {
        throw new Error('AI返回空结果');
      }
      
      const memories: Conversation[] = aiResults.map((result, index) => ({
        id: crypto.randomUUID(),
        type: 'conversation' as const,
        title: `哈哈的对话 ${index + 1}`,
        content: result.content,
        date: result.date || new Date().toISOString().split('T')[0],
        tags: result.tags,
        childName: '哈哈',
        age: '',
        context: result.context || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      console.log('AI处理成功，生成', memories.length, '条记录');
      setPreview(memories);
    } catch (error) {
      console.error('AI处理失败:', error);
      alert('AI处理失败，请检查网络连接或API密钥');
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
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">智能导入哈哈的对话</h2>
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
                <h3 className="text-sm font-medium text-blue-900 mb-2">智能导入说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 将 Word 文档中的内容复制粘贴到下面的文本框</li>
                  <li>• 可选择使用AI智能处理或传统方法处理</li>
                  <li>• AI会智能识别句子、日期、上下文和情感</li>
                  <li>• 自动合并相关的对话，保持对话的完整性</li>
                  <li>• 支持多种日期格式：2024年1月1日、1月1日、2024-01-01等</li>
                  <li>• 自动生成相关标签，如"好奇"、"兴奋"、"家人"等</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">处理选项</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.useAI}
                  onChange={(e) => setOptions({...options, useAI: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  AI智能处理
                </span>
              </label>
            </div>
            
            {/* AI API 选择 */}
            {options.useAI && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-900">选择AI服务</span>
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ai-api"
                      value="qwen"
                      checked={options.preferredAPI === 'qwen'}
                      onChange={(e) => setOptions({...options, preferredAPI: e.target.value as 'qwen' | 'deepseek'})}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Qwen (推荐)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ai-api"
                      value="deepseek"
                      checked={options.preferredAPI === 'deepseek'}
                      onChange={(e) => setOptions({...options, preferredAPI: e.target.value as 'qwen' | 'deepseek'})}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">DeepSeek</span>
                  </label>
                </div>
              </div>
            )}
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
              placeholder="将哈哈说的话复制粘贴到这里，支持多种格式..."
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
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {options.useAI ? 'AI处理中...' : '智能处理中...'}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {options.useAI ? <Brain className="h-4 w-4 mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
                    {options.useAI ? 'AI智能处理' : '智能处理'}
                  </span>
                )}
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
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">日期: {memory.date}</p>
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
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