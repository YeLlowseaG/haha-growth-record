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
  splitBySentences: boolean;
  mergeShortLines: boolean;
  extractDates: boolean;
  autoTag: boolean;
  useAI: boolean;
  preferredAPI: 'qwen' | 'deepseek';
}

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<Conversation[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>({
    splitBySentences: true,
    mergeShortLines: true,
    extractDates: true,
    autoTag: true,
    useAI: true,
    preferredAPI: 'qwen',
  });

  // 初始化AI服务
  const aiService = new AIService({
    qwenKey: 'sk-4b37b09662a44a90bb62a953d0f22aed',
    deepseekKey: 'sk-b86a70e55ae5489497b0e6980130e481',
  });

  // 智能分割文本为句子
  const splitIntoSentences = (text: string): string[] => {
    // 按句号、问号、感叹号分割，但保留引号内的内容
    const sentences = text.split(/(?<=[。！？])\s*/).filter(s => s.trim());
    return sentences;
  };

  // 合并相关对话
  const mergeRelatedConversations = (sentences: string[]): string[] => {
    const merged: string[] = [];
    let currentGroup: string[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const nextSentence = sentences[i + 1];
      
      // 添加到当前组
      currentGroup.push(sentence);
      
      // 判断是否应该结束当前组
      const shouldEndGroup = () => {
        // 如果这是最后一个句子，结束组
        if (i === sentences.length - 1) return true;
        
        // 如果下一句是新的主题（包含特定关键词），结束组
        const nextKeywords = ['然后', '接着', '后来', '过了一会儿', '第二天', '今天', '明天'];
        if (nextSentence && nextKeywords.some(keyword => nextSentence.includes(keyword))) {
          return true;
        }
        
        // 如果当前组已经有3个以上的句子，结束组
        if (currentGroup.length >= 3) return true;
        
        // 如果下一句很短（少于5个字符），可能是语气词，继续组
        if (nextSentence && nextSentence.length < 5) return false;
        
        // 如果当前句和下一句之间有明显的主题转换，结束组
        const currentTopics = ['妈妈', '爸爸', '奶奶', '爷爷', '老师', '小朋友'];
        const nextTopics = ['妈妈', '爸爸', '奶奶', '爷爷', '老师', '小朋友'];
        
        const currentHasTopic = currentTopics.some(topic => sentence.includes(topic));
        const nextHasTopic = nextTopics.some(topic => nextSentence.includes(topic));
        
        if (currentHasTopic && nextHasTopic && !sentence.includes(nextSentence.split('')[0])) {
          return true;
        }
        
        return false;
      };
      
      if (shouldEndGroup()) {
        // 合并当前组
        if (currentGroup.length > 0) {
          merged.push(currentGroup.join(' '));
          currentGroup = [];
        }
      }
    }
    
    return merged;
  };

  // 合并短行
  const mergeShortLines = (lines: string[]): string[] => {
    const merged: string[] = [];
    let currentLine = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 如果当前行很短（少于10个字符），尝试合并到下一行
      if (currentLine && currentLine.length < 10 && !currentLine.endsWith('。') && !currentLine.endsWith('！') && !currentLine.endsWith('？')) {
        currentLine += trimmed;
      } else {
        if (currentLine) {
          merged.push(currentLine);
        }
        currentLine = trimmed;
      }
    }

    if (currentLine) {
      merged.push(currentLine);
    }

    return merged;
  };

  // 提取日期信息
  const extractDate = (text: string): { date: string; cleanText: string } => {
    // 匹配常见的日期格式
    const datePatterns = [
      /(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{1,2})月(\d{1,2})日/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let year = new Date().getFullYear();
        let month = 1;
        let day = 1;

        if (pattern.source.includes('年')) {
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else if (pattern.source.includes('-')) {
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else if (pattern.source.includes('/')) {
          month = parseInt(match[1]);
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const cleanText = text.replace(pattern, '').trim();
        return { date, cleanText };
      }
    }

    return { date: new Date().toISOString().split('T')[0], cleanText: text };
  };

  // 自动生成标签
  const generateTags = (text: string): string[] => {
    const tags = ['导入', '哈哈'];
    
    // 根据内容自动添加标签
    if (text.includes('妈妈') || text.includes('爸爸')) tags.push('家人');
    if (text.includes('？') || text.includes('什么') || text.includes('为什么')) tags.push('好奇');
    if (text.includes('！') || text.includes('哇') || text.includes('好')) tags.push('兴奋');
    if (text.includes('不') || text.includes('不要')) tags.push('拒绝');
    if (text.includes('谢谢') || text.includes('谢谢')) tags.push('礼貌');
    if (text.includes('玩') || text.includes('游戏')) tags.push('游戏');
    if (text.includes('吃') || text.includes('饭')) tags.push('饮食');
    if (text.includes('睡') || text.includes('觉')) tags.push('睡眠');
    
    return tags;
  };

  const processText = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    try {
      let memories: Conversation[] = [];

      if (options.useAI) {
        // 使用AI处理
        try {
          const aiResults = await aiService.processText(text, options.preferredAPI);
          
          memories = aiResults.map((result, index) => ({
            id: crypto.randomUUID(),
            type: 'conversation',
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
        } catch (aiError) {
          console.error('AI处理失败，使用备用方法:', aiError);
          // 如果AI处理失败，使用传统方法
          memories = processWithTraditionalMethod();
        }
      } else {
        // 使用传统方法处理
        memories = processWithTraditionalMethod();
      }
      
      setPreview(memories);
    } catch (error) {
      console.error('处理文本失败:', error);
      alert('处理文本失败，请检查格式');
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithTraditionalMethod = (): Conversation[] => {
    let processedLines: string[] = [];

    if (options.splitBySentences) {
      // 按句子分割
      const sentences = splitIntoSentences(text);
      // 合并相关对话
      processedLines = mergeRelatedConversations(sentences);
    } else {
      // 按行分割
      processedLines = text.split('\n').filter(line => line.trim());
    }

    if (options.mergeShortLines && !options.splitBySentences) {
      // 合并短行（仅在按行分割时使用）
      processedLines = mergeShortLines(processedLines);
    }

    const memories: Conversation[] = [];
    
    processedLines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // 提取日期
        const { date, cleanText } = options.extractDates ? extractDate(trimmedLine) : {
          date: new Date().toISOString().split('T')[0],
          cleanText: trimmedLine
        };

        // 生成标签
        const tags = options.autoTag ? generateTags(cleanText) : ['导入', '哈哈'];

        const memory: Conversation = {
          id: crypto.randomUUID(),
          type: 'conversation',
          title: `哈哈的对话 ${index + 1}`,
          content: cleanText,
          date: date,
          tags: tags,
          childName: '哈哈',
          age: '',
          context: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memories.push(memory);
      }
    });

    return memories;
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
            <div className="grid grid-cols-2 gap-4">
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
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.splitBySentences}
                  onChange={(e) => setOptions({...options, splitBySentences: e.target.checked})}
                  disabled={options.useAI}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">智能分割并合并相关对话</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.mergeShortLines}
                  onChange={(e) => setOptions({...options, mergeShortLines: e.target.checked})}
                  disabled={options.useAI}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">合并短行</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.extractDates}
                  onChange={(e) => setOptions({...options, extractDates: e.target.checked})}
                  disabled={options.useAI}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">提取日期</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.autoTag}
                  onChange={(e) => setOptions({...options, autoTag: e.target.checked})}
                  disabled={options.useAI}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">自动标签</span>
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